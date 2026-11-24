/* 1. CONFIGURACIÓN E INICIALIZACIÓN DE JQUERY - BODEGA LBS MARKET */
$(document).ready(function () {

    // Número de WhatsApp de la bodega (código de país 51 + 9 dígitos)
    const numeroWhatsAppBodega = '51956377631';

    // Función auxiliar para quitar tildes y mayúsculas al buscar o filtrar
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }


    /* 2. CARRUSEL HERO EN INICIO (index.html) - fadeOut / fadeIn CADA 5s */
    const slides = $('.slide-hero');
    const puntos = $('.punto-indicador');
    let indiceSlide = 0;

    function cambiarSlide(nuevoIndice) {
        if (slides.length === 0) {
            return;
        }

        // Ocultamos el slide actual con fadeOut()
        slides.eq(indiceSlide).fadeOut(400).removeClass('slide-activo');
        puntos.eq(indiceSlide).removeClass('punto-activo');

        // Calculamos el siguiente índice cíclico
        indiceSlide = nuevoIndice;
        if (indiceSlide >= slides.length) {
            indiceSlide = 0;
        }
        if (indiceSlide < 0) {
            indiceSlide = slides.length - 1;
        }

        // Mostramos el nuevo slide con fadeIn()
        slides.eq(indiceSlide).fadeIn(400).css('display', 'flex').addClass('slide-activo');
        puntos.eq(indiceSlide).addClass('punto-activo');
    }

    // Cambio automático cada 5 segundos (5000 ms)
    if (slides.length > 1) {
        setInterval(function () {
            cambiarSlide(indiceSlide + 1);
        }, 5000);
    }

    // Cambio manual al hacer clic en los puntos indicadores
    puntos.on('click', function () {
        const posicion = $(this).index();
        cambiarSlide(posicion);
    });


    /* 3. CARRUSEL DE CATEGORÍAS EN INICIO Y ENLACE DIRECTO A CATÁLOGO */
    let indiceCategoria = 0;

    function moverCarruselCategorias(direccion) {
        const ventana = $('.ventana-categorias');
        const pista = $('#pista-categorias');
        const tarjetas = pista.find('.tarjeta-categoria');

        if (tarjetas.length === 0) {
            return;
        }

        // Calculamos el ancho real de una tarjeta más el gap de 20px del CSS
        const anchoTarjeta = tarjetas.first().outerWidth() + 20;
        // Calculamos cuántas tarjetas enteras caben en la pantalla actual
        const visibles = Math.max(1, Math.round(ventana.width() / anchoTarjeta));
        // Límite máximo de pasos para no dejar espacios vacíos al final
        const maxIndice = Math.max(0, tarjetas.length - visibles);

        indiceCategoria += direccion;

        // Comportamiento cíclico: si pasa el final vuelve al inicio y viceversa
        if (indiceCategoria > maxIndice) {
            indiceCategoria = 0;
        } else if (indiceCategoria < 0) {
            indiceCategoria = maxIndice;
        }

        pista.css('transform', 'translateX(-' + (indiceCategoria * anchoTarjeta) + 'px)');
    }

    $('#boton-cat-siguiente').on('click', function () {
        moverCarruselCategorias(1);
    });

    $('#boton-cat-anterior').on('click', function () {
        moverCarruselCategorias(-1);
    });

    // Reajusta la posición si el usuario redimensiona la ventana o gira el celular
    $(window).on('resize', function () {
        indiceCategoria = 0;
        $('#pista-categorias').css('transform', 'translateX(0px)');
    });

    // Redirige a catalogo.html enviando la categoría seleccionada en la URL
    $('.tarjeta-categoria').on('click', function (evento) {
        evento.preventDefault();
        const nombreCategoria = $(this).find('h3, p, span').first().text().trim();
        window.location.href = 'catalogo.html?categoria=' + encodeURIComponent(nombreCategoria);
    });

    /* 4. PANEL LATERAL DEL CARRITO, MÉTODO DE PAGO Y PEDIDO POR WHATSAPP */
    const contadorCarrito = document.getElementById('contador-carrito');
    const listaItemsCarrito = document.getElementById('lista-items-carrito');
    const totalCarritoTexto = document.getElementById('total-carrito');

    // Creamos en el DOM el aviso flotante de confirmación al agregar productos
    const avisoFlotante = document.createElement('div');
    avisoFlotante.id = 'aviso-flotante-carrito';
    avisoFlotante.className = 'aviso-flotante-carrito';
    document.body.appendChild(avisoFlotante);

    // Recuperamos productos guardados para que no se borren al cambiar de página
    let carritoProductos = JSON.parse(localStorage.getItem('carritoLBS')) || [];

    // Dibuja los productos dentro del carrito y calcula el total
    function actualizarVistaCarrito() {
        localStorage.setItem('carritoLBS', JSON.stringify(carritoProductos));

        let totalPagar = 0;
        listaItemsCarrito.innerHTML = '';

        if (carritoProductos.length === 0) {
            listaItemsCarrito.innerHTML = '<p class="detalle-producto">Tu carrito está vacío. Agrega productos del catálogo.</p>';
        } else {
            for (let i = 0; i < carritoProductos.length; i++) {
                const prod = carritoProductos[i];
                totalPagar = totalPagar + prod.precio;

                const fila = document.createElement('div');
                fila.className = 'item-carrito-fila';
                fila.innerHTML =
                    '<span>' + prod.nombre + '</span>' +
                    '<div>' +
                        '<strong>S/ ' + prod.precio.toFixed(2) + '</strong>' +
                        '<button type="button" class="boton-quitar-carrito" data-indice="' + i + '" title="Quitar">✕</button>' +
                    '</div>';
                listaItemsCarrito.appendChild(fila);
            }
        }

        contadorCarrito.textContent = carritoProductos.length;
        totalCarritoTexto.textContent = 'S/ ' + totalPagar.toFixed(2);
    }

    actualizarVistaCarrito();

    // Abrir y cerrar el panel lateral del carrito con jQuery
    $('#boton-carrito').on('click', function () {
        $('#panel-carrito').fadeIn(300).css('display', 'flex');
    });

    $('#boton-cerrar-carrito').on('click', function () {
        $('#panel-carrito').fadeOut(300);
    });

    // Evento clic en el botón "Agregar" de cada tarjeta
    $('.boton-agregar-producto').on('click', function () {
        const botonActual = $(this);
        const tarjeta = botonActual.closest('.tarjeta-producto');
        const nombreProducto = tarjeta.find('.nombre-producto').text().trim();

        let textoPrecio = '';
        if (tarjeta.find('.precio-descuento').length > 0) {
            textoPrecio = tarjeta.find('.precio-descuento').text();
        } else {
            textoPrecio = tarjeta.find('.precio-producto').text();
        }

        const precioNumero = parseFloat(textoPrecio.replace('S/', '').trim());

        carritoProductos.push({ nombre: nombreProducto, precio: precioNumero });
        actualizarVistaCarrito();

        // Confirmación visual en el botón y aviso flotante
        botonActual.text('- Agregado').addClass('agregado-ok');
        setTimeout(function () {
            botonActual.text('Agregar').removeClass('agregado-ok');
        }, 900);

        avisoFlotante.textContent = ' - Agregado al carrito: ' + nombreProducto;
        $('#aviso-flotante-carrito').stop(true, true).fadeIn(200).delay(1400).fadeOut(300);

        $('#contador-carrito').addClass('animar-pulso');
        setTimeout(function () {
            $('#contador-carrito').removeClass('animar-pulso');
        }, 350);
    });

    // Quitar un producto del carrito con el botón ✕
    $(document).on('click', '.boton-quitar-carrito', function () {
        const indiceEliminar = parseInt($(this).attr('data-indice'));
        carritoProductos.splice(indiceEliminar, 1);
        actualizarVistaCarrito();
    });

    // Permitir elegir solo un checkbox de pago a la vez (Efectivo o Digital)
    $('.check-metodo-pago').on('change', function () {
        if ($(this).is(':checked')) {
            $('.check-metodo-pago').not(this).prop('checked', false);
        }
    });

    // Enviar el pedido completo por WhatsApp incluyendo el método de pago
    $('#boton-pedir-whatsapp').on('click', function () {
        if (carritoProductos.length === 0) {
            alert('Tu carrito está vacío. Agrega al menos un producto primero.');
            return;
        }

        const checkSeleccionado = $('.check-metodo-pago:checked');
        if (checkSeleccionado.length === 0) {
            alert('Por favor, selecciona un método de pago (Efectivo o Digital).');
            return;
        }
        const metodoPago = checkSeleccionado.val();

        let detalleMensaje = '';
        let totalFinal = 0;

        for (let i = 0; i < carritoProductos.length; i++) {
            detalleMensaje += '- ' + carritoProductos[i].nombre + ' (S/ ' + carritoProductos[i].precio.toFixed(2) + ')%0A';
            totalFinal = totalFinal + carritoProductos[i].precio;
        }

        const mensajeCompleto = 'Hola Bodega LBS Market, deseo realizar el siguiente pedido:%0A' +
                                detalleMensaje +
                                'Método de pago: ' + metodoPago + '%0A' +
                                '*Total a pagar: S/ ' + totalFinal.toFixed(2) + '*';

        window.open('https://wa.me/' + numeroWhatsAppBodega + '?text=' + mensajeCompleto, '_blank');
    });


    /* 5. BUSCADOR Y FILTROS PRECISOS EN CATÁLOGO (catalogo.html) */
    // Función de búsqueda sin distinguir mayúsculas ni tildes
    function buscarEnCatalogo(texto) {
        const buscadoLimpio = normalizarTexto(texto);
        $('.lista-categorias-filtro li').removeClass('categoria-seleccionada');

        $('#contenedor-productos-catalogo .tarjeta-producto').each(function () {
            const nombreCard = normalizarTexto($(this).find('.nombre-producto').text());
            const detalleCard = normalizarTexto($(this).find('.detalle-producto').text());

            if (nombreCard.indexOf(buscadoLimpio) > -1 || detalleCard.indexOf(buscadoLimpio) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Filtra tarjetas comparando el atributo data-categoria
    function filtrarPorCategoria(nombreCategoria) {
        const textoLimpio = normalizarTexto(nombreCategoria);

        $('.lista-categorias-filtro li').each(function () {
            const textoLi = normalizarTexto($(this).text());
            if (textoLi === textoLimpio) {
                $(this).addClass('categoria-seleccionada');
            } else {
                $(this).removeClass('categoria-seleccionada');
            }
        });

        let claveCategoria = textoLimpio;
        if (textoLimpio.indexOf('snack') > -1 || textoLimpio.indexOf('golosina') > -1) {
            claveCategoria = 'snacks';
        }

        $('#contenedor-productos-catalogo .tarjeta-producto').each(function () {
            const catTarjeta = $(this).attr('data-categoria');
            if (catTarjeta === claveCategoria) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Clic en las categorías de la barra lateral
    $('.lista-categorias-filtro li').on('click', function () {
        const categoriaClic = $(this).text().trim();

        if ($(this).hasClass('categoria-seleccionada')) {
            $(this).removeClass('categoria-seleccionada');
            $('#contenedor-productos-catalogo .tarjeta-producto').show();
        } else {
            filtrarPorCategoria(categoriaClic);
        }
    });

    // Lectura automática de parámetros en la URL (?categoria=... o ?buscar=...)
    const parametrosURL = new URLSearchParams(window.location.search);
    if (parametrosURL.has('categoria') && $('#contenedor-productos-catalogo').length > 0) {
        filtrarPorCategoria(parametrosURL.get('categoria'));
    }
    if (parametrosURL.has('buscar') && $('#buscador-catalogo').length > 0) {
        const palabraHeader = parametrosURL.get('buscar');
        $('#buscador-catalogo').val(palabraHeader);
        buscarEnCatalogo(palabraHeader);
    }

    // Buscador interno en tiempo real
    $('#buscador-catalogo').on('keyup', function () {
        buscarEnCatalogo($(this).val());
    });

    // Filtro por rango de precio (mínimo y máximo)
    $('#precio-minimo, #precio-maximo').on('input', function () {
        let minimo = parseFloat($('#precio-minimo').val());
        let maximo = parseFloat($('#precio-maximo').val());

        if (isNaN(minimo)) {
            minimo = 0;
        }
        if (isNaN(maximo)) {
            maximo = 9999;
        }

        $('#contenedor-productos-catalogo .tarjeta-producto').each(function () {
            const textoPrecio = $(this).find('.precio-producto').text().replace('S/', '').trim();
            const precio = parseFloat(textoPrecio);

            if (precio >= minimo && precio <= maximo) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });


    /* 6. MENÚ HAMBURGUESA RESPONSIVO EN MÓVILES (jQuery slideToggle) */
    $('#boton-menu-hamburguesa').on('click', function () {
        $('#menu-navegacion').slideToggle(250);
    });

    $(window).on('resize', function () {
        if ($(window).width() > 850) {
            $('#menu-navegacion').show();
        } else {
            $('#menu-navegacion').hide();
        }
    });

});