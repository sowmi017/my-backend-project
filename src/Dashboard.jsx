import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiClock, FiBookOpen } from "react-icons/fi";
import { BsCalendarCheck } from "react-icons/bs";
import { FaChalkboardTeacher, FaRegCalendarAlt, FaUserCheck, FaSignOutAlt } from "react-icons/fa";
import { MdMeetingRoom, MdMessage } from "react-icons/md";
import axios from "axios";
import "./home.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");
  
    console.log("Stored Token:", storedToken);
    console.log("Stored Email:", storedEmail);
  
    if (!storedToken || !storedEmail) {
      console.log("Token or email missing, redirecting to login");
      navigate("/login");
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);
  
  if (!authChecked) return <p>Checking authentication...</p>;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");

    axios
      .get(`http://localhost:5000/dashboard?email=${storedEmail}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          setError("Invalid data received from the server.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          navigate("/login");
        } else {
          setError("Failed to load dashboard data. Please try again later.");
        }
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!data) {
    return <p>Error loading dashboard data.</p>;
  }

  return (
    <div className="home">
      <aside className="sidebar">
        <h2 className="sidebar-title">Faculty Portal</h2>
        <ul className="menu">
          <li><Link className="menu-link active" to="/dashboard"><FaChalkboardTeacher className="menu-icon" /> Dashboard</Link></li>
          <li><Link className="menu-link" to="/attendance"><FaUserCheck className="menu-icon" /> Attendance</Link></li>
          <li><Link className="menu-link" to="/calendar"><FaRegCalendarAlt className="menu-icon" /> Calendar</Link></li>
          <li><Link className="menu-link" to="/apply-leave"><BsCalendarCheck className="menu-icon" /> Apply Leave</Link></li>
          <li><Link className="menu-link" to="/od"><FiClock className="menu-icon" /> OD</Link></li>
          <li><Link className="menu-link" to="/message"><MdMessage className="menu-icon" /> Message</Link></li>
          <li><Link className="menu-link" to="/meeting"><MdMeetingRoom className="menu-icon" /> Meeting</Link></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}><FaSignOutAlt className="menu-icon" /> Logout</button>
      </aside>

      <div className="content">
        <header className="header">
          <h1>Dashboard</h1>
          <h3>Welcome, {localStorage.getItem("email")}</h3>
        </header>

        <main className="main">
          <div className="dashboard-widgets">
            <div className="widget"><FiClock className="widget-icon" /><h2>Total Hours</h2><p>{data?.faculty?.total_hours ?? 0}</p></div>
            <div className="widget"><FiBookOpen className="widget-icon" /><h2>Total Classes</h2><p>{data?.faculty?.total_classes ?? 0}</p></div>
            <div className="widget"><BsCalendarCheck className="widget-icon" /><h2>Leave Balance</h2><p>{data?.leaveBalance ?? "N/A"}</p></div>
            <div className="widget"><h2>Attendance %</h2><p>{data?.faculty?.attendance_percentage ?? "N/A"}%</p></div>
          </div>

          <div className="info-card">
            <h3>Recent Attendance</h3>
            <ul>
              {data?.attendance?.map((record) => (
                <li key={record.id}>
                  <p>Date: {record.date}</p>
                  <p>Hour 1: {record.hour1}</p>
                  <p>Hour 2: {record.hour2}</p>
                  <p>Hour 3: {record.hour3}</p>
                  <p>Hour 4: {record.hour4}</p>
                  <p>Hour 5: {record.hour5}</p>
                </li>
              ))}
            </ul>
          </div>
        </main>

        <footer className="footer">
          <p>College ID: stellamariscollege@edu.in | Phone: 044-28111987</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;