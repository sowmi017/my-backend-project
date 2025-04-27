import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha) {
      setError("Invalid CAPTCHA. Please try again.");
      setCaptcha(generateCaptcha());
      setUserCaptcha("");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/login", { email, password });
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/home"); // Redirect to Home page
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Faculty Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-groups">
            <label>Email ID:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-groups">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-groups">
            <label>CAPTCHA:</label>
            <div className="captcha-box">{captcha}</div>
            <input type="text" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button className="curved-button" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;