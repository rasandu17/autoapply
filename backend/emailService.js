// Email Service
// Sends emails using Gmail SMTP via Nodemailer

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Send email using Gmail SMTP with CV attachment
 */
async function sendEmail(to, subject, body) {
  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Find CV file (PDF or TXT)
    const cvPathPdf = path.join(__dirname, 'Ravindu_Sandumith_CV.pdf');
    const cvPathTxt = path.join(__dirname, 'cv.txt');
    let cvPath = null;
    let cvFilename = 'CV.pdf';

    if (fs.existsSync(cvPathPdf)) {
      cvPath = cvPathPdf;
      cvFilename = 'Ravindu_Sandumith_CV.pdf';
    } else if (fs.existsSync(cvPathTxt)) {
      cvPath = cvPathTxt;
      cvFilename = 'CV.txt';
    }

    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_NAME || 'Job Applicant'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>') // Simple HTML conversion
    };

    // Add CV attachment if found
    if (cvPath) {
      mailOptions.attachments = [
        {
          filename: cvFilename,
          path: cvPath
        }
      ];
      console.log(`📎 Attaching CV: ${cvFilename}`);
    } else {
      console.log('⚠️ No CV file found to attach');
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('Email Service Error:', error.message);
    throw new Error('Failed to send email. Check your Gmail credentials.');
  }
}

module.exports = {
  sendEmail
};
