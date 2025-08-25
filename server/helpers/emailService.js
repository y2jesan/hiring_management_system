const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  applicationConfirmation: (candidateName, applicationId, taskLink, submissionLink) => ({
    subject: 'Application Received - Engineer Hiring Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Received</h2>
        <p>Dear ${candidateName},</p>
        <p>Thank you for your application! We have received your submission and are excited to review your profile.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Your Application Details:</h3>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Status:</strong> Task Pending</p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
          <p>Please complete the assigned task to proceed with your application:</p>
          <p><a href="${taskLink}" style="color: #2563eb;">View Task Instructions</a></p>
          <p><a href="${submissionLink}" style="color: #2563eb;">Submit Your Task</a></p>
        </div>
        
        <p>You can track your application status using your email and Application ID.</p>
        <p>Best regards,<br>Hiring Team</p>
      </div>
    `,
  }),

  taskSubmitted: (candidateName, applicationId) => ({
    subject: 'Task Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Task Submitted</h2>
        <p>Dear ${candidateName},</p>
        <p>Your task has been submitted successfully!</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Application Details:</h3>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        
        <p>Our evaluation team will review your submission and you will be notified of the results soon.</p>
        <p>Best regards,<br>Hiring Team</p>
      </div>
    `,
  }),

  interviewScheduled: (candidateName, applicationId, interviewDate, interviewer) => ({
    subject: 'Interview Scheduled - Engineer Hiring Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Interview Scheduled</h2>
        <p>Dear ${candidateName},</p>
        <p>Congratulations! You have been selected for an interview.</p>
        
        <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #6b21a8; margin-top: 0;">Interview Details:</h3>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Date:</strong> ${new Date(interviewDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(interviewDate).toLocaleTimeString()}</p>
          <p><strong>Interviewer:</strong> ${interviewer}</p>
        </div>
        
        <p>Please be prepared and join the interview on time.</p>
        <p>Best regards,<br>Hiring Team</p>
      </div>
    `,
  }),

  selected: (candidateName, applicationId) => ({
    subject: 'Congratulations! You Have Been Selected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎉 Congratulations!</h2>
        <p>Dear ${candidateName},</p>
        <p>We are delighted to inform you that you have been selected for the position!</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Application Details:</h3>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Status:</strong> Selected</p>
        </div>
        
        <p>You will receive an offer letter shortly with all the details.</p>
        <p>Welcome to the team!</p>
        <p>Best regards,<br>Hiring Team</p>
      </div>
    `,
  }),

  rejected: (candidateName, applicationId) => ({
    subject: 'Application Update - Engineer Hiring Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear ${candidateName},</p>
        <p>Thank you for your interest in our company and for taking the time to apply.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #991b1b; margin-top: 0;">Application Details:</h3>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Status:</strong> Not Selected</p>
        </div>
        
        <p>We appreciate your application and wish you the best in your future endeavors.</p>
        <p>Best regards,<br>Hiring Team</p>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](...Object.values(data));

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendApplicationConfirmation = async (candidateEmail, candidateName, applicationId, taskLink, submissionLink) => {
  return await sendEmail(candidateEmail, 'applicationConfirmation', [candidateName, applicationId, taskLink, submissionLink]);
};

const sendTaskSubmittedNotification = async (candidateEmail, candidateName, applicationId) => {
  return await sendEmail(candidateEmail, 'taskSubmitted', [candidateName, applicationId]);
};

const sendInterviewScheduledNotification = async (candidateEmail, candidateName, applicationId, interviewDate, interviewer) => {
  return await sendEmail(candidateEmail, 'interviewScheduled', [candidateName, applicationId, interviewDate, interviewer]);
};

const sendSelectionNotification = async (candidateEmail, candidateName, applicationId) => {
  return await sendEmail(candidateEmail, 'selected', [candidateName, applicationId]);
};

const sendRejectionNotification = async (candidateEmail, candidateName, applicationId) => {
  return await sendEmail(candidateEmail, 'rejected', [candidateName, applicationId]);
};

module.exports = {
  sendEmail,
  sendApplicationConfirmation,
  sendTaskSubmittedNotification,
  sendInterviewScheduledNotification,
  sendSelectionNotification,
  sendRejectionNotification,
};
