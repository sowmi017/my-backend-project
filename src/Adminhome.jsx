import React from 'react';
import { Link } from 'react-router-dom';
import { AiFillHome, AiOutlineMessage, AiOutlineLogout } from "react-icons/ai";
import { BsPersonCheck, BsFillPersonLinesFill } from "react-icons/bs";
import './home.css';

const AdminHome = () => {
  return (
    <div className="home">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Portal</h2>
        <ul className="menu">
          <li><Link className="menu-link" to="/manage-user"><AiFillHome className="menu-icon" /> Manage User</Link></li>
          <li><Link className="menu-link" to="/leave-approval"><BsFillPersonLinesFill className="menu-icon" /> Leave Approval</Link></li>
          <li><Link className="menu-link" to="/od-approval"><BsPersonCheck className="menu-icon" /> OD Approval</Link></li>
        </ul>
        <button className="logout-button">
          <AiOutlineLogout className="menu-icon" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="content">
        {/* Header */}
        <header className="header">
          <div className="admin-info">
            <img 
              src="https://via.placeholder.com/50" 
              alt="Admin" 
              className="admin-image" 
            />
            <span>Admin Portal</span>
          </div>
          <h1>Welcome to the Admin Portal</h1>
        </header>

        {/* Instructions Section */}
        <section className="instructions">
          <h2>General Instructions for Admin</h2>
          <ol>
            <li>Use the sidebar menu to manage users, approve leaves, and OD requests.</li>
            <li>Ensure to log out after completing your session for security purposes.</li>
            <li>Check and respond to messages in the Message section.</li>
            <li>Monitor faculty activities and ensure smooth operations.</li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>College ID: admin@college.edu | Phone: 044-28111987 </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminHome;
