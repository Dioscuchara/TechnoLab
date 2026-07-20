const buscador = document.getElementById('buscador');
const tarjetas = document.querySelectorAll('.tarjeta');

function limpiarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

buscador.addEventListener('keyup', function(evento) {
    
    const textoUsuario = limpiarTexto(evento.target.value);

    if (textoUsuario === "") {
        tarjetas.forEach(tarjeta => tarjeta.style.display = 'flex');
        return;
    }

    const palabrasBuscadas = textoUsuario.split(/\s+/);

    tarjetas.forEach(function(tarjeta) {
        
        const titulo = tarjeta.querySelector('h3').textContent;
        const descripcion = tarjeta.querySelector('p').textContent;
        const textoTarjetaLimpio = limpiarTexto(titulo + " " + descripcion);

        const coincideTodo = palabrasBuscadas.every(function(palabra) {
            return textoTarjetaLimpio.includes(palabra);
        });

        if (coincideTodo) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
});