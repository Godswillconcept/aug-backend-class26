"use strict";

const programs = [
  {
    name: "Full Stack Web Development Bootcamp",
    program_code: "FSWD-BOOTCAMP-2024",
    description: "Intensive 6-month full-stack web development program covering frontend, backend, databases, DevOps, and cloud deployment. Designed for career switchers and fresh graduates. Includes capstone project, career coaching, and job placement support.",
    tuition: 450000.00,
    is_active: true
  },
  {
    name: "Data Science & Machine Learning Program",
    program_code: "DSML-PROG-2024",
    description: "Comprehensive data science curriculum from Python fundamentals to advanced ML and deep learning. Covers statistics, data visualization, ML algorithms, NLP, computer vision, and MLOps. Real-world projects with Nigerian datasets.",
    tuition: 500000.00,
    is_active: true
  },
  {
    name: "Cybersecurity Professional Certification",
    program_code: "CYBER-PRO-2024",
    description: "Industry-aligned cybersecurity program covering ethical hacking, penetration testing, SOC operations, incident response, and compliance. Prepares for CEH, OSCP, and CompTIA Security+ certifications. Hands-on labs with real attack scenarios.",
    tuition: 550000.00,
    is_active: true
  },
  {
    name: "Cloud Computing & DevOps Engineering",
    program_code: "CLOUD-DEVOPS-2024",
    description: "Multi-cloud program covering AWS, Azure, and GCP with deep DevOps practices. Infrastructure as Code, CI/CD, Kubernetes, monitoring, and SRE principles. Includes cloud certification preparation.",
    tuition: 480000.00,
    is_active: true
  },
  {
    name: "Mobile App Development Specialization",
    program_code: "MOBILE-DEV-2024",
    description: "Cross-platform mobile development with Flutter and React Native. From basics to advanced architecture, state management, testing, and app store deployment. Build portfolio apps for iOS and Android.",
    tuition: 400000.00,
    is_active: true
  },
  {
    name: "UI/UX Product Design Program",
    program_code: "UX-DESIGN-2024",
    description: "End-to-end product design program: user research, interaction design, visual design, design systems, prototyping, and usability testing. Figma mastery and portfolio development for Nigerian tech market.",
    tuition: 350000.00,
    is_active: true
  },
  {
    name: "Backend Engineering Mastery",
    program_code: "BACKEND-ENG-2024",
    description: "Deep backend specialization: Node.js, Python, Go, databases, microservices, message queues, caching, and system design. Build scalable APIs handling millions of requests. Prepare for senior backend roles.",
    tuition: 420000.00,
    is_active: true
  },
  {
    name: "Frontend Engineering Excellence",
    program_code: "FRONTEND-ENG-2024",
    description: "Advanced frontend program: React, Vue, TypeScript, performance optimization, testing, micro-frontends, and modern tooling. Build production-grade applications with excellent developer experience.",
    tuition: 400000.00,
    is_active: true
  },
  {
    name: "AI & Machine Learning Engineering",
    program_code: "AI-ML-ENG-2024",
    description: "Cutting-edge AI program: deep learning, LLMs, RAG, computer vision, MLOps, and generative AI applications. Build and deploy AI systems. Research-oriented with industry projects.",
    tuition: 600000.00,
    is_active: true
  },
  {
    name: "Blockchain & Web3 Development",
    program_code: "BLOCKCHAIN-WEB3-2024",
    description: "Complete Web3 development: Solidity smart contracts, DeFi, NFTs, dApp frontend, Layer 2s, and security auditing. Build portfolio projects on Ethereum, Polygon, and other EVM chains.",
    tuition: 450000.00,
    is_active: true
  },
  {
    name: "Game Development & Interactive Media",
    program_code: "GAME-DEV-2024",
    description: "Game development with Unity and Unreal Engine. 2D/3D game design, physics, animation, multiplayer, monetization, and publishing. Build a complete game for your portfolio.",
    tuition: 380000.00,
    is_active: true
  },
  {
    name: "IoT & Embedded Systems Engineering",
    program_code: "IOT-EMBEDDED-2024",
    description: "Hardware-focused program: microcontrollers, sensors, wireless protocols, edge computing, cloud IoT platforms, and industrial applications. Build smart agriculture, home automation, and industrial IoT solutions.",
    tuition: 350000.00,
    is_active: true
  },
  {
    name: "Software Quality Assurance & Test Automation",
    program_code: "SQA-TEST-2024",
    description: "Comprehensive QA program: manual testing, test automation (Playwright, Cypress), API testing, performance testing, test architecture, and CI/CD integration. Prepare for ISTQB certification.",
    tuition: 300000.00,
    is_active: true
  },
  {
    name: "Database Administration & Engineering",
    program_code: "DBA-ENG-2024",
    description: "Database engineering: PostgreSQL, MongoDB, Redis, data modeling, performance tuning, high availability, replication, backup strategies, and cloud database services (RDS, Atlas, ElastiCache).",
    tuition: 320000.00,
    is_active: true
  },
  {
    name: "Digital Skills Foundation Program",
    program_code: "DIGITAL-FOUND-2024",
    description: "Entry-level digital literacy program for beginners: computer basics, internet safety, productivity tools (Google Workspace/Microsoft 365), introduction to coding, and career exploration in tech.",
    tuition: 150000.00,
    is_active: true
  }
];

const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

module.exports = {
  async up(queryInterface, Sequelize) {
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2024-12-31");

    const programsWithTimestamps = programs.map(program => ({
      ...program,
      created_at: getRandomDate(startDate, endDate),
      updated_at: getRandomDate(startDate, endDate)
    }));

    await queryInterface.bulkInsert("programs", programsWithTimestamps, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("programs", null, {});
  }
};