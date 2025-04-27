import React, { useState, useEffect } from "react";
import { AiOutlineCalendar, AiOutlineMessage, AiOutlineLogout } from "react-icons/ai";
import { FaClipboardList, FaUserCheck, FaUsers } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "./home.css";

const ApplyLeave = () => {
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [event, setEvent] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  const token = localStorage.getItem("token"); // ✅ Define token

  const fetchLeaveApplications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/leave-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveDetails(response.data);
    } catch (error) {
      console.error("Error fetching leave applications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation: Ensure fields are filled correctly
    if (!startDate || !event || reason.length < 10) {
      setError("All fields are required, and reason must be at least 10 characters.");
      return;
    }

    setError(""); // Clear error if valid

    const formData = new FormData();
    formData.append("start_date", startDate.toISOString().split("T")[0]);
    formData.append("end_date", endDate ? endDate.toISOString().split("T")[0] : startDate.toISOString().split("T")[0]);
    formData.append("event", event);
    formData.append("reason", reason);
    if (file) formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/apply-leave", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);
      fetchLeaveApplications();
      resetForm();
    } catch (error) {
      console.error("Error submitting leave:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave application?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/delete-leave/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Update local state after delete
      setLeaveDetails(leaveDetails.filter((leave) => leave.id !== id));
    } catch (error) {
      console.error("Error deleting leave:", error.response?.data || error.message);
    }
  };

  const resetForm = () => {
    setStartDate(null);
    setEndDate(null);
    setEvent("");
    setReason("");
    setFile(null);
    setError(""); // ✅ Reset error when clearing form
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
          <li><a className="menu-link" href="/attendance"><FaUserCheck /> Attendance</a></li>
          <li><a className="menu-link" href="/apply-leave"><FaClipboardList /> Apply Leave</a></li>
          <li><a className="menu-link" href="/od"><FaUsers /> OD</a></li>
          <li><a className="menu-link" href="/calendar"><AiOutlineCalendar /> Calendar</a></li>
          <li><a className="menu-link" href="/meeting"><FaUsers /> Meeting</a></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <AiOutlineLogout className="menu-icon" /> Logout
        </button>
      </aside>

      <div className="content">
        <header className="header">
          <h1>Apply Leave</h1>
        </header>

        <main className="main">
          <form className="apply-leave-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Start Date:</label>
              <DatePicker selected={startDate} onChange={setStartDate} dateFormat="yyyy-MM-dd" required />
            </div>

            <div className="form-group">
              <label>End Date (Optional):</label>
              <DatePicker 
                selected={endDate} 
                onChange={setEndDate} 
                dateFormat="yyyy-MM-dd" 
                minDate={startDate || new Date()} 
              />
            </div>

            <div className="form-group">
              <label>Event:</label>
              <input type="text" value={event} onChange={(e) => setEvent(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Reason:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter a valid reason (at least 10 characters)"
                required
              ></textarea>
              {error && <p className="error-message">{error}</p>} {/* ✅ Proper JSX */}
            </div>

            <div className="form-group">
              <label>Upload File (Optional):</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <button type="submit" className="submit-button">Apply Leave</button>
          </form>

          <h2>Leave Applications</h2>
          <table className="leave-table">
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Event</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveDetails.length > 0 ? (
                leaveDetails.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.start_date}</td>
                    <td>{leave.end_date}</td>
                    <td>{leave.event}</td>
                    <td>{leave.reason}</td>
                    <td><button className="d-button" onClick={() => handleDelete(leave.id)}>Delete</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No leave applications found.</td></tr>
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default ApplyLeave;
