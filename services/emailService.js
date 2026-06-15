const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error && process.env.EMAIL_USER) {
    console.log("Email service warning:", error.message);
  } else if (success && process.env.EMAIL_USER) {
    console.log("Email service ready");
  }
});

// Send adoption approval email
exports.sendAdoptionApprovalEmail = async (userEmail, userName, animalType) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: "Adoption Request Approved! 🎉",
      html: `
        <h2>Great News!</h2>
        <p>Hi ${userName},</p>
        <p>Your adoption request for a ${animalType} has been <strong>APPROVED</strong>!</p>
        <p>Please contact us to arrange the pickup or delivery.</p>
        <br/>
        <p>Thank you for giving a pet a loving home!</p>
        <p>Best regards,<br/>Pawfect Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Adoption approval email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending approval email:", error.message);
    return false;
  }
};

// Send adoption rejection email
exports.sendAdoptionRejectionEmail = async (userEmail, userName, animalType, reason = "") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: "Adoption Request Status Update",
      html: `
        <h2>Adoption Request Update</h2>
        <p>Hi ${userName},</p>
        <p>Unfortunately, your adoption request for a ${animalType} has been <strong>REJECTED</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>Please feel free to apply for other animals or contact us for more information.</p>
        <br/>
        <p>Best regards,<br/>Pawfect Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Adoption rejection email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending rejection email:", error.message);
    return false;
  }
};

// Send volunteer approval email
exports.sendVolunteerApprovalEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: "Volunteer Application Approved! ✅",
      html: `
        <h2>Welcome to the Pawfect Team!</h2>
        <p>Hi ${userName},</p>
        <p>Congratulations! Your volunteer application has been <strong>APPROVED</strong>!</p>
        <p>You can now participate in rescue operations and help us save animals.</p>
        <p>Thank you for your dedication to animal welfare!</p>
        <br/>
        <p>Best regards,<br/>Pawfect Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Volunteer approval email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending volunteer email:", error.message);
    return false;
  }
};
