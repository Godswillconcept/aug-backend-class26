"use strict";

const nigerianFirstNames = {
  male: [
    "Adebayo", "Chinedu", "Olumide", "Tunde", "Babatunde", "Kunle", "Segun", "Femi", "Dele", "Yemi",
    "Emeka", "Ikechukwu", "Uchenna", "Chukwuma", "Nnamdi", "Obinna", "Chidi", "Emeka", "Kelechi", "Chukwudi",
    "Adewale", "Boluwatife", "Folarin", "Gbenga", "Ibrahim", "Jide", "Kayode", "Lanre", "Muyiwa", "Niyi",
    "Oluwaseun", "Oluwatobi", "Razaq", "Sani", "Tayo", "Uche", "Victor", "Wale", "Yusuf", "Zubairu"
  ],
  female: [
    "Adaeze", "Chidinma", "Oluchi", "Nneka", "Chioma", "Amara", "Ifunanya", "Ugochi", "Ngozi", "Adaobi",
    "Bisi", "Funmi", "Kemi", "Lola", "Modupe", "Nike", "Opeyemi", "Ronke", "Shade", "Titi",
    "Aisha", "Fatima", "Hauwa", "Khadija", "Maryam", "Rabi", "Saadat", "Zainab", "Amina", "Hafsa"
  ]
};

const nigerianLastNames = [
  "Adebayo", "Adekunle", "Adeleke", "Adeniyi", "Adewale", "Adesina", "Adetayo", "Adeyemi", "Adisa", "Afolabi",
  "Agbaje", "Ahmad", "Ahmed", "Aina", "Ajayi", "Akanbi", "Akande", "Akinbola", "Akinlabi", "Akinola",
  "Akintola", "Akinwale", "Alabi", "Aliyu", "Amusan", "Anjorin", "Asiru", "Atanda", "Awolowo", "Ayoade",
  "Babalola", "Babatunde", "Badejo", "Balogun", "Bashir", "Bello", "Bukar", "Chukwu", "Chukwuma", "Danjuma",
  "Daramola", "Dawodu", "Eze", "Ezekiel", "Fadayomi", "Fagbemi", "Fasuyi", "Fowowe", "Gbadamosi", "Hassan"
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const guardianNames = {
  male: ["Chief", "Alhaji", "Mr.", "Dr.", "Engr.", "Prof.", "Rev.", "Pastor"],
  female: ["Mrs.", "Dr.", "Prof.", "Alhaja", "Chief (Mrs.)", "Engr.", "Rev."]
};

const guardianLastNames = nigerianLastNames;

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const generateNigerianPhone = () => {
  const prefixes = ["080", "081", "070", "090", "080", "081", "070", "090"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${suffix}`;
};
const generateEmail = (firstName, lastName, index) => {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all student users (role = 'student')
    const [studentUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'student' ORDER BY id LIMIT 50`
    );

    const students = [];
    const startDate = new Date("2018-01-01");
    const endDate = new Date("2006-12-31"); // DOB range for 18-26 year olds

    for (let i = 0; i < studentUsers.length; i++) {
      const user = studentUsers[i];
      const gender = (await queryInterface.sequelize.query(
        `SELECT gender FROM users WHERE id = ${user.id}`
      ))[0][0]?.gender || "male";

      const guardianGender = getRandomItem(["male", "female"]);
      const guardianTitle = getRandomItem(guardianNames[guardianGender]);
      const guardianFirstName = getRandomItem(nigerianFirstNames[guardianGender]);
      const guardianLastName = getRandomItem(guardianLastNames);

      students.push({
        user_id: user.id,
        dob: getRandomDate(startDate, endDate),
        guardian_name: `${guardianTitle} ${guardianFirstName} ${guardianLastName}`,
        guardian_email: generateEmail(guardianFirstName, guardianLastName, i + 1000),
        guardian_phone: generateNigerianPhone(),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert("students", students, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("students", null, {});
  }
};