const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Task = require('../models/Task');
const Candidate = require('../models/Candidate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Task.deleteMany({});
    await Candidate.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@qtecsolution.com',
      password: 'admin123',
      role: 'Super Admin',
      is_active: true,
    });

    console.log('✅ Created admin user');

    // Create HR user
    const hrUser = await User.create({
      name: 'HR Manager',
      email: 'hr@example.com',
      password: 'admin123',
      role: 'HR',
      is_active: true,
    });

    console.log('✅ Created HR user');

    // Create sample jobs
    const sampleJobs = [
      {
        title: 'Senior Frontend Developer',
        salary_range: '$80,000 - $120,000',
        designation: 'Frontend Developer',
        job_description: `# Senior Frontend Developer

We are looking for a talented Senior Frontend Developer to join our dynamic team. You will be responsible for building and maintaining high-quality web applications using modern technologies.

## Responsibilities
- Develop responsive and interactive user interfaces
- Collaborate with design and backend teams
- Optimize applications for maximum speed and scalability
- Mentor junior developers and conduct code reviews
- Stay up-to-date with emerging trends and technologies

## Requirements
- Strong proficiency in JavaScript, HTML5, and CSS3
- Experience with React.js and modern frontend frameworks
- Knowledge of responsive design principles
- Understanding of cross-browser compatibility
- Experience with version control systems (Git)

## Nice to Have
- Experience with TypeScript
- Knowledge of testing frameworks (Jest, Cypress)
- Understanding of SEO principles
- Experience with performance optimization`,
        experience_in_year: '3+ years',
        task_link: 'https://github.com/company/frontend-task',
        job_id: 'FRONT001',
        is_active: true,
        created_by: adminUser._id,
      },
      {
        title: 'Full Stack Developer',
        salary_range: '$90,000 - $130,000',
        designation: 'Full Stack Developer',
        job_description: `# Full Stack Developer

Join our team as a Full Stack Developer where you'll work on both frontend and backend development, creating complete web applications from concept to deployment.

## Responsibilities
- Develop and maintain web applications
- Design and implement database schemas
- Create RESTful APIs and integrate third-party services
- Ensure code quality through testing and documentation
- Collaborate with cross-functional teams

## Requirements
- Proficiency in JavaScript/TypeScript
- Experience with React.js and Node.js
- Knowledge of database systems (MongoDB, PostgreSQL)
- Understanding of RESTful API design
- Experience with cloud platforms (AWS, Azure, GCP)

## Nice to Have
- Experience with Docker and Kubernetes
- Knowledge of microservices architecture
- Understanding of CI/CD pipelines
- Experience with GraphQL`,
        experience_in_year: '4+ years',
        task_link: 'https://github.com/company/fullstack-task',
        job_id: 'FULL001',
        is_active: true,
        created_by: adminUser._id,
      },
      {
        title: 'Backend Developer',
        salary_range: '$85,000 - $125,000',
        designation: 'Backend Developer',
        job_description: `# Backend Developer

We are seeking a skilled Backend Developer to build robust and scalable server-side applications. You will work on API development, database design, and system architecture.

## Responsibilities
- Design and implement server-side logic
- Develop and maintain APIs
- Optimize database queries and performance
- Implement security and data protection measures
- Collaborate with frontend developers

## Requirements
- Strong proficiency in Node.js/Python/Java
- Experience with database systems (MongoDB, MySQL, PostgreSQL)
- Knowledge of RESTful API design principles
- Understanding of authentication and authorization
- Experience with version control systems

## Nice to Have
- Experience with microservices architecture
- Knowledge of message queues (Redis, RabbitMQ)
- Understanding of cloud platforms
- Experience with Docker and containerization`,
        experience_in_year: '3+ years',
        task_link: 'https://github.com/company/backend-task',
        job_id: 'BACK001',
        is_active: true,
        created_by: adminUser._id,
      },
      {
        title: 'React Developer',
        salary_range: '$70,000 - $100,000',
        designation: 'React Developer',
        job_description: `# React Developer

Join our team as a React Developer and help us create amazing user experiences. You will work on building modern, responsive web applications using React and related technologies.

## Responsibilities
- Build reusable components and front-end libraries
- Translate designs and wireframes into high-quality code
- Optimize components for maximum performance
- Collaborate with UI/UX designers
- Participate in code reviews and technical discussions

## Requirements
- Strong proficiency in JavaScript and React.js
- Experience with modern JavaScript (ES6+)
- Knowledge of HTML5 and CSS3
- Understanding of component-based architecture
- Experience with state management (Redux, Context API)

## Nice to Have
- Experience with TypeScript
- Knowledge of testing libraries (Jest, React Testing Library)
- Understanding of build tools (Webpack, Vite)
- Experience with CSS-in-JS solutions`,
        experience_in_year: '2+ years',
        task_link: 'https://github.com/company/react-task',
        job_id: 'REACT001',
        is_active: true,
        created_by: adminUser._id,
      },
      {
        title: 'Node.js Developer',
        salary_range: '$75,000 - $110,000',
        designation: 'Node.js Developer',
        job_description: `# Node.js Developer

We are looking for a Node.js Developer to join our backend team. You will be responsible for developing server-side logic, APIs, and database interactions using Node.js.

## Responsibilities
- Develop and maintain Node.js applications
- Design and implement RESTful APIs
- Work with databases and data modeling
- Implement authentication and authorization
- Optimize application performance

## Requirements
- Strong proficiency in JavaScript and Node.js
- Experience with Express.js framework
- Knowledge of database systems (MongoDB, MySQL)
- Understanding of asynchronous programming
- Experience with API development

## Nice to Have
- Experience with TypeScript
- Knowledge of testing frameworks (Jest, Mocha)
- Understanding of microservices architecture
- Experience with cloud platforms`,
        experience_in_year: '2+ years',
        task_link: 'https://github.com/company/nodejs-task',
        job_id: 'NODE001',
        is_active: true,
        created_by: adminUser._id,
      },
    ];

    const createdJobs = await Job.insertMany(sampleJobs);
    console.log('✅ Created sample jobs');

    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Frontend Task - React Dashboard',
        description: 'Create a responsive dashboard using React and TailwindCSS. Include charts, tables, and user management features.',
        requirements: 'React 18+ with hooks, TailwindCSS for styling, Responsive design, State management (Redux/Context), API integration',
        difficulty: 'Medium',
        estimated_time: '3-5 days',
        created_by: adminUser._id,
      },
      {
        title: 'Full Stack Task - E-commerce Platform',
        description: 'Build a complete e-commerce platform with user authentication, product management, and payment integration.',
        requirements: 'React frontend, Node.js/Express backend, MongoDB database, JWT authentication, Payment gateway integration, Admin panel',
        difficulty: 'Hard',
        estimated_time: '5-7 days',
        created_by: adminUser._id,
      },
      {
        title: 'Backend Task - REST API',
        description: 'Develop a RESTful API with authentication, authorization, and CRUD operations for a blog system.',
        requirements: 'Node.js/Express, MongoDB with Mongoose, JWT authentication, Input validation, Error handling, API documentation',
        difficulty: 'Medium',
        estimated_time: '2-3 days',
        created_by: adminUser._id,
      },
      {
        title: 'React Task - Todo Application',
        description: 'Create a feature-rich todo application with React, including local storage, filtering, and categories.',
        requirements: 'React functional components, Local storage integration, Filter and search functionality, Category management, Responsive design',
        difficulty: 'Easy',
        estimated_time: '1-2 days',
        created_by: adminUser._id,
      },
      {
        title: 'Node.js Task - Authentication System',
        description: 'Build a complete authentication system with registration, login, password reset, and email verification.',
        requirements: 'Node.js/Express, MongoDB, JWT tokens, Password hashing, Email verification, Password reset functionality',
        difficulty: 'Medium',
        estimated_time: '2-3 days',
        created_by: adminUser._id,
      },
    ];

    const createdTasks = await Task.insertMany(sampleTasks);
    console.log('✅ Created sample tasks');

    // Create sample candidates
    const sampleCandidates = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        application_id: 'APP-2024-001',
        job_id: createdJobs[0]._id, // Senior Frontend Developer
        status: 'Task Submitted',
        cv_file_path: 'cvs/sample-cv-1.pdf',
        task_submission: {
          links: [
            {
              url: 'https://github.com/johndoe/frontend-dashboard',
              type: 'github',
            },
            {
              url: 'https://johndoe-dashboard.vercel.app',
              type: 'live',
            },
          ],
          submitted_at: new Date(),
        },
        evaluation: {
          score: 85,
          feedback: 'Excellent React skills and clean code structure',
          evaluated_by: adminUser._id,
          evaluated_at: new Date(),
        },
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        application_id: 'APP-2024-002',
        job_id: createdJobs[1]._id, // Full Stack Developer
        status: 'Interview Scheduled',
        cv_file_path: 'cvs/sample-cv-2.pdf',
        task_submission: {
          links: [
            {
              url: 'https://github.com/janesmith/ecommerce-platform',
              type: 'github',
            },
          ],
          submitted_at: new Date(),
        },
        interview: {
          scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          interviewer: adminUser._id,
          status: 'Scheduled',
        },
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1234567892',
        application_id: 'APP-2024-003',
        job_id: createdJobs[2]._id, // Backend Developer
        status: 'Applied',
        cv_file_path: 'cvs/sample-cv-3.pdf',
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1234567893',
        application_id: 'APP-2024-004',
        job_id: createdJobs[3]._id, // React Developer
        status: 'Selected',
        cv_file_path: 'cvs/sample-cv-4.pdf',
        task_submission: {
          links: [
            {
              url: 'https://github.com/sarahwilson/todo-app',
              type: 'github',
            },
            {
              url: 'https://sarah-todo-app.netlify.app',
              type: 'live',
            },
          ],
          submitted_at: new Date(),
        },
        evaluation: {
          score: 92,
          feedback: 'Outstanding performance in all areas',
          evaluated_by: adminUser._id,
          evaluated_at: new Date(),
        },
        final_selection: {
          selected_by: adminUser._id,
          selected_at: new Date(),
          notes: 'Excellent candidate with great potential',
        },
      },
      {
        name: 'David Brown',
        email: 'david.brown@example.com',
        phone: '+1234567894',
        application_id: 'APP-2024-005',
        job_id: createdJobs[4]._id, // Node.js Developer
        status: 'Rejected',
        cv_file_path: 'cvs/sample-cv-5.pdf',
        task_submission: {
          links: [
            {
              url: 'https://github.com/davidbrown/auth-system',
              type: 'github',
            },
          ],
          submitted_at: new Date(),
        },
        evaluation: {
          score: 45,
          feedback: 'Basic understanding but lacks advanced concepts',
          evaluated_by: adminUser._id,
          evaluated_at: new Date(),
        },
      },
    ];

    const createdCandidates = await Candidate.insertMany(sampleCandidates);
    console.log('✅ Created sample candidates');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`- Admin User: admin@qtecsolution.com (password: admin123)`);
    console.log(`- HR User: hr@example.com (password: admin123)`);
    console.log(`- ${createdJobs.length} sample jobs`);
    console.log(`- ${createdTasks.length} sample tasks`);
    console.log(`- ${createdCandidates.length} sample candidates`);
    console.log('\n🔗 Sample Job Application URLs:');
    createdJobs.forEach((job) => {
      console.log(`- ${job.title}: /job-application/${job.job_id}`);
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
seedData();
