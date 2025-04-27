import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Import the CSS

const App = () => {
  const [id, setId] = useState(""); // Faculty ID
  const [password, setPassword] = useState(""); // Password
  const [message, setMessage] = useState(""); // Feedback message
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login status

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3001/login", { id, password });
      if (response.data.success) {
        setMessage(response.data.message);
        setIsLoggedIn(true); // Mark user as logged in
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="container">
      <h1>Stella Maris College Faculty Login</h1>
      {!isLoggedIn ? (
        <div>
          <input
            type="text"
            className="input-field"
            placeholder="Faculty ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
        </div>
      ) : (
        <div>
          <h2>Welcome to the Faculty Dashboard!</h2>
          <button className="logout-button" onClick={() => setIsLoggedIn(false)}>
            Logout
          </button>
        </div>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default App;
