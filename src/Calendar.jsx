import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { FaCalendarAlt, FaEnvelope, FaUsers, FaSignOutAlt, FaClipboardList, FaChalkboardTeacher, FaUserCheck } from "react-icons/fa";

import "./home.css";

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched Events from API:", response.data);

        const processedEvents = response.data.map(event => ({
          id: Number(event.id), // Ensure ID is a number
          title: event.title,
          start: new Date(event.start).toISOString(), // Convert to ISO format
          allDay: event.all_day === 1 || event.all_day === true,
        }));

        console.log("Processed Events for Calendar:", processedEvents);
        setEvents(processedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleDateClick = async (info) => {
    const title = prompt("Enter event title:");
    if (title) {
      const newEvent = {
        title,
        start: info.dateStr, // Use MySQL compatible date format
        all_day: true,
      };

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post("http://localhost:5000/api/events", newEvent, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Event Added:", response.data);

        setEvents(prevEvents => [
          ...prevEvents,
          {
            id: response.data.id,
            title: response.data.title,
            start: response.data.start,
            allDay: response.data.all_day,
          }
        ]);
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  const handleEventClick = async (info) => {
    console.log("Trying to delete event:", info.event.id);

    if (!info.event.id) {
      console.error("Error: Event ID is undefined!");
      return;
    }

    if (window.confirm(`❌ Delete the event "${info.event.title}"?`)) {
      try {
        const token = localStorage.getItem("token");
        const eventId = Number(info.event.id); // Ensure event ID is a number

        const response = await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Delete response:", response.data);

        if (response.status === 200) {
          setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
          console.log(`✅ Event ${eventId} deleted successfully!`);
        } else {
          console.error("Error: Failed to delete event from backend.");
        }
      } catch (error) {
        console.error("Error deleting event:", error.response ? error.response.data : error);
      }
    }
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
          <h1>📅 Calendar</h1>
        </header>
        <main className="main">
          <div className="calendar-container">
            <FullCalendar
              key={events.length} // Forces re-render when events update
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                start: "prev,next today",
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              editable={true}
              selectable={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;