import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaEnvelope, FaUsers, FaSignOutAlt, FaUserCheck, FaFileAlt, FaVideo } from "react-icons/fa";
import "./home.css";

const Messages = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    const storedFacultyMessages = JSON.parse(localStorage.getItem("sentMessages")) || [];
    setSentMessages(storedFacultyMessages);

    const storedAdminMessages = JSON.parse(localStorage.getItem("adminSentMessages")) || [];
    setReceivedMessages(storedAdminMessages);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      alert("Please fill in all fields before sending.");
      return;
    }

    const newMessage = {
      id: sentMessages.length + 1,
      email,
      subject,
      message,
      date: new Date().toLocaleString(),
    };

    const updatedMessages = [...sentMessages, newMessage];
    setSentMessages(updatedMessages);
    localStorage.setItem("sentMessages", JSON.stringify(updatedMessages));

    alert("Message sent successfully!");
    setEmail("");
    setSubject("");
    setMessage("");
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
          <li><Link className="menu-link" to="/"><FaHome /> Dashboard</Link></li>
          <li><Link className="menu-link" to="/attendance"><FaUserCheck /> Attendance</Link></li>
          <li><Link className="menu-link" to="/apply-leave"><FaFileAlt /> Apply Leave</Link></li>
          <li><Link className="menu-link" to="/od"><FaUsers /> OD</Link></li>
          <li><Link className="menu-link" to="/calendar"><FaCalendarAlt /> Calendar</Link></li>
          <li><Link className="menu-link" to="/faculty-messages"><FaEnvelope /> Messages</Link></li>
        </ul>
         <button className="logout-button" onClick={handleLogout}>
                  <FaSignOutAlt className="menu-icon" /> Logout
                </button>
      </aside>

      {/* Main Content */}
      <div className="content">
        <header className="header">
          <h1>Messages</h1>
        </header>

        <main className="main">
          {/* Received Messages */}
          {receivedMessages.length > 0 ? (
            <div className="received-messages">
              <h2>Admin Messages</h2>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedMessages.map((msg) => (
                    <tr key={msg.id}>
                      <td>{msg.id}</td>
                      <td>{msg.email}</td>
                      <td>{msg.subject}</td>
                      <td>{msg.message}</td>
                      <td>{msg.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No messages received.</p>
          )}

          {/* Send Message */}
          <div className="message-form">
            <h2>Send Message</h2>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Recipient Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter recipient email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-button">Send</button>
            </form>
          </div>
        </main>

        <footer className="footer">
          <p>Faculty Panel - Stella Maris College</p>
        </footer>
      </div>
    </div>
  );
};

export default Messages;


