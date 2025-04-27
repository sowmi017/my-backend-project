import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Intro from "./Intro"; // Ensure this file exists
import Login from "./Login";
import AdminLogin from "./Adminlogin";
import Home from "./Home";
import Attendance from "./Attendance";
import Calendar from "./Calendar";
import ApplyLeave from "./ApplyLeave";
import Message from "./Message";
import Meeting from "./Meeting";
import OD from "./OD";

// Admin pages
import AdminHome from "./Adminhome";
import ManageUser from "./Manageuser";
import LeaveApproval from "./Leaveapprovel";
import ODApproval from "./Odapprovel";
import AdminMessage from "./Adminmessage";

import "./Home.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ✅ Redirect root ("/") to Intro */}
        <Route path="/" element={<Navigate to="/intro" />} />
        
        {/* ✅ Ensure the Intro page is accessible */}
        <Route path="/intro" element={<Intro />} />
        
        {/* Other Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/od" element={<OD />} />
        <Route path="/message" element={<Message />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/manage-user" element={<ManageUser />} />
        <Route path="/leave-approval" element={<LeaveApproval />} />
        <Route path="/od-approval" element={<ODApproval />} />
        <Route path="/admin-message" element={<AdminMessage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
