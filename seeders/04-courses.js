"use strict";

const courses = [
  // Full Stack Web Development
  {
    title: "Full Stack Web Development with MERN Stack",
    code: "FSWD-MERN-101",
    description: "Comprehensive full-stack development course covering MongoDB, Express.js, React, and Node.js. Build production-ready applications with authentication, database design, RESTful APIs, and deployment.",
    duration: "16 weeks",
    is_active: true
  },
  {
    title: "Full Stack Web Development with Django & React",
    code: "FSWD-DJANGO-101",
    description: "Learn to build full-stack applications using Django REST Framework for backend and React for frontend. Covers Django models, serializers, authentication, and React hooks.",
    duration: "14 weeks",
    is_active: true
  },
  {
    title: "Advanced Full Stack: Next.js & TypeScript",
    code: "FSWD-NEXTJS-201",
    description: "Modern full-stack development with Next.js 14, TypeScript, Prisma, and PostgreSQL. Server components, app router, authentication with NextAuth, and deployment on Vercel.",
    duration: "12 weeks",
    is_active: true
  },

  // Mobile App Development
  {
    title: "Mobile App Development with Flutter",
    code: "MOB-FLUTTER-101",
    description: "Build cross-platform mobile applications with Flutter and Dart. Covers state management (Provider, Riverpod), Firebase integration, animations, and app store deployment.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "React Native Mobile Development",
    code: "MOB-RN-101",
    description: "Develop iOS and Android apps using React Native. Navigation, native modules, Expo, push notifications, and publishing to App Store and Play Store.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Advanced Flutter: State Management & Architecture",
    code: "MOB-FLUTTER-201",
    description: "Deep dive into Flutter architecture patterns: BLoC, Clean Architecture, modularization, testing, and performance optimization for production apps.",
    duration: "8 weeks",
    is_active: true
  },

  // Data Science & Analytics
  {
    title: "Data Science Fundamentals with Python",
    code: "DS-PYTHON-101",
    description: "Introduction to data science using Python. NumPy, Pandas, Matplotlib, Seaborn, exploratory data analysis, data cleaning, and visualization techniques.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Machine Learning with Scikit-Learn & TensorFlow",
    code: "DS-ML-201",
    description: "Supervised and unsupervised learning algorithms, model evaluation, feature engineering, neural networks with TensorFlow/Keras, and model deployment.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "Data Analysis & Visualization with Power BI",
    code: "DS-POWERBI-101",
    description: "Business intelligence and data visualization using Power BI. DAX, data modeling, dashboards, reports, and publishing to Power BI Service.",
    duration: "8 weeks",
    is_active: true
  },
  {
    title: "SQL for Data Analytics",
    code: "DS-SQL-101",
    description: "Advanced SQL for data analysis: complex queries, window functions, CTEs, query optimization, and working with PostgreSQL and MySQL.",
    duration: "6 weeks",
    is_active: true
  },

  // Cybersecurity
  {
    title: "Cybersecurity Fundamentals & Ethical Hacking",
    code: "SEC-ETHICAL-101",
    description: "Introduction to cybersecurity: network security, web application vulnerabilities (OWASP Top 10), penetration testing methodology, and tools like Burp Suite, Nmap.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "Advanced Penetration Testing & Red Teaming",
    code: "SEC-REDTEAM-201",
    description: "Advanced offensive security: Active Directory exploitation, lateral movement, persistence, evasion techniques, and red team operations.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Security Operations & Incident Response",
    code: "SEC-SOC-101",
    description: "Blue team operations: SIEM (Splunk/ELK), threat hunting, malware analysis, incident response lifecycle, and security monitoring.",
    duration: "8 weeks",
    is_active: true
  },

  // Cloud Computing
  {
    title: "AWS Cloud Practitioner & Solutions Architect",
    code: "CLOUD-AWS-101",
    description: "Comprehensive AWS training: EC2, S3, RDS, Lambda, API Gateway, CloudFormation, IAM, VPC, and preparation for AWS Certified Solutions Architect Associate.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "Microsoft Azure Fundamentals & Administration",
    code: "CLOUD-AZURE-101",
    description: "Azure cloud services: Virtual Machines, App Services, Azure SQL, Functions, AKS, Azure DevOps, and preparation for AZ-104 certification.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Google Cloud Platform (GCP) Engineering",
    code: "CLOUD-GCP-101",
    description: "GCP services: Compute Engine, Cloud Run, Cloud Functions, BigQuery, Pub/Sub, Cloud SQL, and preparation for Associate Cloud Engineer certification.",
    duration: "10 weeks",
    is_active: true
  },

  // DevOps Engineering
  {
    title: "DevOps Fundamentals: CI/CD with GitHub Actions & GitLab CI",
    code: "DEVOPS-CICD-101",
    description: "Continuous integration and deployment pipelines, Docker containerization, Kubernetes basics, infrastructure as code with Terraform.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Advanced Kubernetes & Cloud-Native DevOps",
    code: "DEVOPS-K8S-201",
    description: "Deep Kubernetes: Helm, Operators, service mesh (Istio), monitoring (Prometheus/Grafana), logging (ELK), GitOps with ArgoCD.",
    duration: "8 weeks",
    is_active: true
  },
  {
    title: "Site Reliability Engineering (SRE)",
    code: "DEVOPS-SRE-201",
    description: "SRE principles: SLI/SLO/SLA, error budgets, observability, incident management, chaos engineering, and capacity planning.",
    duration: "8 weeks",
    is_active: true
  },

  // UI/UX Design
  {
    title: "UI/UX Design Fundamentals",
    code: "UX-UI-101",
    description: "User research, wireframing, prototyping, usability testing, design systems, Figma mastery, and designing for African contexts.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Advanced Product Design & Design Systems",
    code: "UX-UI-201",
    description: "Design tokens, component libraries, accessibility (WCAG), motion design, design ops, and building scalable design systems in Figma.",
    duration: "8 weeks",
    is_active: true
  },

  // Backend Development
  {
    title: "Backend Development with Node.js & Express",
    code: "BACKEND-NODE-101",
    description: "RESTful API design, database integration (PostgreSQL/MongoDB), authentication (JWT/OAuth), testing, caching (Redis), and deployment.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Backend Development with Python (FastAPI/Django)",
    code: "BACKEND-PYTHON-101",
    description: "Modern Python backend development: FastAPI for async APIs, Django for full-featured apps, SQLAlchemy/Tortoise ORM, testing, and deployment.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Microservices Architecture with Go",
    code: "BACKEND-GO-201",
    description: "Build microservices in Go: gRPC, protocol buffers, service discovery, distributed tracing, and deploying to Kubernetes.",
    duration: "12 weeks",
    is_active: true
  },

  // Frontend Development
  {
    title: "Frontend Development with React & TypeScript",
    code: "FRONTEND-REACT-101",
    description: "Modern React with hooks, context, React Query, React Router, TypeScript, testing with Vitest/React Testing Library, and performance optimization.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Vue.js & Nuxt.js Full-Stack Development",
    code: "FRONTEND-VUE-101",
    description: "Vue 3 Composition API, Pinia state management, Nuxt 3 for SSR/SSG, VueUse, and building production Vue applications.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Advanced Frontend: Performance & Architecture",
    code: "FRONTEND-ADV-201",
    description: "Micro-frontends, module federation, Web Vitals optimization, advanced patterns (compound components, render props), and monorepos with Turborepo.",
    duration: "8 weeks",
    is_active: true
  },

  // Machine Learning & AI
  {
    title: "Deep Learning with PyTorch",
    code: "AI-PYTORCH-201",
    description: "Neural networks, CNNs for computer vision, RNNs/Transformers for NLP, transfer learning, and deploying models with TorchServe.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "Generative AI & LLM Applications",
    code: "AI-LLM-201",
    description: "Building with LLMs: prompt engineering, RAG, fine-tuning, LangChain/LlamaIndex, vector databases, and deploying AI applications.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "Computer Vision for African Contexts",
    code: "AI-CV-201",
    description: "Applied computer vision: object detection, segmentation, and classification with focus on African use cases (agriculture, healthcare, security).",
    duration: "10 weeks",
    is_active: true
  },

  // Database Administration
  {
    title: "PostgreSQL Administration & Performance Tuning",
    code: "DB-PGSQL-101",
    description: "PostgreSQL internals, indexing, query optimization, partitioning, replication, backup/recovery, and high availability setups.",
    duration: "8 weeks",
    is_active: true
  },
  {
    title: "MongoDB for Developers & Administrators",
    code: "DB-MONGO-101",
    description: "Document modeling, aggregation pipeline, indexes, sharding, replica sets, performance tuning, and Atlas cloud deployment.",
    duration: "8 weeks",
    is_active: true
  },

  // Software Testing & QA
  {
    title: "Test Automation with Playwright & Cypress",
    code: "QA-AUTO-101",
    description: "End-to-end testing with Playwright and Cypress, API testing, visual regression testing, CI/CD integration, and test architecture.",
    duration: "8 weeks",
    is_active: true
  },
  {
    title: "API Testing & Contract Testing with Pact",
    code: "QA-API-101",
    description: "REST/GraphQL API testing, contract testing with Pact, schema validation, performance testing with k6, and test data management.",
    duration: "6 weeks",
    is_active: true
  },

  // Blockchain Development
  {
    title: "Blockchain Development with Solidity & Ethereum",
    code: "BLOCK-ETH-101",
    description: "Smart contract development: Solidity, Hardhat/Foundry, OpenZeppelin, ERC standards, DeFi primitives, testing, and deployment to mainnet/L2s.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "Web3 Frontend Development",
    code: "BLOCK-WEB3-101",
    description: "Building dApps: ethers.js/viem, wagmi, RainbowKit, wallet integration, reading/writing contracts, and IPFS/Filecoin for storage.",
    duration: "8 weeks",
    is_active: true
  },

  // Game Development
  {
    title: "Game Development with Unity & C#",
    code: "GAME-UNITY-101",
    description: "Unity fundamentals: C# scripting, physics, animation, UI, particle systems, mobile optimization, and publishing to stores.",
    duration: "12 weeks",
    is_active: true
  },
  {
    title: "Unreal Engine 5 for Game Development",
    code: "GAME-UNREAL-101",
    description: "Unreal Engine 5: Blueprints, C++, Nanite, Lumen, Niagara, and building high-fidelity games for PC/console.",
    duration: "12 weeks",
    is_active: true
  },

  // Embedded Systems & IoT
  {
    title: "Embedded Systems with Arduino & ESP32",
    code: "IOT-ARDUINO-101",
    description: "Microcontroller programming: GPIO, sensors, actuators, WiFi/Bluetooth, MQTT, and building IoT prototypes for agriculture and home automation.",
    duration: "10 weeks",
    is_active: true
  },
  {
    title: "IoT Solutions with Raspberry Pi & Python",
    code: "IOT-PI-101",
    description: "Raspberry Pi for IoT: Linux basics, Python for hardware, edge computing, cloud integration (AWS IoT/Azure IoT), and industrial IoT protocols.",
    duration: "10 weeks",
    is_active: true
  }
];

const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

module.exports = {
  async up(queryInterface, Sequelize) {
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2024-12-31");

    const coursesWithTimestamps = courses.map(course => ({
      ...course,
      created_at: getRandomDate(startDate, endDate),
      updated_at: getRandomDate(startDate, endDate)
    }));

    await queryInterface.bulkInsert("courses", coursesWithTimestamps, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
  }
};