"use strict";

const instructorBios = [
  "Experienced software engineer with over 8 years building scalable web applications. Passionate about mentoring the next generation of Nigerian developers.",
  "Full-stack developer and technical lead with expertise in React, Node.js, and cloud architectures. Has trained over 500 students across Nigeria.",
  "Data scientist and ML engineer with experience in fintech and e-commerce. Published researcher in African language NLP.",
  "Cybersecurity specialist with CISSP and CEH certifications. Former security consultant for major Nigerian banks.",
  "Cloud architect certified in AWS and Azure. Designed infrastructure for high-traffic Nigerian tech startups.",
  "DevOps engineer with deep experience in Kubernetes, Docker, and CI/CD pipelines. Open source contributor.",
  "UI/UX designer with a focus on African user contexts. Led design teams at top Nigerian tech companies.",
  "Backend specialist with 10+ years in Python, Go, and distributed systems. Former tech lead at Andela.",
  "Frontend expert in React, Vue, and modern JavaScript. Creator of popular Nigerian developer community resources.",
  "AI/ML researcher focusing on computer vision for African agriculture. PhD from University of Lagos.",
  "Database administrator with expertise in PostgreSQL, MongoDB, and Redis. Optimized systems handling millions of transactions.",
  "QA engineer and test automation specialist. Built testing frameworks for Nigerian fintech unicorns.",
  "Blockchain developer building DeFi solutions for African markets. Ethereum and Solana certified.",
  "Game developer using Unity and Unreal Engine. Created educational games for Nigerian primary schools.",
  "Embedded systems engineer working on IoT solutions for Nigerian agriculture and smart cities."
];

const specializations = [
  "Full Stack Web Development",
  "Mobile App Development",
  "Data Science & Analytics",
  "Cybersecurity",
  "Cloud Computing (AWS/Azure)",
  "DevOps Engineering",
  "UI/UX Design",
  "Backend Development (Node.js/Python)",
  "Frontend Development (React/Vue)",
  "Machine Learning & AI",
  "Database Administration",
  "Software Testing & QA",
  "Blockchain Development",
  "Game Development",
  "Embedded Systems & IoT"
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all instructor users (role = 'instructor')
    const [instructorUsers] = await queryInterface.sequelize.query(
      `SELECT id, gender FROM users WHERE role = 'instructor' ORDER BY id`
    );

    const instructors = [];

    for (let i = 0; i < instructorUsers.length; i++) {
      const user = instructorUsers[i];
      instructors.push({
        user_id: user.id,
        bio: instructorBios[i] || getRandomItem(instructorBios),
        specialization: specializations[i] || getRandomItem(specializations),
        years_experience: `${Math.floor(Math.random() * 10) + 5}`,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert("instructors", instructors, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("instructors", null, {});
  }
};