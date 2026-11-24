/* 1. ACCESO A ELEMENTOS DEL DOM - FORMULARIO CONTACTO (contacto.html) */
document.addEventListener('DOMContentLoaded', function () {

    // Capturamos el formulario y sus campos mediante document.getElementById()
    const formulario = document.getElementById('formulario-contacto');
    const inputNombre = document.getElementById('input-nombre');
    const inputEmail = document.getElementById('input-email');
    const selectPais = document.getElementById('select-pais');
    const inputTelefono = document.getElementById('input-telefono');
    const inputMensaje = document.getElementById('input-mensaje');

    // Si no estamos en contacto.html, detenemos la ejecución
    if (!formulario) {
        return;
    }

    /* 2. CREACIÓN DINÁMICA DE ELEMENTO EN EL DOM PARA ALERTAS */
    const cajaMensaje = document.createElement('div');
    cajaMensaje.id = 'mensaje-validacion';
    cajaMensaje.className = 'caja-mensaje-formulario';
    formulario.appendChild(cajaMensaje);

    /* 3. EXPRESIONES REGULARES (RegExp) PARA VALIDACIÓN DE DATOS */
    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,60}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const regexCelularPeru = /^9[0-9]{8}$/;
    const regexTelefonoOtros = /^[0-9]{7,12}$/;

    /* 4. RESTRICCIONES EN TIEMPO REAL AL ESCRIBIR (EVENTO input) */
    inputNombre.addEventListener('input', function () {
        inputNombre.value = inputNombre.value.replace(/[0-9]/g, '');
    });

    inputTelefono.addEventListener('input', function () {
        inputTelefono.value = inputTelefono.value.replace(/[^0-9]/g, '');
    });

    /* 5. VALIDACIÓN AL ENVIAR EL FORMULARIO (EVENTO submit) */
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const nombre = inputNombre.value.trim();
        const email = inputEmail.value.trim();
        const pais = selectPais.value;
        const telefono = inputTelefono.value.trim();
        const mensaje = inputMensaje.value.trim();

        inputNombre.classList.remove('campo-invalido');
        inputEmail.classList.remove('campo-invalido');
        inputTelefono.classList.remove('campo-invalido');
        inputMensaje.classList.remove('campo-invalido');

        if (nombre === '' || !regexSoloLetras.test(nombre)) {
            inputNombre.classList.add('campo-invalido');
            cajaMensaje.className = 'caja-mensaje-formulario error';
            cajaMensaje.textContent = 'Error: Ingresa un nombre válido (solo letras y mínimo 3 caracteres).';
            inputNombre.focus();

        } else if (email === '' || !regexCorreo.test(email)) {
            inputEmail.classList.add('campo-invalido');
            cajaMensaje.className = 'caja-mensaje-formulario error';
            cajaMensaje.textContent = 'Error: Ingresa un correo electrónico válido (ejemplo@correo.com).';
            inputEmail.focus();

        } else if (pais === '+51' && !regexCelularPeru.test(telefono)) {
            inputTelefono.classList.add('campo-invalido');
            cajaMensaje.className = 'caja-mensaje-formulario error';
            cajaMensaje.textContent = 'Error: Para Perú (+51), el teléfono debe tener 9 dígitos y empezar con 9.';
            inputTelefono.focus();

        } else if (pais !== '+51' && !regexTelefonoOtros.test(telefono)) {
            inputTelefono.classList.add('campo-invalido');
            cajaMensaje.className = 'caja-mensaje-formulario error';
            cajaMensaje.textContent = 'Error: Ingresa un número telefónico válido entre 7 y 12 dígitos.';
            inputTelefono.focus();

        } else if (mensaje.length < 10) {
            inputMensaje.classList.add('campo-invalido');
            cajaMensaje.className = 'caja-mensaje-formulario error';
            cajaMensaje.textContent = 'Error: El mensaje debe contener al menos 10 caracteres.';
            inputMensaje.focus();

        } else {
            cajaMensaje.className = 'caja-mensaje-formulario exito';
            cajaMensaje.textContent = '¡Gracias, ' + nombre + '! Tu mensaje fue validado y enviado correctamente a Bodega LBS Market.';
            formulario.reset();
        }
    });

});