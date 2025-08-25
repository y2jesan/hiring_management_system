@requirement.txt @requirement.txt
You are an expert fullstack developer. Build a complete, production-ready Engineer Hiring Management System with the following requirements:

🔹 Project Setup

Use 2 folders:

server → Express.js backend

client → React (with Vite) frontend

Database: MongoDB

Serve the frontend build (client/dist) statically from the backend on port 4000.

No TypeScript (JavaScript only).

Make the frontend 100% responsive with TailwindCSS.

Store candidate CVs and images inside public folders on the server (/public/cvs, /public/images).

Maintain a clean and scalable folder structure.

🔹 Server (Express.js – server folder)

Structure:

server/
├── controllers/
├── models/
├── routes/
├── helpers/
├── middlewares/
├── config/
├── public/
│ ├── cvs/
│ └── images/
├── app.js
└── server.js

Features:

Use Mongoose models for:

Job → job posts with fields (title, salary_range, designation, image, experience_in_year, task_link, job_id).

Candidate → name, email, phone, CV file path, application_id, task submission (multiple GitHub/live urls), status.

Task → pre-uploaded task bank with task details.

Interview → candidate_id, schedule (date/time), interviewer, result.

User → role-based access (HR, Evaluator, MD, Super Admin).

Controllers for each model with full CRUD APIs.

Authentication:

Candidates → login with Email + Application ID.

Admin/HR/MD → role-based login (JWT).

Email sending via SMTP with helper functions.

Auto-generated unique IDs (job_id: 8-char alphanumeric, application_id: unique).

Auto-status updates based on workflow rules (≥60% score → Interview Eligible).

Middleware for file upload (CVs, images) using multer.

APIs connected to React frontend (no TODOs).

🔹 Client (React + Vite – client folder)

Structure:

client/
├── src/
│ ├── pages/
│ ├── components/
│ ├── layouts/
│ ├── hooks/
│ ├── services/ (API calls)
│ └── App.jsx
├── public/
├── tailwind.config.js
└── index.html

Features:

Fully responsive Tailwind UI.

Candidate Portal:

/job-application/:job_id → Apply form (Name, Email, Phone, CV upload).

/application/:application_id → Candidate portal (view task, submit task, check status).

Admin Panel:

Dashboard with stats (applications, tasks pending, interviews scheduled, selected, rejected).

Candidate management → list, filter, search.

Task management → assign/view tasks.

Evaluation page → score candidates.

Interview scheduling → pick date/time, assign interviewer.

Final selection → mark selected/rejected, upload offer letter.

Role-based access (HR, Evaluator, MD, Super Admin).

Email notifications integrated with backend events.

Use React Router for navigation.

API service layer in client/src/services/ for all backend calls.

🔹 Workflow to Implement

HR creates Job Post → /job-application/:job_id auto available.

Candidate applies → CV stored, confirmation email sent with application_id + task link.

Candidate submits task → stored in system, visible in admin panel.

Evaluator scores task → auto-update status.

If score ≥ 60% → eligible for interview.

HR schedules interview → candidate notified by email.

Interview panel updates result → shortlist created.

MD finalizes → select/reject.

HR uploads offer letter → final email sent.

🔹 Extra Requirements

No TODOs left in code.

Include README.md with setup and usage instructions.

Provide seed data for jobs and tasks.

Ensure smooth mobile responsiveness (for candidates + admin panel).

Export candidate data to Excel/PDF.

Analytics dashboard (applications count, pass rate, interview success).

⚡ Build the complete fullstack project with backend + frontend integrated, all routes working, no missing parts.
