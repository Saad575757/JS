'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import interactionPlugin from '@fullcalendar/interaction';
import { Draggable } from '@fullcalendar/interaction';

export default function CalendarPage() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("googleApiKey") || "");
  const [calendarId, setCalendarId] = useState(() => localStorage.getItem("googleCalendarId") || "");
  const [keyInput, setKeyInput] = useState(apiKey);
  const [idInput, setIdInput] = useState(calendarId);

  const [events, setEvents] = useState([]);

  // Save settings
  const handleSave = () => {
    localStorage.setItem("googleApiKey", keyInput);
    localStorage.setItem("googleCalendarId", idInput);
    setApiKey(keyInput);
    setCalendarId(idInput);
    alert("✅ Google Calendar settings saved!");
  };

  // Fetch Google Calendar events
  useEffect(() => {
    if (!apiKey || !calendarId) {
      console.warn("⚠ Google API Key or Calendar ID not set");
      return;
    }

    console.log("🔑 Google API Key:", apiKey);
    console.log("📅 Google Calendar ID:", calendarId);

    fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        console.log("📅 Google Calendar API Response:", data);
        if (data.items) {
          const googleEvents = data.items.map(event => ({
            id: event.id,
            title: event.summary || "No Title",
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date
          }));
          setEvents(googleEvents);
        } else {
          setEvents([]);
        }
      })
      .catch(err => {
        console.error("❌ Google Calendar fetch error:", err);
        setEvents([]);
      });
  }, [apiKey, calendarId]);

  // Make external events draggable (if needed)
  useEffect(() => {
    const draggableEl = document.getElementById('external-events');
    if (draggableEl) {
      new Draggable(draggableEl, { itemSelector: '.external-event' });
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Google Calendar Integration</h2>

      {/* Setup fields */}
      <div style={{ marginBottom: 20, padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>Google API Key:</label>
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Enter your Google API Key"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label style={{ display: 'block', marginBottom: 5 }}>Google Calendar ID:</label>
        <input
          type="text"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          placeholder="example@gmail.com or calendar ID"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <button
          onClick={handleSave}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Save Settings
        </button>
      </div>

      {/* Calendar */}
      {apiKey && calendarId ? (
        <FullCalendar
          plugins={[dayGridPlugin, googleCalendarPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="80vh"
        />
      ) : (
        <p>⚠ Please enter your Google API Key & Calendar ID to view events.</p>
      )}
    </div>
  );
}
