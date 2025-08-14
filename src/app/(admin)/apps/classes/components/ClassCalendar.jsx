import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrapPlugin from '@fullcalendar/bootstrap';

const ClassCalendar = ({ events, onDateClick, onDrop, onEventClick, onEventDrop }) => {
  return (
    <FullCalendar
      initialView="dayGridMonth"
      plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, bootstrapPlugin]}
      themeSystem="bootstrap"
      editable={true}
      selectable={true}
      droppable={true}
      events={events}
      dateClick={onDateClick}
      eventClick={onEventClick}
      drop={onDrop}
      eventDrop={onEventDrop}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      }}
    />
  );
};

export default ClassCalendar;
