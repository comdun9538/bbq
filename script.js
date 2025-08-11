document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de FullCalendar con proxy CORS
    const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale: 'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: {
            url: 'https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/11APJ8-N0wgpyM8XlITHbwhusTnUA8IdXwMG-iKI6v25QaLNiax94zpuZ/exec',
            method: 'GET',
            extraParams: {
                cache: Date.now() // Evita caché
            },
            failure: () => {
                console.error("Error al cargar eventos");
                document.getElementById('calendar').innerHTML = `
                    <div class="error-calendar">
                        <p>No se pudieron cargar las reservas. Por favor:</p>
                        <button onclick="window.location.reload()">Reintentar</button>
                    </div>
                `;
            }
        },
        eventClick: (info) => {
            const desc = info.event.extendedProps.escalera ? 
                `\nEscalera: ${info.event.extendedProps.escalera}` : '';
            alert(`Reserva existente:\n\nNombre: ${info.event.title}${desc}\nFecha: ${info.event.start.toLocaleDateString('es-ES')}\nHora: ${info.event.start.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`);
        }
    });
    calendar.render();

    // 2. Generar opciones de hora (10:00 a 00:00)
    const horaInicioSelect = document.getElementById('hora-inicio');
    for (let h = 10; h <= 23; h++) {
        horaInicioSelect.innerHTML += `<option value="${h}:00">${h}:00</option>`;
    }
    horaInicioSelect.innerHTML += '<option value="00:00">00:00</option>';

    // 3. Actualizar hora fin según hora inicio
    horaInicioSelect.addEventListener('change', function() {
        const horaFinSelect = document.getElementById('hora-fin');
        horaFinSelect.innerHTML = '<option value="" disabled selected>Selecciona...</option>';
        horaFinSelect.disabled = !this.value;
        
        if (!this.value) return;
        
        const horaInicio = parseInt(this.value.split(':')[0]);
        for (let h = horaInicio + 1; h <= 24; h++) {
            const hora = h === 24 ? '00:00' : `${h}:00`;
            horaFinSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
        }
    });

    // 4. Validar formulario paso 1
    document.getElementById('form-fecha').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('loader').classList.add('active');
        
        // Validar que la hora fin sea posterior a la inicio
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFin = document.getElementById('hora-fin').value;
        
        if (horaFin <= horaInicio) {
            alert("La hora de fin debe ser posterior a la de inicio");
            document.getElementById('loader').classList.remove('active');
            return;
        }

        // Simular validación (en producción sería llamada real)
        setTimeout(() => {
            document.getElementById('fecha-confirmada').value = document.getElementById('fecha').value;
            document.getElementById('hora-inicio-confirmada').value = horaInicio;
            document.getElementById('hora-fin-confirmada').value = horaFin;
            
            document.getElementById('paso-1').classList.remove('active');
            document.getElementById('paso-2a').classList.add('active');
            document.getElementById('loader').classList.remove('active');
        }, 1000);
    });

    // 5. Enviar reserva final (paso 2a)
    document.getElementById('form-reserva').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<div class="loader"></div> Enviando...';
        
        const reserva = {
            fecha: document.getElementById('fecha-confirmada').value,
            horaInicio: document.getElementById('hora-inicio-confirmada').value,
            horaFin: document.getElementById('hora-fin-confirmada').value,
            escalera: document.getElementById('escalera').value,
            pisoPuerta: document.getElementById('piso-puerta').value,
            nombre: document.getElementById('nombre').value
        };

        try {
            const response = await fetch('https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbzDmJMSmRcz9L-vpn-RnRLPox7Y3Hks1LG.../exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(reserva)
            });
            
            const resultado = await response.text();
            const data = JSON.parse(resultado);

            if (data.success) {
                alert('✅ Reserva confirmada correctamente');
                window.location.reload();
            } else {
                throw new Error(data.error || "Error desconocido al reservar");
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            console.error("Detalles del error:", error);
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar reserva';
        }
    });

    // 6. Botón "Elegir otra fecha" (paso 2b)
    document.getElementById('btn-nueva-reserva').addEventListener('click', () => {
        document.getElementById('paso-2b').classList.remove('active');
        document.getElementById('paso-1').classList.add('active');
    });
});

// Función global para reintentar carga
window.reintentarCarga = () => {
    window.location.reload();
};
