"use strict";

const bcrypt = require("bcryptjs");

const nigerianFirstNames = {
  male: [
    "Adebayo", "Chinedu", "Olumide", "Tunde", "Babatunde", "Kunle", "Segun", "Femi", "Dele", "Yemi",
    "Emeka", "Ikechukwu", "Uchenna", "Chukwuma", "Nnamdi", "Obinna", "Chidi", "Emeka", "Kelechi", "Chukwudi",
    "Adewale", "Boluwatife", "Folarin", "Gbenga", "Ibrahim", "Jide", "Kayode", "Lanre", "Muyiwa", "Niyi",
    "Oluwaseun", "Oluwatobi", "Razaq", "Sani", "Tayo", "Uche", "Victor", "Wale", "Yusuf", "Zubairu",
    "Abdul", "Ahmed", "Aliyu", "Bashir", "Danjuma", "Eze", "Garba", "Hamza", "Isa", "Jibril",
    "Kabiru", "Lawal", "Mahmoud", "Nasir", "Omar", "Rashid", "Suleiman", "Tahir", "Umar", "Yusuf"
  ],
  female: [
    "Adaeze", "Chidinma", "Oluchi", "Nneka", "Chioma", "Amara", "Ifunanya", "Ugochi", "Ngozi", "Adaobi",
    "Bisi", "Funmi", "Kemi", "Lola", "Modupe", "Nike", "Opeyemi", "Ronke", "Shade", "Titi",
    "Aisha", "Fatima", "Hauwa", "Khadija", "Maryam", "Rabi", "Saadat", "Zainab", "Amina", "Hafsa",
    "Bukola", "Damilola", "Folake", "Gbemisola", "Iyabo", "Jumoke", "Kehinde", "Morenike", "Nike", "Olufunke",
    "Rashida", "Sade", "Tayo", "Yetunde", "Zara", "Abike", "Bolanle", "Cynthia", "Dara", "Eniola",
    "Farida", "Grace", "Halima", "Ijeoma", "Joy", "Kemi", "Ladi", "Mariam", "Ngozi", "Oluwatoyin"
  ]
};

