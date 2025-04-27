import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaUserShield } from "react-icons/fa";
import "./home.css";

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div className="containers">
      <h1>Management Logins</h1>
      <div className="portal-container">
        <div className="portal-card" onClick={() => navigate("/login")}>
          <FaUserGraduate className="portal-icon" />
          <div className="portal-title">Faculty Portal</div>
          <p className="portal-desc">
            Access your dashboard, manage attendance, and more
          </p>
        </div>

        <div className="portal-card" onClick={() => navigate("/admin-login")}>
          <FaUserShield className="portal-icon" />
          <div className="portal-title">Admin Portal</div>
          <p className="portal-desc">
            Manage faculty, approve requests, and oversee operations
          </p>
        </div>
      </div>
    </div>
  );
};

export default Intro;
