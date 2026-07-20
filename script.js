const buscador = document.getElementById('buscador');
const tarjetas = document.querySelectorAll('.tarjeta');

buscador.addEventListener('keyup', function(evento) {
    
    const textoUsuario = evento.target.value.toLowerCase();

    tarjetas.forEach(function(tarjeta) {
        
        const titulo = tarjeta.querySelector('h3').textContent.toLowerCase();
        const descripcion = tarjeta.querySelector('p').textContent.toLowerCase();

        if (titulo.includes(textoUsuario) || descripcion.includes(textoUsuario)) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
});
