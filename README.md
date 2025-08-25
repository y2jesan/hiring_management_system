# Engineer Hiring Management System

A complete, production-ready hiring management system built with Express.js backend and React frontend. This system automates and streamlines the engineer recruitment workflow with features for job posting, candidate applications, task management, evaluation, interview scheduling, and final selection.

## 🚀 Features

### For Candidates

- **Job Application Portal**: Easy-to-use application form with CV upload
- **Application Tracking**: Real-time status updates and progress tracking
- **Task Submission**: Submit GitHub repositories and live demos
- **Candidate Portal**: View application status, task details, and interview information

### For HR/Admin

- **Dashboard**: Comprehensive analytics and statistics
- **Job Management**: Create, edit, and manage job postings
- **Candidate Management**: View, filter, and search candidate applications
- **Task Evaluation**: Score candidate submissions with feedback
- **Interview Scheduling**: Schedule and manage candidate interviews
- **Final Selection**: Make final hiring decisions
- **Export Functionality**: Export candidate data to Excel/PDF

### System Features

- **Role-based Access**: HR, Evaluator, MD, Super Admin roles
- **Email Automation**: Automatic notifications for application status
- **File Management**: CV and document upload handling
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live status tracking and notifications

## 🛠️ Technology Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Bcryptjs** for password hashing

### Frontend

- **React** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **Axios** for API calls
- **React Hot Toast** for notifications

## 📁 Project Structure

```
hiring_management_system/
├── server/                 # Backend Express.js application
│   ├── config/            # Database and configuration
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middlewares
│   ├── helpers/          # Utility functions
│   ├── public/           # Static files (CVs, images)
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   └── App.jsx       # Main app component
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
└── README.md            # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hiring_management_system
   ```

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the server directory:

   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/hiring_system
   JWT_SECRET=your_jwt_secret_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   FRONTEND_URL=http://localhost:4000
   ```

5. **Start the development servers**

   **Backend (Terminal 1):**

   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2):**

   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api

## 📋 API Endpoints

### Authentication

- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/candidate-login` - Candidate login
- `GET /api/auth/me` - Get current user

### Jobs

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/job-id/:jobId` - Get job by job_id

### Candidates

- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create candidate application
- `GET /api/candidates/:id` - Get candidate by ID
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate
- `GET /api/candidates/application/:applicationId` - Get by application ID
- `POST /api/candidates/:id/task` - Submit task
- `POST /api/candidates/:id/evaluate` - Evaluate candidate
- `PATCH /api/candidates/:id/status` - Update status

### Interviews

- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create interview
- `POST /api/interviews/schedule/:candidateId` - Schedule interview
- `PATCH /api/interviews/:id/result` - Update interview result

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analytics` - Get analytics data
- `GET /api/dashboard/activities` - Get recent activities

## 🔐 Default Admin Credentials

For testing purposes, you can use these default credentials:

- **Email**: admin@example.com
- **Password**: admin123

## 📱 Usage Guide

### For HR/Admin Users

1. **Login to Admin Panel**

   - Navigate to `/admin/login`
   - Use admin credentials to access the system

2. **Create Job Posting**

   - Go to Jobs section
   - Click "Create Job"
   - Fill in job details and save
   - Share the generated job application link

3. **Manage Candidates**

   - View all applications in Candidates section
   - Filter and search candidates
   - Review CVs and task submissions

4. **Evaluate Tasks**

   - Go to Evaluation section
   - Review submitted tasks
   - Score candidates (0-100)
   - Provide feedback

5. **Schedule Interviews**

   - Navigate to Interviews section
   - Select eligible candidates
   - Schedule interview date/time
   - Assign interviewers

6. **Final Selection**
   - Review shortlisted candidates
   - Make final hiring decisions
   - Upload offer letters if needed

### For Candidates

1. **Apply for Job**

   - Visit the job application link
   - Fill in personal details
   - Upload CV/resume
   - Submit application

2. **Track Application**

   - Use Application ID to access candidate portal
   - View application status
   - Check task assignments

3. **Submit Task**

   - Complete assigned task
   - Submit GitHub repository link
   - Add live demo URL (optional)
   - Provide additional notes

4. **Monitor Progress**
   - Check evaluation results
   - View interview details
   - Track final decision

## 🔧 Configuration

### Database Configuration

The system uses MongoDB. Update the `MONGODB_URI` in your `.env` file to point to your MongoDB instance.

### Email Configuration

Configure SMTP settings in `.env` for email notifications:

- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP port (usually 587 for TLS)
- `SMTP_USER`: Email username
- `SMTP_PASS`: Email password

### File Storage

CVs and images are stored in the `server/public/` directory:

- `server/public/cvs/` - Candidate CV files
- `server/public/images/` - Job images

## 🚀 Deployment

### Production Build

1. **Build Frontend**

   ```bash
   cd client
   npm run build
   ```

2. **Set Environment Variables**

   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   FRONTEND_URL=https://your-domain.com
   ```

3. **Start Production Server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install --prefix server
RUN npm install --prefix client

COPY . .

RUN npm run build --prefix client

EXPOSE 4000

CMD ["npm", "start", "--prefix", "server"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Workflow

The system follows this recruitment workflow:

1. **HR creates job posting** → `/job-application/:job_id` becomes available
2. **Candidate applies** → CV stored, confirmation email sent with application_id
3. **Candidate submits task** → Stored in system, visible in admin panel
4. **Evaluator scores task** → Auto-update status if score ≥ 60%
5. **HR schedules interview** → Candidate notified by email
6. **Interview panel updates result** → Shortlist created
7. **MD finalizes** → Select/reject candidates
8. **HR uploads offer letter** → Final email sent

This creates a complete, automated hiring pipeline from application to final selection.
