"use strict";

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all student users and programs
    const [studentUsers] = await queryInterface.sequelize.query(
      `SELECT u.id FROM users u 
       JOIN students s ON u.id = s.user_id 
       WHERE u.role = 'student' AND u.is_active = true
       ORDER BY u.id`
    );
    const [programs] = await queryInterface.sequelize.query(
      `SELECT id, tuition FROM programs WHERE is_active = true ORDER BY id`
    );

    const enrolments = [];
    const statuses = ["enrolled", "completed", "dropped"];
    const statusWeights = [0.6, 0.3, 0.1]; // 60% enrolled, 30% completed, 10% dropped

    const enrolmentStartDate = new Date("2023-06-01");
    const enrolmentEndDate = new Date("2024-11-01");

    for (const student of studentUsers) {
      // Each student enrolls in 1-3 programs
      const numEnrolments = getRandomInt(1, 3);
      const shuffledPrograms = [...programs].sort(() => 0.5 - Math.random());
      const selectedPrograms = shuffledPrograms.slice(0, numEnrolments);

      for (const program of selectedPrograms) {
        const enrolmentDate = getRandomDate(enrolmentStartDate, enrolmentEndDate);
        
        // Weighted random status
        const rand = Math.random();
        let status;
        if (rand < statusWeights[0]) status = "enrolled";
        else if (rand < statusWeights[0] + statusWeights[1]) status = "completed";
        else status = "dropped";

        // If completed, enrolment date should be at least 3 months ago
        let finalEnrolmentDate = enrolmentDate;
        if (status === "completed" && enrolmentDate > new Date("2024-08-01")) {
          finalEnrolmentDate = new Date("2024-05-01");
        }

        enrolments.push({
          user_id: student.id,
          program_id: program.id,
          enrolment_date: finalEnrolmentDate,
          status: status,
          enrolled_at: finalEnrolmentDate,
          created_at: finalEnrolmentDate,
          updated_at: finalEnrolmentDate
        });
      }
    }

    await queryInterface.bulkInsert("enrolments", enrolments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("enrolments", null, {});
  }
};