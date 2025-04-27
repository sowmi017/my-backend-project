import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaHome, FaUserCheck, FaCalendarAlt, FaEnvelope, FaUsers, FaSignOutAlt, FaClipboardList } from "react-icons/fa";
import "./home.css";

const OD = () => {
  const [odRequests, setOdRequests] = useState([]);
  const [date, setDate] = useState(null);
  const [event, setEvent] = useState("");
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("token"); // Assuming JWT is stored in localStorage

  // ✅ Fetch OD Requests from Backend
  useEffect(() => {
    const fetchODRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/od-history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOdRequests(res.data);
      } catch (err) {
        console.error("Error fetching OD requests:", err);
      }
    };
    fetchODRequests();
  }, [token]);

  // ✅ Handle OD Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !event) {
      alert("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("date", date.toISOString().split("T")[0]);
    formData.append("event", event);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/apply-od", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setOdRequests([...odRequests, res.data]); // Add new OD request to the list
      resetForm();
    } catch (err) {
      console.error("Error submitting OD request:", err);
    }
  };

  // ✅ Handle Delete OD Request
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete-od/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOdRequests(odRequests.filter((request) => request.id !== id));
    } catch (err) {
      console.error("Error deleting OD request:", err);
    }
  };

  // ✅ Reset Form
  const resetForm = () => {
    setDate(null);
    setEvent("");
    setFile(null);
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/intro";
  };

  return (
    <div className="home">
      {/* Sidebar */}
      <aside className="sidebar">
        <ul className="menu">
          <h2 className="sidebar-title">Faculty Portal</h2>
          <li><a className="menu-link" href="/attendance"><FaUserCheck /> Attendance</a></li>
          <li><a className="menu-link" href="/apply-leave"><FaClipboardList /> Apply Leave</a></li>
          <li><a className="menu-link" href="/od"><FaClipboardList /> OD</a></li>
          <li><a className="menu-link" href="/calendar"><FaCalendarAlt /> Calendar</a></li>
          <li><a className="menu-link" href="/message"><FaEnvelope /> Message</a></li>
          <li><a className="menu-link" href="/meeting"><FaUsers /> Meeting</a></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout</button>
      </aside>

      {/* Main Content */}
      <div className="content">
        <header className="header">
          <h1>OD Request</h1>
        </header>

        <main className="main">
          {/* OD Request Form */}
          <form className="apply-leave-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date:</label>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                required
              />
            </div>

            <div className="form-group">
              <label>Event:</label>
              <input
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="form-group">
              <label>Upload File (Optional):</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="submit-button">Submit OD</button>
          </form>

          {/* List of OD Requests */}
          {odRequests.length > 0 && (
            <div className="leave-summary">
              <h2>Submitted OD Requests</h2>
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Event</th>
                    <th>File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {odRequests.map((request, index) => (
                    <tr key={request.id}>
                      <td>{index + 1}</td>
                      <td>{request.date}</td>
                      <td>{request.event}</td>
                      <td>
                        {request.file_name ? (
                          <a href={`http://localhost:5000/uploads/${request.file_name}`} target="_blank" rel="noopener noreferrer">
                            {request.file_name}
                          </a>
                        ) : "N/A"}
                      </td>
                      <td>
                        <button className="d-button" onClick={() => handleDelete(request.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>College ID: stellamariscollege@edu.in | Phone: 044-28111987</p>
        </footer>
      </div>
    </div>
  );
};

export default OD;
