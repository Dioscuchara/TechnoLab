const buscador = document.getElementById('buscador');
const tarjetas = document.querySelectorAll('.tarjeta');

function limpiarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function ejecutarFiltro(valorBusqueda, esCategoria = false) {
    const textoUsuario = limpiarTexto(valorBusqueda);

    if (textoUsuario === "") {
        tarjetas.forEach(tarjeta => tarjeta.style.display = 'flex');
        return;
    }

    const palabrasBuscadas = textoUsuario.split(/\s+/);

    tarjetas.forEach(function(tarjeta) {
        const textoCategoria = limpiarTexto(tarjeta.querySelector('.categoria').textContent);
        const titulo = tarjeta.querySelector('h3').textContent;
        const descripcion = tarjeta.querySelector('p').textContent;
        
        let coincideTodo = false;

        if (esCategoria) {
            coincideTodo = palabrasBuscadas.every(function(palabraBuscada) {
                const expresionRegular = new RegExp('\\b' + palabraBuscada + '\\b', 'i');
                return expresionRegular.test(textoCategoria);
            });
        } else {
            const textoTarjetaLimpio = limpiarTexto(textoCategoria + " " + titulo + " " + descripcion);
            coincideTodo = palabrasBuscadas.every(function(palabraBuscada) {
                const expresionRegular = new RegExp('\\b' + palabraBuscada, 'i');
                return expresionRegular.test(textoTarjetaLimpio);
            });
        }

        if (coincideTodo) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

buscador.addEventListener('keyup', function(evento) {
    ejecutarFiltro(evento.target.value, false);
});

const botonesCategoria = document.querySelectorAll('.categoria');

botonesCategoria.forEach(function(boton) {
    boton.addEventListener('click', function() {
        const textoCategoria = boton.textContent;
        
        buscador.value = textoCategoria;
        
        ejecutarFiltro(textoCategoria, true);
        
        buscador.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});