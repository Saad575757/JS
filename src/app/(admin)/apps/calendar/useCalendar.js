'use client';

import { Draggable } from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { defaultEvents } from './data';

const useCalendar = () => {
  const [show, setShow] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventData, setEventData] = useState();
  const [dateInfo, setDateInfo] = useState();

  const onOpenModal = () => setShow(true);
  const onCloseModal = () => {
    setEventData(undefined);
    setDateInfo(undefined);
    setShow(false);
  };

  // ✅ Load Google Calendar events directly
  useEffect(() => {
    const token = localStorage.getItem("token"); // Google OAuth access_token
    console.log("🔑 Stored Token:", token); // log token

    if (!token) {
      console.warn("⚠ No token found in localStorage.");
      return;
    }

    fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("📅 Google Calendar API Response:", data); // log response
        if (data.items) {
          const googleEvents = data.items.map(event => ({
            id: event.id,
            title: event.summary || "No Title",
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            className: "bg-primary"
          }));
          setEvents(googleEvents);
        } else {
          setEvents(defaultEvents);
        }
      })
      .catch(err => {
        console.error("❌ Google Calendar fetch error:", err);
        setEvents(defaultEvents);
      });
  }, []);

  // ✅ Setup draggable events
  useEffect(() => {
    const draggableEl = document.getElementById('external-events');
    if (draggableEl) {
      new Draggable(draggableEl, { itemSelector: '.external-event' });
    }
  }, []);

  const onDateClick = arg => {
    setDateInfo(arg);
    onOpenModal();
    setIsEditable(false);
  };

  const onEventClick = arg => {
    const event = {
      id: String(arg.event.id),
      title: arg.event.title,
      className: arg.event.classNames[0]
    };
    setEventData(event);
    setIsEditable(true);
    onOpenModal();
  };

  const onDrop = arg => {
    const title = arg.draggedEl.title;
    if (title) {
      const newEvent = {
        id: String(events.length + 1),
        title,
        start: arg.dateStr,
        className: arg.draggedEl.dataset.class
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const onAddEvent = data => {
    const event = {
      id: String(events.length + 1),
      title: data.title,
      start: dateInfo?.date || new Date(),
      className: data.category
    };
    setEvents(prev => [...prev, event]);
    onCloseModal();
  };

  const onUpdateEvent = data => {
    setEvents(events.map(e => 
      e.id === eventData?.id ? { ...e, title: data.title, className: data.category } : e
    ));
    onCloseModal();
    setIsEditable(false);
  };

  const onRemoveEvent = () => {
    setEvents(events.filter(e => e.id !== eventData?.id));
    onCloseModal();
  };

  const onEventDrop = arg => {
    setEvents(events.map(e =>
      e.id === arg.event.id
        ? { ...e, title: arg.event.title, start: arg.event.start, end: arg.event.end }
        : e
    ));
    setIsEditable(false);
  };

  const createNewEvent = () => {
    setIsEditable(false);
    onOpenModal();
  };

  return {
    createNewEvent,
    show,
    onDateClick,
    onEventClick,
    onDrop,
    onEventDrop,
    events,
    onCloseModal,
    isEditable,
    eventData,
    onUpdateEvent,
    onRemoveEvent,
    onAddEvent
  };
};

export default useCalendar;
