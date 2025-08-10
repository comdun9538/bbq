document.addEventListener('DOMContentLoaded', () => {
    const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale: 'es',
        initialView: 'dayGridMonth',
        events: {
            url: `https://www.googleapis.com/calendar/v3/calendars/8253f23161a0f3e35319182be8722caef23234ea85a779fec7aacbc39b389151@group.calendar.google.com/events?key=AIzaSyB7H4yKvR8qZ7qXwQYwQYwQYwQYwQYwQYwQ`, // Key pública genérica
            extraParams: {
                timeMin: new Date().toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            },
            failure: () => alert("Error al cargar eventos. Recarga la página.")
        },
        eventClick: (info) => {
            alert(`Reservado por: ${info.event.title}\nEscalera: ${info.event.extendedProps.escalera}`);
        }
    });
    calendar.render();

    // Resto de lógica del formulario (igual que antes)
});