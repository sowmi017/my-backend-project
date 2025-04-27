import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AiFillHome, AiOutlineMessage, AiOutlineLogout } from "react-icons/ai";
import { BsPersonCheck, BsFillPersonLinesFill } from "react-icons/bs";
import "./home.css";

const ManageUser = () => {
  const [faculty, setFaculty] = useState([]);
  const [newFaculty, setNewFaculty] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await axios.get("http://localhost:5000/faculty");
      setFaculty(res.data);
    } catch (err) {
      console.error("Error fetching faculty:", err);
      alert("Failed to fetch faculty data.");
    }
  };

  const handleInputChange = (e) => {
    setNewFaculty({ ...newFaculty, [e.target.name]: e.target.value });
  };

  const addFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.password || !newFaculty.confirmPassword) {
      alert("All fields are required!");
      return;
    }
    if (newFaculty.password !== newFaculty.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", newFaculty);
      alert("Faculty Registered!");
      setNewFaculty({ name: "", email: "", password: "", confirmPassword: "" });
      fetchFaculty();
    } catch (err) {
      console.error("Error adding faculty:", err);
      alert("Failed to register faculty.");
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
          <li><Link className="menu-link" to="/od-approval"><BsPersonCheck className="menu-icon" /> OD Approval</Link></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <AiOutlineLogout /> Logout</button>
      </aside>

      <div className="content">
        <div className="section-container">
          <h2 className="section-title">Manage Faculty</h2>
          <div className="card">
            <h3>Add Faculty</h3>
            <div className="faculty-form">
              <input type="text" name="name" placeholder="Faculty Name" value={newFaculty.name} onChange={handleInputChange} />
              <input type="email" name="email" placeholder="Faculty Email" value={newFaculty.email} onChange={handleInputChange} />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={newFaculty.password} onChange={handleInputChange} />
              <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={newFaculty.confirmPassword} onChange={handleInputChange} />
              <label>
                <input type="checkbox" onChange={() => setShowPassword(!showPassword)} /> Show Password
              </label>
              <button className="approve-button" onClick={addFaculty}>Register Faculty</button>
            </div>
          </div>

          <div className="card">
            <h3>Faculty List</h3>
            <table>
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {faculty.length > 0 ? (
                  faculty.map((fac) => (
                    <tr key={fac.faculty_id}>
                      <td>{fac.faculty_id}</td>
                      <td>{fac.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No faculty found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