const nigerianLastNames = [
  "Adebayo", "Adekunle", "Adeleke", "Adeniyi", "Adewale", "Adesina", "Adetayo", "Adeyemi", "Adisa", "Afolabi",
  "Agbaje", "Ahmad", "Ahmed", "Aina", "Ajayi", "Akanbi", "Akande", "Akinbola", "Akinlabi", "Akinola",
  "Akintola", "Akinwale", "Alabi", "Aliyu", "Amusan", "Anjorin", "Asiru", "Atanda", "Awolowo", "Ayoade",
  "Babalola", "Babatunde", "Badejo", "Balogun", "Bashir", "Bello", "Bukar", "Chukwu", "Chukwuma", "Danjuma",
  "Daramola", "Dawodu", "Eze", "Ezekiel", "Fadayomi", "Fagbemi", "Fasuyi", "Fowowe", "Gbadamosi", "Hassan",
  "Ibrahim", "Idowu", "Ige", "Ijeoma", "Ike", "Ikenna", "Ilo", "Iro", "Ishola", "Jibril",
  "Kareem", "Kazeem", "Kolawole", "Lawal", "Makanjuola", "Musa", "Ndukwe", "Nwachukwu", "Nwankwo", "Nwosu",
  "Obasanjo", "Obi", "Obiora", "Odeyemi", "Odunlami", "Ogundele", "Ogunleye", "Ogunniyi", "Ojo", "Okafor",
  "Okereke", "Okonkwo", "Okoro", "Okoye", "Oladipo", "Oladipo", "Oladokun", "Olawole", "Olayiwola", "Olorunfemi",
  "Olubiyi", "Oludele", "Olufemi", "Olugbenga", "Olukayode", "Olumide", "Olusegun", "Olusola", "Oluwafemi", "Oluwakayode",
  "Oluwaseun", "Oluwatobi", "Oluwole", "Omotosho", "Onwuka", "Onwuchekwa", "Onyeka", "Onyekwere", "Onyema", "Opara",
  "Osagie", "Osborne", "Osei", "Oshodi", "Osinaike", "Osuji", "Oyinlola", "Oyewole", "Oyeyemi", "Raji",
  "Salami", "Salau", "Sani", "Shittu", "Sobowale", "Sodipo", "Solanke", "Sotunde", "Suleiman", "Taiwo",
  "Tijani", "Uche", "Uchechukwu", "Uchenna", "Udoh", "Ugboma", "Ugochukwu", "Uka", "Ukachi", "Umar",
  "Umeh", "Ume", "Uwakwe", "Uzoma", "Uzor", "Williams", "Yakubu", "Yusuf", "Zakari", "Zubairu"
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

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

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    const passwordHash = await hashPassword("Password@123");
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2024-12-31");

    // Admin users (3)
    const admins = [
      { first_name: "Adebayo", last_name: "Oladipo", middle_name: "Segun", email: "admin@nigerianit.edu.ng", role: "admin", gender: "male" },
      { first_name: "Fatima", last_name: "Abdullahi", middle_name: "Zahra", email: "registrar@nigerianit.edu.ng", role: "admin", gender: "female" },
      { first_name: "Chinedu", last_name: "Okonkwo", middle_name: "Emeka", email: "director@nigerianit.edu.ng", role: "admin", gender: "male" }
    ];

    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      users.push({
        first_name: admin.first_name,
        last_name: admin.last_name,
        middle_name: admin.middle_name,
        email: admin.email,
        password: passwordHash,
        role: admin.role,
        gender: admin.gender,
        is_active: true,
        address: `${Math.floor(Math.random() * 100) + 1} ${getRandomItem(["Adeola Odeku", "Isaac John", "Akin Adesola", "Ologun Agbaje", "Sanusi Fafunwa"])} Street, ${getRandomItem(["Victoria Island", "Ikoyi", "Lekki", "Ikeja", "Surulere"])}, ${getRandomItem(nigerianStates)}`,
        created_at: getRandomDate(startDate, endDate),
        updated_at: getRandomDate(startDate, endDate)
      });
    }

    // Instructor users (15)
    const instructorSpecializations = [
      "Full Stack Web Development", "Mobile App Development", "Data Science & Analytics", "Cybersecurity",
      "Cloud Computing (AWS/Azure)", "DevOps Engineering", "UI/UX Design", "Backend Development (Node.js/Python)",
      "Frontend Development (React/Vue)", "Machine Learning & AI", "Database Administration", "Software Testing & QA",
      "Blockchain Development", "Game Development", "Embedded Systems & IoT"
    ];

    for (let i = 0; i < 15; i++) {
      const gender = getRandomItem(["male", "female"]);
      const firstName = getRandomItem(nigerianFirstNames[gender]);
      const lastName = getRandomItem(nigerianLastNames);
      const middleName = getRandomItem(nigerianFirstNames[gender]);
      const index = i + 1;

      users.push({
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        email: generateEmail(firstName, lastName, index),
        password: passwordHash,
        role: "instructor",
        gender: gender,
        is_active: true,
        address: `${Math.floor(Math.random() * 100) + 1} ${getRandomItem(["Awolowo", "Herbert Macaulay", "Murtala Muhammed", "Nnamdi Azikiwe", "Obafemi Awolowo"])} Way, ${getRandomItem(["Yaba", "Surulere", "Ikeja", "Lekki", "Ajah"])}, ${getRandomItem(nigerianStates)}`,
        created_at: getRandomDate(startDate, endDate),
        updated_at: getRandomDate(startDate, endDate)
      });
    }

    // Student users (50)
    for (let i = 0; i < 50; i++) {
      const gender = getRandomItem(["male", "female"]);
      const firstName = getRandomItem(nigerianFirstNames[gender]);
      const lastName = getRandomItem(nigerianLastNames);
      const middleName = getRandomItem(nigerianFirstNames[gender]);
      const index = i + 100;

      users.push({
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        email: generateEmail(firstName, lastName, index),
        password: passwordHash,
        role: "student",
        gender: gender,
        is_active: true,
        address: `${Math.floor(Math.random() * 100) + 1} ${getRandomItem(["Bode Thomas", "Ademola Adetokunbo", "Kofo Abayomi", "Olu Holloway", "Adeyemo Alakija"])} Street, ${getRandomItem(["Lagos Mainland", "Lagos Island", "Epe", "Badagry", "Ikorodu"])}, ${getRandomItem(nigerianStates)}`,
        created_at: getRandomDate(startDate, endDate),
        updated_at: getRandomDate(startDate, endDate)
      });
    }

    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  }
};