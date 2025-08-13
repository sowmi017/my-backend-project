import "dotenv/config";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", // Allow requests from your React frontend
  credentials: true, // Allow cookies and authentication headers
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));

app.use(express.json());

// ✅ File Upload Configuration
const upload = multer({ dest: "uploads/" });

// ✅ MySQL Database Connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let db;
const connectDB = async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log("✅ MySQL Connected...");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// ✅ Middleware: Verify JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ error: "Access denied, token missing!" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};
// Protected dashboard route
app.get("/dashboard", verifyToken, (req, res) => {
  const email = req.query.email;
  const sql = `
    SELECT faculty.*, 
           (SELECT COUNT(*) FROM attendance WHERE faculty_email = ?) AS total_classes,
           (SELECT SUM(hours) FROM attendance WHERE faculty_email = ?) AS total_hours
    FROM faculty WHERE email = ?
  `;

  db.query(sql, [email, email, email], (err, facultyResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (facultyResults.length === 0) return res.status(404).json({ error: "User not found" });

    const faculty = facultyResults[0];

    const attendanceSql = "SELECT * FROM attendance WHERE faculty_email = ? ORDER BY date DESC LIMIT 5";
    db.query(attendanceSql, [email], (err, attendanceResults) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const odSql = "SELECT * FROM od_requests WHERE faculty_email = ? ORDER BY date DESC";
      db.query(odSql, [email], (err, odResults) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const messageSql = "SELECT * FROM messages WHERE receiver_email = ? ORDER BY timestamp DESC";
        db.query(messageSql, [email], (err, messageResults) => {
          if (err) return res.status(500).json({ error: "Database error" });

          const leaveSql = "SELECT * FROM leave_requests WHERE faculty_email = ? ORDER BY start_date DESC";
          db.query(leaveSql, [email], (err, leaveResults) => {
            if (err) return res.status(500).json({ error: "Database error" });

            res.json({
              faculty,
              attendance: attendanceResults,
              odRequests: odResults,
              messages: messageResults,
              leaveApplications: leaveResults,
            });
          });
        });
      });
    });
  });
});
// ✅ Admin Login (Without Hashing)
app.post("/admin-login", async (req, res) => {
  const { password } = req.body;

  try {
    const [result] = await db.execute("SELECT * FROM admin_login LIMIT 1");

    if (result.length === 0) return res.status(401).json({ error: "Admin password not set" });
    
    if (password !== result[0].password) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Admin Login Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
//✅ Faculty Login (Without Hashing)
// ✅ Faculty Login API (Without Hashing)
app.post("/api/login", async (req, res) => {
  console.log("📢 Received POST request to /api/login");

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [rows] = await db.execute("SELECT faculty_id, email FROM faculty WHERE email = ? AND password = ?", [email, password]);

    console.log("🔎 SQL Query Result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const token = jwt.sign(
      { faculty_id: user.faculty_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, faculty_id: user.faculty_id, email: user.email });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});



// ✅ Faculty Registration
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [existingUser] = await db.execute("SELECT * FROM faculty WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    await db.execute(
      "INSERT INTO faculty (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    res.json({ message: "Faculty registered successfully" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Fetch Faculty Data
app.get("/faculty", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM faculty");
    console.log("Faculty Data from DB:", rows); // Debugging
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ✅ Delete Faculty
app.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM faculty WHERE faculty_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Apply Leave
app.post("/apply-leave", verifyToken, upload.single("file"), async (req, res) => {
  const { start_date, end_date, event, reason } = req.body;
  const email = req.user.email;
  const file_name = req.file ? req.file.filename : null;
  
  try {
    const sql = `
      INSERT INTO leave_applications (email, start_date, end_date, event, reason, file_name) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      email,
      start_date,
      end_date || start_date,
      event,
      reason,
      file_name,
    ]);

    res.json({ message: "Leave application submitted successfully", leave_id: result.insertId });
  } catch (err) {
    console.error("❌ Error applying for leave:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/leave-applications", async (req, res) => { 
  // Temporary: Remove authentication to test if API works
  try {
    const [results] = await db.query("SELECT * FROM leave_applications WHERE status = 'Pending'");
    res.json(results);
  } catch (error) {
    console.error("❌ DB Error:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.get("/leave-applications", async (req, res) => { 
  // Temporary: Remove authentication to test if API works
  try {
    const [results] = await db.query("SELECT * FROM leave_applications WHERE status = 'Pending'");
    res.json(results);
  } catch (error) {
    console.error("❌ DB Error:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.get("/leave-history", verifyToken, async (req, res) => {
  try {
    console.log("Fetching leave history for:", req.user.email);

    const [results] = await db.execute(
      "SELECT * FROM leave_applications WHERE email = ? ORDER BY created_at DESC",
      [req.user.email]
    );

    console.log("Leave history results:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "No leave requests found" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching leave history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/delete-leave/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const email = req.user.email; // Ensure faculty can only delete their own request

  try {
    // Check if the leave exists and belongs to the faculty
    const [leave] = await db.execute("SELECT status FROM leave_applications WHERE id = ? AND email = ?", [id, email]);

    if (leave.length === 0) {
      return res.status(404).json({ error: "No leave request found or unauthorized" });
    }

    // Prevent deletion if the leave is already approved/rejected
    if (leave[0].status !== "Pending") {
      return res.status(403).json({ error: "Cannot delete an approved or rejected leave request" });
    }

    // Delete the leave request
    const [result] = await db.execute("DELETE FROM leave_applications WHERE id = ? AND email = ?", [id, email]);

    if (result.affectedRows > 0) {
      res.json({ message: "Leave request deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete leave request" });
    }
  } catch (err) {
    console.error("❌ Error deleting leave request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve or Reject Leave (Admin Only)
app.put("/admin/leave-approval/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { status } = req.body;
  
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE leave_applications SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: `Leave application ${status}` });
    } else {
      res.status(404).json({ error: "No matching leave request found" });
    }
  } catch (err) {
    console.error("❌ Error updating leave status:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Approve or Reject Leave based on Email & Dates (New Endpoint)
app.put("/update-leave", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id, status } = req.body; // ✅ Use 'id' instead of 'email, start_date, end_date'

  if (!id || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sql = `UPDATE leave_applications SET status = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [status, id]);

    if (result.affectedRows > 0) {
      res.json({ message: `Leave request ${status} successfully` });
    } else {
      res.status(404).json({ error: "No matching leave request found" });
    }
  } catch (err) {
    console.error("❌ Error updating leave request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Create & Save a new meeting
app.post("/api/meetings", async (req, res) => {
  try {
    const { title, date, time, type, link } = req.body;

    // ✅ Validate required fields
    if (!title || !date || !time || !type) {
      return res.status(400).json({ message: "Title, Date, Time, and Type are required" });
    }

    // ✅ Ensure link is null if undefined
    const safeLink = link !== undefined ? link : null;

    const query = "INSERT INTO meetings (title, date, time, type, link) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.execute(query, [title, date, time, type, safeLink]);

    res.status(201).json({ message: "Meeting created successfully", meetingId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
});


// ✅ Get all meetings
app.get("/api/meetings", async (req, res) => {
  try {
    const query = "SELECT * FROM meetings ORDER BY date DESC";
    const [meetings] = await db.execute(query);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// ✅ Get a single meeting by ID
app.get("/api/meetings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM meetings WHERE id = ?";
    const [meeting] = await db.execute(query, [id]);

    if (meeting.length === 0) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(meeting[0]);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
});


// Update Leave Requests
app.put("/update-leave", verifyToken, async (req, res) => {
  console.log("📩 Received request:", req.body);
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { email, start_date, end_date, status } = req.body;
  if (!email || !start_date || !end_date || !status) {
    console.error("❌ Missing fields:", { email, start_date, end_date, status });
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const sql = "UPDATE leave_applications SET status = ? WHERE email = ? AND start_date = ? AND end_date = ?";
    const [result] = await db.execute(sql, [status, email, start_date, end_date]);
    if (result.affectedRows > 0) {
      console.log(`✅ Leave request updated: ${status}`);
      res.json({ message: `Leave request ${status} successfully` });
    } else {
      console.error("❌ No matching leave request found");
      res.status(404).json({ error: "No matching leave request found" });
    }
  } catch (err) {
    console.error("❌ Error updating leave request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.delete('/delete-leave/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM leave_table WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      res.json({ message: "Leave deleted successfully" });
    } else {
      res.status(404).json({ error: "Leave not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error while deleting leave" });
  }
});





// ✅ Attendance Submission
app.post("/attendance", verifyToken, async (req, res) => {
  const { date, attendanceDetails } = req.body;
  const email = req.user.email;

  if (!date || !attendanceDetails || Object.keys(attendanceDetails).length !== 5) {
    return res.status(400).json({ error: "Invalid attendance data" });
  }

  try {
    const sql = `INSERT INTO attendance (email, date, hour1, hour2, hour3, hour4, hour5) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
      email,
      date,
      attendanceDetails[1],
      attendanceDetails[2],
      attendanceDetails[3],
      attendanceDetails[4],
      attendanceDetails[5],
    ]);

    res.json({ message: "Attendance recorded successfully" });
  } catch (err) {
    console.error("❌ Attendance Submission Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Apply OD
app.post("/apply-od", verifyToken, upload.single("file"), async (req, res) => {
  const { date, event } = req.body;
  const email = req.user.email;
  const file_name = req.file ? req.file.filename : null;

  try {
    const sql = "INSERT INTO od_requests (email, date, event, file_name) VALUES (?, ?, ?, ?)";
    const [result] = await db.execute(sql, [email, date, event, file_name]);
    res.json({ id: result.insertId, email, date, event, file_name });
  } catch (err) {
    console.error("❌ OD Application Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Get OD History
app.get("/od-history", verifyToken, async (req, res) => {
  try {
    const sql = "SELECT * FROM od_requests WHERE email = ? ORDER BY created_at DESC";
    const [results] = await db.execute(sql, [req.user.email]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Delete OD Request
app.delete("/delete-od/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  try {
    const sql = "DELETE FROM od_requests WHERE id = ? AND email = ?";
    await db.execute(sql, [id, email]);
    res.json({ message: "OD request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});
// ✅ Get all OD requests (For Admins)
app.get("/od-requests", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  try {
    const [results] = await db.query("SELECT * FROM od_requests ORDER BY created_at DESC");
    res.json(results);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error." });
  }
});

// ✅ Update OD Request Status (Admin Approval)
app.put("/update-od", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    console.error("❌ Unauthorized: Only admin can approve/reject OD requests.");
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id, email, status } = req.body;

  if (!id || !email || !status) {
    console.error("❌ Missing fields:", { id, email, status });
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Check if OD request exists
    const [existingOD] = await db.query("SELECT * FROM od_requests WHERE id = ? AND email = ?", [id, email]);

    if (existingOD.length === 0) {
      console.error(`❌ OD request not found for ID: ${id}`);
      return res.status(404).json({ error: "OD request not found" });
    }

    // Update the status
    const sql = "UPDATE od_requests SET status = ? WHERE id = ? AND email = ?";
    const [result] = await db.query(sql, [status, id, email]);

    if (result.affectedRows > 0) {
      console.log(`✅ OD request updated successfully: ${status}`);
      res.json({ message: `OD request ${status} successfully` });
    } else {
      console.error("❌ No matching OD request found for update.");
      res.status(404).json({ error: "OD request update failed" });
    }
  } catch (err) {
    console.error("❌ Error updating OD request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Fetch all events
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM events");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add new event
app.post("/api/events", async (req, res) => {
  const { title, start, all_day } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO events (title, start, all_day) VALUES (?, ?, ?)",
      [title, start, all_day]
    );
    res.json({ id: result.insertId, title, start, all_day });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Delete event
app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM events WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Serve Uploaded Files
app.use("/uploads", express.static("uploads"));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
