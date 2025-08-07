// sendEmail.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  const { userEmail, adminEmail, subject, htmlContent } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to user
    await transporter.sendMail({
      from: `"M&H Advocates" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
    });

    // Email to admin
    await transporter.sendMail({
      from: `"M&H Advocates" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Copy: ${subject}`,
      html: htmlContent,
    });

    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
