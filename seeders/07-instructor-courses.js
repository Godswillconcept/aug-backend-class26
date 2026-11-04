"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all instructors and courses
    const [instructors] = await queryInterface.sequelize.query(
      `SELECT i.id, i.specialization FROM instructors i ORDER BY i.id`
    );
    const [courses] = await queryInterface.sequelize.query(
      `SELECT id, code FROM courses ORDER BY id`
    );

    const instructorCourses = [];

    // Map specializations to relevant course codes
    const specializationCourseMap = {
      "Full Stack Web Development": ["FSWD-MERN-101", "FSWD-DJANGO-101", "FSWD-NEXTJS-201", "FRONTEND-REACT-101", "BACKEND-NODE-101"],
      "Mobile App Development": ["MOB-FLUTTER-101", "MOB-RN-101", "MOB-FLUTTER-201"],
      "Data Science & Analytics": ["DS-PYTHON-101", "DS-ML-201", "DS-POWERBI-101", "DS-SQL-101"],
      "Cybersecurity": ["SEC-ETHICAL-101", "SEC-REDTEAM-201", "SEC-SOC-101"],
      "Cloud Computing (AWS/Azure)": ["CLOUD-AWS-101", "CLOUD-AZURE-101", "CLOUD-GCP-101"],
      "DevOps Engineering": ["DEVOPS-CICD-101", "DEVOPS-K8S-201", "DEVOPS-SRE-201"],
      "UI/UX Design": ["UX-UI-101", "UX-UI-201"],
      "Backend Development (Node.js/Python)": ["BACKEND-NODE-101", "BACKEND-PYTHON-101", "BACKEND-GO-201"],
      "Frontend Development (React/Vue)": ["FRONTEND-REACT-101", "FRONTEND-VUE-101", "FRONTEND-ADV-201"],
      "Machine Learning & AI": ["AI-PYTORCH-201", "AI-LLM-201", "AI-CV-201", "DS-ML-201"],
      "Database Administration": ["DB-PGSQL-101", "DB-MONGO-101"],
      "Software Testing & QA": ["QA-AUTO-101", "QA-API-101"],
      "Blockchain Development": ["BLOCK-ETH-101", "BLOCK-WEB3-101"],
      "Game Development": ["GAME-UNITY-101", "GAME-UNREAL-101"],
      "Embedded Systems & IoT": ["IOT-ARDUINO-101", "IOT-PI-101"]
    };

    // Create a map for quick course lookup
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course.code] = course.id;
    });

    // Assign courses to instructors based on specialization
    for (const instructor of instructors) {
      const relevantCourseCodes = specializationCourseMap[instructor.specialization] || [];
      
      // Each instructor teaches 2-4 courses from their specialization
      const numCourses = Math.min(relevantCourseCodes.length, Math.floor(Math.random() * 3) + 2);
      const shuffled = [...relevantCourseCodes].sort(() => 0.5 - Math.random());
      const selectedCourses = shuffled.slice(0, numCourses);

      selectedCourses.forEach((courseCode, index) => {
        const courseId = courseMap[courseCode];
        if (courseId) {
          instructorCourses.push({
            instructor_id: instructor.id,
            course_id: courseId,
            assigned_at: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000), // Random date within last year
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    }

    // Also assign some cross-specialization courses (instructors teaching related topics)
    const crossAssignments = [
      { specialization: "Full Stack Web Development", courses: ["DEVOPS-CICD-101", "DB-PGSQL-101", "QA-AUTO-101"] },
      { specialization: "Backend Development (Node.js/Python)", courses: ["DEVOPS-CICD-101", "DB-PGSQL-101", "CLOUD-AWS-101"] },
      { specialization: "Frontend Development (React/Vue)", courses: ["UX-UI-101", "DEVOPS-CICD-101", "QA-AUTO-101"] },
      { specialization: "Data Science & Analytics", courses: ["AI-PYTORCH-201", "BACKEND-PYTHON-101"] },
      { specialization: "Machine Learning & AI", courses: ["DS-ML-201", "DEVOPS-K8S-201"] },
      { specialization: "Cybersecurity", courses: ["BACKEND-NODE-101", "DEVOPS-CICD-101"] },
      { specialization: "DevOps Engineering", courses: ["CLOUD-AWS-101", "BACKEND-GO-201"] },
      { specialization: "Cloud Computing (AWS/Azure)", courses: ["DEVOPS-K8S-201", "BACKEND-GO-201"] },
      { specialization: "Mobile App Development", courses: ["BACKEND-NODE-101", "FRONTEND-REACT-101"] },
      { specialization: "Blockchain Development", courses: ["FRONTEND-REACT-101", "BACKEND-NODE-101"] },
    ];

    for (const assignment of crossAssignments) {
      const matchingInstructors = instructors.filter(i => i.specialization === assignment.specialization);
      if (matchingInstructors.length > 0) {
        const instructor = matchingInstructors[Math.floor(Math.random() * matchingInstructors.length)];
        const numCrossCourses = Math.min(assignment.courses.length, 2);
        const selected = assignment.courses.slice(0, numCrossCourses);

        selected.forEach(courseCode => {
          const courseId = courseMap[courseCode];
          if (courseId) {
            // Check if not already assigned
            const exists = instructorCourses.some(
              ic => ic.instructor_id === instructor.id && ic.course_id === courseId
            );
            if (!exists) {
              instructorCourses.push({
                instructor_id: instructor.id,
                course_id: courseId,
                assigned_at: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
        });
      }
    }

    await queryInterface.bulkInsert("instructor_courses", instructorCourses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("instructor_courses", null, {});
  }
};