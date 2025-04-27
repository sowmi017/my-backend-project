import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import { AiFillHome, AiOutlineCalendar, AiOutlineMessage, AiOutlineLogout } from "react-icons/ai";
import { BsPersonCheck, BsFillPersonLinesFill, BsCameraVideo } from "react-icons/bs";
import './home.css';

const Home = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/intro";
  };

  return (
    <div className="home">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Faculty Portal</h2>
        <ul className="menu">
          <li><Link className="menu-link" to="/attendance"><BsPersonCheck className="menu-icon" /> Attendance</Link></li>
          <li><Link className="menu-link" to="/apply-leave"><BsFillPersonLinesFill className="menu-icon" /> Apply Leave</Link></li>
          <li><Link className="menu-link" to="/od"><BsPersonCheck className="menu-icon" /> OD</Link></li>
          <li><Link className="menu-link" to="/calendar"><AiOutlineCalendar className="menu-icon" /> Calendar</Link></li>
          <li><Link className="menu-link" to="/meeting"><BsCameraVideo className="menu-icon" /> Meeting</Link></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <AiOutlineLogout className="menu-icon" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="content">
        {/* Header */}
        <header className="header">
          <div className="faculty-info">
            <img 
              src="https://via.placeholder.com/50" 
              alt="Faculty" 
              className="faculty-image" 
            />
            <span>Faculty ID: F12345</span>
          </div>
          <h1>Welcome to the Faculty Portal</h1>
        </header>

        {/* Instructions Section */}
        <section className="instructions">
          <h2>General Instructions for Faculty</h2>
          <ol>
            <li>Use the sidebar menu to navigate to different sections like Dashboard, Attendance, Apply Leave, etc.</li>
            <li>Ensure to log out after completing your session for security purposes.</li>
            <li>Check the Calendar section for important dates and events.</li>
            <li>Use the Message section to communicate with administration or colleagues.</li>
            <li>Apply for leaves using the Apply Leave section and track their status.</li>
            <li>Attend scheduled meetings via the Meeting section.</li>
            <li>Update your personal details in the Dashboard, if required.</li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>College ID: stellamariscollege@edu.in | Phone: 044-28111987 </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
