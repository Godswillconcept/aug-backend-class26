"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all programs and courses
    const [programs] = await queryInterface.sequelize.query(
      `SELECT id, program_code FROM programs ORDER BY id`
    );
    const [courses] = await queryInterface.sequelize.query(
      `SELECT id, code FROM courses ORDER BY id`
    );

    const programCourses = [];

    // Define program-course mappings based on program codes and course codes
    const programCourseMap = {
      // Full Stack Web Development Bootcamp
      "FSWD-BOOTCAMP-2024": [
        "FSWD-MERN-101", "FSWD-DJANGO-101", "FSWD-NEXTJS-201",
        "BACKEND-NODE-101", "BACKEND-PYTHON-101", "FRONTEND-REACT-101",
        "DB-PGSQL-101", "DEVOPS-CICD-101", "QA-AUTO-101"
      ],
      // Data Science & Machine Learning Program
      "DSML-PROG-2024": [
        "DS-PYTHON-101", "DS-SQL-101", "DS-ML-201", "DS-POWERBI-101",
        "AI-PYTORCH-201", "AI-LLM-201", "AI-CV-201"
      ],
      // Cybersecurity Professional Certification
      "CYBER-PRO-2024": [
        "SEC-ETHICAL-101", "SEC-REDTEAM-201", "SEC-SOC-101",
        "BACKEND-NODE-101", "DB-PGSQL-101", "DEVOPS-CICD-101"
      ],
      // Cloud Computing & DevOps Engineering
      "CLOUD-DEVOPS-2024": [
        "CLOUD-AWS-101", "CLOUD-AZURE-101", "CLOUD-GCP-101",
        "DEVOPS-CICD-101", "DEVOPS-K8S-201", "DEVOPS-SRE-201",
        "BACKEND-GO-201", "DB-PGSQL-101"
      ],
      // Mobile App Development Specialization
      "MOBILE-DEV-2024": [
        "MOB-FLUTTER-101", "MOB-RN-101", "MOB-FLUTTER-201",
        "BACKEND-NODE-101", "FRONTEND-REACT-101", "QA-AUTO-101"
      ],
      // UI/UX Product Design Program
      "UX-DESIGN-2024": [
        "UX-UI-101", "UX-UI-201", "FRONTEND-REACT-101", "FRONTEND-VUE-101"
      ],
      // Backend Engineering Mastery
      "BACKEND-ENG-2024": [
        "BACKEND-NODE-101", "BACKEND-PYTHON-101", "BACKEND-GO-201",
        "DB-PGSQL-101", "DB-MONGO-101", "DEVOPS-CICD-101",
        "DEVOPS-K8S-201", "QA-API-101"
      ],
      // Frontend Engineering Excellence
      "FRONTEND-ENG-2024": [
        "FRONTEND-REACT-101", "FRONTEND-VUE-101", "FRONTEND-ADV-201",
        "UX-UI-101", "QA-AUTO-101", "DEVOPS-CICD-101"
      ],
      // AI & Machine Learning Engineering
      "AI-ML-ENG-2024": [
        "DS-PYTHON-101", "DS-ML-201", "AI-PYTORCH-201", "AI-LLM-201",
        "AI-CV-201", "BACKEND-PYTHON-101", "DEVOPS-K8S-201"
      ],
      // Blockchain & Web3 Development
      "BLOCKCHAIN-WEB3-2024": [
        "BLOCK-ETH-101", "BLOCK-WEB3-101", "FRONTEND-REACT-101",
        "BACKEND-NODE-101", "DEVOPS-CICD-101", "QA-API-101"
      ],
      // Game Development & Interactive Media
      "GAME-DEV-2024": [
        "GAME-UNITY-101", "GAME-UNREAL-101", "FRONTEND-REACT-101",
        "UX-UI-101", "BACKEND-NODE-101"
      ],
      // IoT & Embedded Systems Engineering
      "IOT-EMBEDDED-2024": [
        "IOT-ARDUINO-101", "IOT-PI-101", "BACKEND-PYTHON-101",
        "CLOUD-AWS-101", "DB-MONGO-101", "DEVOPS-CICD-101"
      ],
      // Software Quality Assurance & Test Automation
      "SQA-TEST-2024": [
        "QA-AUTO-101", "QA-API-101", "BACKEND-NODE-101",
        "FRONTEND-REACT-101", "DEVOPS-CICD-101", "DB-PGSQL-101"
      ],
      // Database Administration & Engineering
      "DBA-ENG-2024": [
        "DB-PGSQL-101", "DB-MONGO-101", "BACKEND-PYTHON-101",
        "DEVOPS-CICD-101", "DEVOPS-SRE-201", "CLOUD-AWS-101"
      ],
      // Digital Skills Foundation Program
      "DIGITAL-FOUND-2024": [
        "DS-PYTHON-101", "FRONTEND-REACT-101", "UX-UI-101",
        "QA-AUTO-101"
      ]
    };

    // Create a map for quick course lookup
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course.code] = course.id;
    });

    // Create program-course relationships
    for (const program of programs) {
      const courseCodes = programCourseMap[program.program_code] || [];
      
      courseCodes.forEach((courseCode, index) => {
        const courseId = courseMap[courseCode];
        if (courseId) {
          programCourses.push({
            program_id: program.id,
            course_id: courseId,
            sequence: index + 1,
            is_required: index < courseCodes.length - 2 ? true : false, // Last 2 courses optional
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    }

    await queryInterface.bulkInsert("program_courses", programCourses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("program_courses", null, {});
  }
};