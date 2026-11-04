"use strict";

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const paymentMethods = ["cash", "card", "bank transfer"];
const paymentStatuses = ["completed", "completed", "completed", "pending", "failed"]; // Weighted towards completed

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all enrolments with their program tuition
    const [enrolments] = await queryInterface.sequelize.query(
      `SELECT e.id, e.user_id, e.enrolment_date, e.status, p.tuition
       FROM enrolments e
       JOIN programs p ON e.program_id = p.id
       WHERE e.status IN ('enrolled', 'completed')
       ORDER BY e.id`
    );

    const payments = [];
    const usedPaymentDates = new Map(); // Track used dates per enrolment

    for (const enrolment of enrolments) {
      const tuition = parseFloat(enrolment.tuition);
      const enrolmentDate = new Date(enrolment.enrolment_date);
      
      // Initialize used dates for this enrolment
      if (!usedPaymentDates.has(enrolment.id)) {
        usedPaymentDates.set(enrolment.id, new Set());
      }
      const usedDates = usedPaymentDates.get(enrolment.id);
      
      // Determine number of payments (1-4 installments)
      const numPayments = getRandomInt(1, 4);
      const amountPerPayment = tuition / numPayments;
      
      let remainingAmount = tuition;
      
      for (let i = 0; i < numPayments; i++) {
        // Payment date: spread across enrolment period
        const daysAfterEnrolment = getRandomInt(i * 30, (i + 1) * 45);
        let paymentDate = new Date(enrolmentDate.getTime() + daysAfterEnrolment * 24 * 60 * 60 * 1000);
        
        // Don't create future payments beyond today
        if (paymentDate > new Date()) continue;
        
        // Ensure unique payment date per enrolment
        const dateKey = paymentDate.toISOString().split('T')[0];
        if (usedDates.has(dateKey)) {
          // Add a day until we find an unused date
          while (usedDates.has(paymentDate.toISOString().split('T')[0]) && paymentDate <= new Date()) {
            paymentDate = new Date(paymentDate.getTime() + 24 * 60 * 60 * 1000);
          }
          if (paymentDate > new Date()) continue;
        }
        usedDates.add(paymentDate.toISOString().split('T')[0]);
        
        let amount;
        if (i === numPayments - 1) {
          amount = parseFloat(remainingAmount.toFixed(2));
        } else {
          amount = parseFloat((amountPerPayment + (Math.random() - 0.5) * 10000).toFixed(2));
          remainingAmount -= amount;
        }
        
        const status = getRandomItem(paymentStatuses);
        const method = getRandomItem(paymentMethods);
        
        // If payment failed or pending, maybe add a retry payment (on a different date)
        if (status === "failed" && i < numPayments - 1 && Math.random() < 0.5) {
          // Add a retry payment a few days later
          let retryDate = new Date(paymentDate.getTime() + getRandomInt(1, 7) * 24 * 60 * 60 * 1000);
          if (retryDate <= new Date()) {
            const retryDateKey = retryDate.toISOString().split('T')[0];
            if (!usedDates.has(retryDateKey)) {
              usedDates.add(retryDateKey);
              payments.push({
                enrolment_id: enrolment.id,
                amount: amount,
                payment_date: retryDateKey,
                payment_method: method,
                status: "completed",
                created_at: retryDate,
                updated_at: retryDate
              });
            }
          }
        }
        
        payments.push({
          enrolment_id: enrolment.id,
          amount: amount,
          payment_date: paymentDate.toISOString().split('T')[0],
          payment_method: method,
          status: status,
          created_at: paymentDate,
          updated_at: paymentDate
        });
      }
    }

    // Also add some payments for completed enrolments that might have full payment history
    const [completedEnrolments] = await queryInterface.sequelize.query(
      `SELECT e.id, e.enrolment_date, p.tuition
       FROM enrolments e
       JOIN programs p ON e.program_id = p.id
       WHERE e.status = 'completed'
       ORDER BY e.id`
    );

    for (const enrolment of completedEnrolments) {
      const tuition = parseFloat(enrolment.tuition);
      const enrolmentDate = new Date(enrolment.enrolment_date);
      
      // Initialize used dates if not exists
      if (!usedPaymentDates.has(enrolment.id)) {
        usedPaymentDates.set(enrolment.id, new Set());
      }
      const usedDates = usedPaymentDates.get(enrolment.id);
      
      // Completed students likely paid in full - add 1-2 more payments if not enough
      const existingPayments = payments.filter(p => p.enrolment_id === enrolment.id);
      const totalPaid = existingPayments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid < tuition * 0.9) { // If less than 90% paid, add more
        const remaining = tuition - totalPaid;
        const numAdditional = getRandomInt(1, 2);
        
        for (let i = 0; i < numAdditional; i++) {
          const daysAfter = getRandomInt(30, 120);
          let paymentDate = new Date(enrolmentDate.getTime() + daysAfter * 24 * 60 * 60 * 1000);
          
          if (paymentDate > new Date()) continue;
          
          // Ensure unique payment date
          const dateKey = paymentDate.toISOString().split('T')[0];
          if (usedDates.has(dateKey)) {
            while (usedDates.has(paymentDate.toISOString().split('T')[0]) && paymentDate <= new Date()) {
              paymentDate = new Date(paymentDate.getTime() + 24 * 60 * 60 * 1000);
            }
            if (paymentDate > new Date()) continue;
          }
          usedDates.add(paymentDate.toISOString().split('T')[0]);
          
          const amount = i === numAdditional - 1 ? remaining : remaining / numAdditional;
          
          payments.push({
            enrolment_id: enrolment.id,
            amount: parseFloat(amount.toFixed(2)),
            payment_date: paymentDate.toISOString().split('T')[0],
            payment_method: getRandomItem(paymentMethods),
            status: "completed",
            created_at: paymentDate,
            updated_at: paymentDate
          });
        }
      }
    }

    await queryInterface.bulkInsert("payments", payments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("payments", null, {});
  }
};