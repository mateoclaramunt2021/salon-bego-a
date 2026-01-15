/**
 * Hero Booking Menu Handler
 * Gestiona la apertura/cierre de menús desplegables de reservas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los botones de reserva
    const bookingButtons = document.querySelectorAll('.booking-btn');
    const dropdowns = document.querySelectorAll('.booking-dropdown');

    // Toggle del desplegable al hacer click en el botón
    bookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownId = this.getAttribute('data-dropdown');
            const dropdown = document.getElementById('dropdown-' + dropdownId);
            
            // Cerrar todos los otros desplegables
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.hidden = true;
                }
            });
            
            // Toggle actual
            if (dropdown) {
                dropdown.hidden = !dropdown.hidden;
            }
        });
    });

    // Cerrar desplegables al hacer click en una opción
    const bookingOptions = document.querySelectorAll('.booking-option');
    bookingOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            // Permitir que se siga el enlace, pero cerrar el menú después
            setTimeout(() => {
                dropdowns.forEach(d => d.hidden = true);
            }, 100);
        });
    });

    // Cerrar desplegables al hacer click fuera
    document.addEventListener('click', function(e) {
        const isClickInsideMenu = e.target.closest('.booking-menu');
        
        if (!isClickInsideMenu) {
            dropdowns.forEach(d => d.hidden = true);
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(d => d.hidden = true);
        }
    });
});
