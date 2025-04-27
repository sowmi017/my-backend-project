const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());

// Dummy database for demonstration
const users = [
  { code: "FAC001", email: "faculty1@example.com", password: "password1" },
  { code: "FAC002", email: "faculty2@example.com", password: "password2" },
];

let otpStorage = {}; // Temporary storage for OTPs

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // Replace with your email
    pass: "your-email-password", // Replace with your app password
  },
});

// Login endpoint
app.post("/login", (req, res) => {
  const { code, password } = req.body;
  const user = users.find((u) => u.code === code && u.password === password);

  if (user) {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[code] = otp;

    // Send OTP to email
    transporter.sendMail(
      {
        from: "your-email@gmail.com",
        to: user.email,
        subject: "Your OTP for Login",
        text: `Your OTP is: ${otp}`,
      },
      (err, info) => {
        if (err) {
          console.error("Error sending OTP email:", err);
          res.status(500).send("Error sending OTP email.");
        } else {
          res.status(200).send("OTP sent to your email.");
        }
      }
    );
  } else {
    res.status(401).send("Invalid code or password.");
  }
});

// OTP verification endpoint
app.post("/verify-otp", (req, res) => {
  const { code, otp } = req.body;

  if (otpStorage[code] && otpStorage[code] === otp) {
    delete otpStorage[code]; // Clear OTP after verification
    res.status(200).send("Login successful!");
  } else {
    res.status(400).send("Invalid OTP.");
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${5173}`);
});
