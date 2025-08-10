document.addEventListener('DOMContentLoaded', () => {
    // Configura FullCalendar
    const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale: 'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: {
            url: 'https://script.google.com/macros/s/AKfycbybsQ7UKI3lf4OiLDcbKBJKbDoDQvHgqK9qlLh1Hpe9P_OFrqMKng68hvKyMywPwdqP9w/exec',
            method: 'GET',
            failure: () => {
                console.error('Error al cargar eventos');
                alert('No se pudieron cargar las reservas. Por favor, recarga la página.');
            }
        },
        eventClick: (info) => {
            alert(`Reserva ocupada por: ${info.event.title}\nDesde: ${info.event.start.toLocaleString()}\nHasta: ${info.event.end.toLocaleString()}`);
        }
    });
    calendar.render();

    // Generar opciones de hora (10:00 a 00:00)
    const horaInicioSelect = document.getElementById('hora-inicio');
    for (let h = 10; h <= 23; h++) {
        horaInicioSelect.innerHTML += `<option value="${h}:00">${h}:00</option>`;
    }
    horaInicioSelect.innerHTML += '<option value="00:00">00:00</option>';

    // Actualizar hora fin según hora inicio
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

    // Validar formulario paso 1
    document.getElementById('form-fecha').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('loader').classList.add('active');
        
        // Simular validación (en producción sería una llamada real al script)
        setTimeout(() => {
            const fecha = document.getElementById('fecha').value;
            const horaInicio = document.getElementById('hora-inicio').value;
            const horaFin = document.getElementById('hora-fin').value;
            
            // Guardar datos para el paso 2
            document.getElementById('fecha-confirmada').value = fecha;
            document.getElementById('hora-inicio-confirmada').value = horaInicio;
            document.getElementById('hora-fin-confirmada').value = horaFin;
            
            // Ir al paso 2a (disponible)
            document.getElementById('paso-1').classList.remove('active');
            document.getElementById('paso-2a').classList.add('active');
            document.getElementById('loader').classList.remove('active');
        }, 1000);
    });

    // Enviar reserva final (paso 2a)
    document.getElementById('form-reserva').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<div class="loader"></div> Enviando...';
        
        // Datos para enviar al Google Apps Script
        const reserva = {
            fecha: document.getElementById('fecha-confirmada').value,
            horaInicio: document.getElementById('hora-inicio-confirmada').value,
            horaFin: document.getElementById('hora-fin-confirmada').value,
            escalera: document.getElementById('escalera').value,
            pisoPuerta: document.getElementById('piso-puerta').value,
            nombre: document.getElementById('nombre').value
        };

        try {
            // Enviar a Google Apps Script (POST)
            const response = await fetch('https://script.google.com/macros/s/AKfycbybsQ7UKI3lf4OiLDcbKBJKbDoDQvHgqK9qlLh1Hpe9P_OFrqMKng68hvKyMywPwdqP9w/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reserva)
            });
            
            const resultado = await response.json();
            if (resultado.success) {
                alert('✅ Reserva confirmada correctamente');
                location.reload();
            } else {
                throw new Error(resultado.error || 'Error desconocido');
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar reserva';
        }
    });

    // Botón "Elegir otra fecha" (paso 2b)
    document.getElementById('btn-nueva-reserva').addEventListener('click', () => {
        document.getElementById('paso-2b').classList.remove('active');
        document.getElementById('paso-1').classList.add('active');
    });
});