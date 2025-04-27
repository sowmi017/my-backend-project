import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHome, AiOutlineMessage, AiOutlineLogout } from "react-icons/ai";
import { BsFillPersonLinesFill, BsPersonCheck } from "react-icons/bs";
import "./home.css";

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRow, setUpdatingRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Admin not authenticated. Redirecting to login.");
          navigate("/adminlogin");
          return;
        }

        const response = await axios.get("http://localhost:5000/leave-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
      } catch (err) {
        setError("Failed to load leave requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [navigate]);

  const updateLeaveStatus = async (id, status) => {
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
        "http://localhost:5000/update-leave",
        { id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Leave request ${status} successfully!`);
      setLeaveRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );
    } catch {
      alert("Error updating leave request.");
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
          <li>
            <Link className="menu-link" to="/manage-user">
              <AiFillHome className="menu-icon" /> Manage User
            </Link>
          </li>
          <li>
            <Link className="menu-link active" to="/leave-approval">
              <BsFillPersonLinesFill className="menu-icon" /> Leave Approval
            </Link>
          </li>
          <li>
            <Link className="menu-link" to="/od-approval">
              <BsPersonCheck className="menu-icon" /> OD Approval
            </Link>
          </li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <AiOutlineLogout /> Logout
        </button>
      </aside>

      <div className="content">
        <h1>Leave Approval</h1>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p>Loading leave requests...</p>
        ) : leaveRequests.length === 0 ? (
          <p>No leave requests found.</p>
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
              {leaveRequests.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    {leave.start_date && leave.end_date
                      ? `${leave.start_date} to ${leave.end_date}`
                      : "N/A"}
                  </td>
                  <td>{leave.event || "N/A"}</td>
                  <td>{leave.email}</td>
                  <td>
                    {leave.created_at
                      ? new Date(leave.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    {leave.file_name ? (
                      <a
                        href={`http://localhost:5000/uploads/${leave.file_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      "No File"
                    )}
                  </td>
                  <td className={`status ${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </td>
                  <td>
                    <button
                      className="approve-button"
                      onClick={() => updateLeaveStatus(leave.id, "Approved")}
                      disabled={leave.status !== "Pending" || updatingRow === leave.id}
                    >
                      {updatingRow === leave.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => updateLeaveStatus(leave.id, "Rejected")}
                      disabled={leave.status !== "Pending" || updatingRow === leave.id}
                    >
                      {updatingRow === leave.id ? "Processing..." : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;
