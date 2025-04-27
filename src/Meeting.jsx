import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { FaCalendarAlt, FaEnvelope, FaUsers, FaSignOutAlt, FaClipboardList, FaChalkboardTeacher, FaUserCheck } from "react-icons/fa";
import "./home.css";

const fetchMeetings = async (setMeetings, setError) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:5000/api/meetings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMeetings(response.data.filter(meeting => meeting.date === new Date().toISOString().split("T")[0]));
  } catch (error) {
    setError(error.response?.data?.error || "Error fetching meetings");
  }
};

const saveMeeting = async (meetingData, setMeetings, setError) => {
  try {
    const response = await axios.post("http://localhost:5000/api/meetings", meetingData, {
      headers: { "Content-Type": "application/json" },
    });
    setMeetings((prev) => [...prev, response.data]);
  } catch (error) {
    setError(error.response?.data?.error || "Error saving meeting");
  }
};

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [meetTitle, setMeetTitle] = useState("");
  const [meetDate, setMeetDate] = useState(new Date());
  const [meetTime, setMeetTime] = useState("");
  const [meetType, setMeetType] = useState("online");
  const [meetLink, setMeetLink] = useState("");
  const [meetLocation, setMeetLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMeetings(setMeetings, setError);
  }, []);

  const handleCreateMeeting = () => {
    if (!meetTitle || !meetDate || !meetTime) {
      alert("Please enter all details!");
      return;
    }
    if (meetType === "online") {
      setMeetLink("https://meet.google.com/new");
    }
  };

  const handleSaveMeeting = async () => {
    if (!meetTitle || !meetDate || !meetTime || (meetType === "online" && !meetLink) || (meetType === "offline" && !meetLocation)) {
      alert("Please complete all fields before saving!");
      return;
    }

    const newMeeting = {
      title: meetTitle,
      date: meetDate.toLocaleDateString(),
      time: meetTime,
      type: meetType,
      link: meetType === "online" ? meetLink : "",
      location: meetType === "offline" ? meetLocation : "",
    };

    await saveMeeting(newMeeting, setMeetings, setError);
    setMeetTitle("");
    setMeetDate(new Date());
    setMeetTime("");
    setMeetLink("");
    setMeetLocation("");
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/intro";
  };
  return (
    <div className="home">
      {/* Sidebar */}
      <aside className="sidebar">
        <ul className="menu">
          <h2 className="sidebar-title">Faculty Portal</h2>
          <li><a className="menu-link" href="/attendance"><FaUserCheck /> Attendance</a></li>
          <li><a className="menu-link" href="/apply-leave"><FaClipboardList /> Apply Leave</a></li>
          <li><a className="menu-link" href="/od"><FaClipboardList /> OD</a></li>
          <li><a className="menu-link" href="/calendar"><FaCalendarAlt /> Calendar</a></li>
          <li><a className="menu-link" href="/meeting"><FaUsers /> Meeting</a></li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout</button>
      </aside>

      <div className="content">
        <header className="header">
          <h1>Meeting</h1>
        </header>

        <main className="main">
          {error && <p className="error-message">{error}</p>}

          <form className="message-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Meeting Title:</label>
              <input type="text" value={meetTitle} onChange={(e) => setMeetTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Meeting Date:</label>
              <DatePicker selected={meetDate} onChange={setMeetDate} dateFormat="yyyy-MM-dd" required />
            </div>

            <div className="form-group">
              <label>Meeting Time:</label>
              <input type="time" value={meetTime} onChange={(e) => setMeetTime(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Meeting Type:</label>
              <select value={meetType} onChange={(e) => setMeetType(e.target.value)}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {meetType === "offline" && (
              <div className="form-group">
                <label>Meeting Location:</label>
                <input type="text" value={meetLocation} onChange={(e) => setMeetLocation(e.target.value)} required />
              </div>
            )}

            {meetType === "online" && !meetLink && (
              <button type="button" className="submit-button" onClick={handleCreateMeeting}>Generate Meet Link</button>
            )}

            {meetLink && (
              <div className="meeting-link">
                <p>Meeting Link: <a href={meetLink} target="_blank" rel="noopener noreferrer">{meetLink}</a></p>
              </div>
            )}

            <button type="button" className="submit-button" onClick={handleSaveMeeting}>Save Meeting</button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Meeting;
