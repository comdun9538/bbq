document.addEventListener('DOMContentLoaded', () => {
    // Configura FullCalendar
    const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale: 'es',
        initialView: 'dayGridMonth',
        events: {
            url: 'https://script.google.com/macros/s/AKfycbzDmJMSmRcz9l-vpn-RnRLPox7Y3Hks1LGFR1B_j1O2KR7sKfFncABhJvjyjpactCgH/exec',
            method: 'GET',
            extraParams: {
                timeMin: new Date().toISOString()
            },
            failure: () => console.error("Error al cargar eventos")
        },
        eventClick: (info) => {
            alert(`Reservado por: ${info.event.title}\nFecha: ${info.event.start.toLocaleDateString('es')}`);
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

    // Enviar reserva
    document.getElementById('form-reserva').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<div class="loader"></div> Enviando...';

        const reserva = {
            fecha: document.getElementById('fecha').value,
            horaInicio: document.getElementById('hora-inicio').value,
            horaFin: document.getElementById('hora-fin').value,
            escalera: document.getElementById('escalera').value,
            pisoPuerta: document.getElementById('piso-puerta').value,
            nombre: document.getElementById('nombre').value
        };

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbybsQ7UKI3lf4OiLDcbKBJKbDoDQvHgqK9qlLh1Hpe9P_OFrqMKng68hvKyMywPwdqP9w/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(reserva)
            });
            
            const resultado = await response.text();
            const data = JSON.parse(resultado);

            if (data.success) {
                alert('✅ Reserva confirmada!');
                window.location.reload();
            } else {
                throw new Error(data.error || "Error desconocido");
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            console.error("Detalles:", error);
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar reserva';
        }
    });
});
