import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./home.css";
import { FaUserCheck, FaRegCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import { BsCalendarCheck } from "react-icons/bs";
import { MdMeetingRoom, MdMessage } from "react-icons/md";
import { FiClock } from "react-icons/fi";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState({});
  const facultyEmail = localStorage.getItem("faculty_email");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (facultyEmail) {
      fetchAttendance(facultyEmail);
    }
  }, [facultyEmail]);

  const fetchAttendance = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/attendance/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleAttendanceChange = (hour, value) => {
    setSelectedAttendance((prev) => ({ ...prev, [hour]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("User not authenticated");
      return;
    }
    if (Object.keys(selectedAttendance).length !== 5) {
      alert("Please mark attendance for all 5 hours.");
      return;
    }

    const attendanceData = {
      date: selectedDate.toISOString().split("T")[0],
      email: facultyEmail,
      attendanceDetails: selectedAttendance,
    };

    try {
      const response = await fetch("http://localhost:5000/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      alert("Attendance submitted successfully!");
      setSelectedAttendance({});
      fetchAttendance(facultyEmail);
    } catch (error) {
      console.error("Error posting attendance:", error);
      alert("Failed to submit attendance.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/intro";
  };

  return (
    <div className="home">
      <aside className="sidebar">
        <h2 className="sidebar-title">Faculty Portal</h2>
        <ul className="menu">
          <li><Link className="menu-link" to="/attendance"><FaUserCheck className="menu-icon" /> Attendance</Link></li>
          <li><Link className="menu-link" to="/apply-leave"><BsCalendarCheck className="menu-icon" /> Apply Leave</Link></li>
          <li><Link className="menu-link" to="/od"><FiClock className="menu-icon" /> OD</Link></li>
          <li><Link className="menu-link" to="/calendar"><FaRegCalendarAlt className="menu-icon" /> Calendar</Link></li>
          <li><Link className="menu-link" to="/meeting"><MdMeetingRoom className="menu-icon" /> Meeting</Link></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="menu-icon" /> Logout
        </button>
      </aside>

      <div className="content">
        <header className="header"><h1>Post Attendance</h1></header>
        <main className="main">
          <div className="message-form">
            <h2>Select Date & Mark Attendance</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Date:</label>
                <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd" required />
              </div>
              {[...Array(5)].map((_, index) => (
                <div className="form-group" key={index}>
                  <label>{`Hour ${index + 1}:`}</label>
                  <select value={selectedAttendance[index + 1] || ""} onChange={(e) => handleAttendanceChange(index + 1, e.target.value)} required>
                    <option value="">Select Attendance</option>
                    <option value="Attended Class">Attended Class</option>
                    <option value="Meeting">Meeting</option>
                    <option value="OD">OD</option>
                  </select>
                </div>
              ))}
              <button type="submit" className="curved-button">Post Attendance</button>
            </form>
          </div>

          {attendance.length > 0 && (
            <div className="sent-messages">
              <h2>Attendance Records</h2>
              <table>
                <thead>
                  <tr><th>#</th><th>Date</th><th>Hour 1</th><th>Hour 2</th><th>Hour 3</th><th>Hour 4</th><th>Hour 5</th></tr>
                </thead>
                <tbody>
                  {attendance.map((entry, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{entry.date}</td>
                      <td>{entry.hour1}</td>
                      <td>{entry.hour2}</td>
                      <td>{entry.hour3}</td>
                      <td>{entry.hour4}</td>
                      <td>{entry.hour5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
        <footer className="footer"><p>College ID: stellamariscollege@edu.in | Phone: 044-28111987</p></footer>
      </div>
    </div>
  );
};

export default Attendance;
