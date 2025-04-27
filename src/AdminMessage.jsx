import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaEnvelope, FaSignOutAlt, FaUserCheck, FaFileAlt } from "react-icons/fa";
import "./home.css";

const AdminMessages = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("sentMessages")) || [];
    setReceivedMessages(storedMessages);

    const storedAdminMessages = JSON.parse(localStorage.getItem("adminSentMessages")) || [];
    setSentMessages(storedAdminMessages);
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
    localStorage.setItem("adminSentMessages", JSON.stringify(updatedMessages));

    alert("Message sent successfully!");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="home">
      {/* Sidebar */}
      <aside className="sidebar">
        <ul className="menu">
          <h2 className="sidebar-title">Admin Portal</h2>
          <li><Link className="menu-link" to="/manage-users"><FaUsers /> Manage Users</Link></li>
          <li><Link className="menu-link" to="/attendance"><FaUserCheck /> Attendance</Link></li>
          <li><Link className="menu-link" to="/leave-approval"><FaFileAlt /> Leave Approval</Link></li>
          <li><Link className="menu-link" to="/od-approval"><FaUsers /> OD Approval</Link></li>
        </ul>
        <button className="logout-button"><FaSignOutAlt /> Logout</button>
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
              <h2>Faculty Messages</h2>
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
          <p>Admin Panel - Stella Maris College</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminMessages;


//Admin side