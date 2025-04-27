import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHome, AiOutlineMessage, AiOutlineLogout } from "react-icons/ai";
import { BsPersonCheck, BsFillPersonLinesFill } from "react-icons/bs";
import "./home.css";

const ODApproval = () => {
  const [odRequests, setODRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRow, setUpdatingRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchODRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Admin not authenticated. Redirecting to login.");
          navigate("/adminlogin");
          return;
        }
        const response = await axios.get("http://localhost:5000/od-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setODRequests(response.data);
      } catch (err) {
        setError("Failed to load OD requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchODRequests();
  }, [navigate]);

  const updateODStatus = async (id, email, date, status) => {
    if (updatingRow === id) return;
    setUpdatingRow(id);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Admin not authenticated. Redirecting to login.");
        navigate("/adminlogin");
        return;
      }
      await axios.put(
        "http://localhost:5000/update-od",
        { id, email, date, status },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setODRequests((prev) => prev.map((od) => (od.id === id ? { ...od, status } : od)));
      alert(`OD request ${status} successfully!`);
    } catch (error) {
      alert("Failed to update OD status. Try again later.");
    } finally {
      setUpdatingRow(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/intro";
  };

  return (
    <div className="home">
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Portal</h2>
        <ul className="menu">
          <li><Link className="menu-link" to="/manage-user"><AiFillHome className="menu-icon" /> Manage User</Link></li>
          <li><Link className="menu-link" to="/leave-approval"><BsFillPersonLinesFill className="menu-icon" /> Leave Approval</Link></li>
          <li><Link className="menu-link active" to="/od-approval"><BsPersonCheck className="menu-icon" /> OD Approval</Link></li>
          <li><Link className="menu-link" to="/admin-message"><AiOutlineMessage className="menu-icon" /> Messages</Link></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
        <AiOutlineLogout /> Logout</button>
        
      </aside>

      <div className="content">
        <header className="header"><h1>OD Approval</h1></header>
        <main className="main">
          <h2>Pending OD Requests</h2>
          {error && <p className="error-message">{error}</p>}
          {loading ? (
            <p>Loading OD requests...</p>
          ) : odRequests.length === 0 ? (
            <p>No OD requests found.</p>
          ) : (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Faculty Email</th>
                  <th>Requested On</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {odRequests.map((od) => (
                  <tr key={od.id}>
                    <td>{od.date}</td>
                    <td>{od.event}</td>
                    <td>{od.email}</td>
                    <td>{new Date(od.created_at).toLocaleString()}</td>
                    <td>{od.file_name ? <a href={`http://localhost:5000/uploads/${od.file_name}`} target="_blank" rel="noopener noreferrer">Download</a> : "No File"}</td>
                    <td className={`status ${od.status.toLowerCase()}`}>{od.status}</td>
                    <td>
                      <button className="approve-button" onClick={() => updateODStatus(od.id, od.email, od.date, "Approved")} disabled={od.status !== "Pending" || updatingRow === od.id}>{updatingRow === od.id ? "Processing..." : "Approve"}</button>
                      <button className="reject-button" onClick={() => updateODStatus(od.id, od.email, od.date, "Rejected")} disabled={od.status !== "Pending" || updatingRow === od.id}>{updatingRow === od.id ? "Processing..." : "Reject"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
};

export default ODApproval;