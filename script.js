document.addEventListener("DOMContentLoaded", () => {
    // 1. LOCALIZACIÓN DE ELEMENTOS DEL DOM
    const buscador = document.getElementById('buscador');
    const tarjetas = document.querySelectorAll('.tarjeta');
    const secciones = document.querySelectorAll('.seccion-catalogo');
    const listaSugerencias = document.getElementById('lista-sugerencias');
    
    // Buscar o crear dinámicamente el mensaje de aviso vacío
    let mensajeVacio = document.getElementById('mensaje-vacio');
    if (!mensajeVacio) {
        mensajeVacio = document.createElement('p');
        mensajeVacio.id = 'mensaje-vacio';
        mensajeVacio.textContent = '👁 No se encontraron resultados que coincidan con tu búsqueda.';
        mensajeVacio.style.textAlign = 'center';
        mensajeVacio.style.color = '#94a3b8';
        mensajeVacio.style.padding = '40px 20px';
        mensajeVacio.style.display = 'none';
        document.querySelector('.seccion-catalogo')?.insertAdjacentElement('beforebegin', mensajeVacio);
    }

    // Función base para eliminar tildes, mayúsculas y caracteres especiales
    function limpiarTexto(texto) {
        return texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
    }

    // GENERADOR DINÁMICO DE PALABRAS DE LA WEB
    function obtenerPalabrasClaveWeb() {
        const palabrasUnicas = new Set();
        const palabrasIgnoradas = ["el", "la", "los", "las", "un", "una", "de", "del", "en", "para", "por", "con", "sin", "y", "o", "tu", "su", "este", "esta", "cualquier", "que"];

        tarjetas.forEach(tarjeta => {
            const titulo = tarjeta.querySelector('h3')?.textContent || "";
            const categoria = tarjeta.querySelector('.categoria')?.textContent || "";
            
            const textoCompleto = `${titulo} ${categoria}`;
            const palabrasLimpias = textoCompleto.replace(/[()🗣,.:;?¿!¡]/g, " ").split(/\s+/);

            palabrasLimpias.forEach(palabra => {
                const term = palabra.trim();
                const termLimpio = limpiarTexto(term);
                if (term.length > 2 && !palabrasIgnoradas.includes(termLimpio) && isNaN(term)) {
                    palabrasUnicas.add(term);
                }
            });
        });

        return Array.from(palabrasUnicas);
    }

    // Diccionario base extraído de tu HTML
    const ideasBusqueda = obtenerPalabrasClaveWeb();

    // 2. FUNCIÓN DE FILTRADO INTELIGENTE
    function ejecutarFiltro(valorBusqueda, esCategoria = false) {
        const textoUsuario = limpiarTexto(valorBusqueda);

        if (textoUsuario === "") {
            tarjetas.forEach(tarjeta => tarjeta.style.display = "");
            secciones.forEach(seccion => {
                seccion.style.display = "";
                if (seccion.previousElementSibling && seccion.previousElementSibling.tagName === 'H2') {
                    seccion.previousElementSibling.style.display = "";
                }
            });
            mensajeVacio.style.display = 'none';
            return;
        }

        const palabrasBuscadas = textoUsuario.split(/\s+/);
        let totalTarjetasVisibles = 0;

        tarjetas.forEach(function(tarjeta) {
            const textoCategoria = limpiarTexto(tarjeta.querySelector('.categoria')?.textContent || "");
            const titulo = tarjeta.querySelector('h3')?.textContent || "";
            const descripcion = tarjeta.querySelector('p')?.textContent || "";
            
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
                tarjeta.style.display = "";
                totalTarjetasVisibles++;
            } else {
                tarjeta.style.display = 'none';
            }
        });

        secciones.forEach(function(seccion) {
            const tarjetasVisiblesEnSeccion = Array.from(seccion.querySelectorAll('.tarjeta')).filter(t => t.style.display !== 'none').length;
            const tituloAsociado = seccion.previousElementSibling;

            if (tarjetasVisiblesEnSeccion === 0) {
                seccion.style.display = 'none';
                if (tituloAsociado && tituloAsociado.tagName === 'H2') {
                    tituloAsociado.style.display = 'none';
                }
            } else {
                seccion.style.display = "";
                if (tituloAsociado && tituloAsociado.tagName === 'H2') {
                    tituloAsociado.style.display = "";
                }
            }
        });

        if (totalTarjetasVisibles === 0) {
            mensajeVacio.style.display = 'block';
        } else {
            mensajeVacio.style.display = 'none';
        }
    }

    // 🌟 3. LÓGICA DE MOSTRAR SUGERENCIAS POR PROBABILIDAD (SCORE)
    if (buscador && listaSugerencias) {
        buscador.addEventListener('input', function(evento) {
            const entrada = limpiarTexto(evento.target.value);
            listaSugerencias.innerHTML = ""; 

            if (entrada === "") {
                listaSugerencias.style.display = "none";
                ejecutarFiltro("");
                return;
            }

            // Mapeamos las palabras calculando su nivel de probabilidad
            const sugerenciasConScore = ideasBusqueda
                .map(idea => {
                    const ideaLimpia = limpiarTexto(idea);
                    let score = -1; // -1 significa que no coincide en absoluto

                    if (ideaLimpia.startsWith(entrada)) {
                        score = 2; // Máxima probabilidad: La palabra EMPIEZA por lo que escribes
                    } else if (ideaLimpia.includes(entrada)) {
                        score = 1; // Probabilidad media: Contiene las letras pero no al principio
                    }

                    return { texto: idea, score: score };
                })
                .filter(item => item.score > 0); // Descartamos las que no coinciden

            // Ordenamos: Primero las de mayor score (2 sobre 1), si empatan se usa el orden alfabético
            sugerenciasConScore.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; 
                }
                return a.texto.localeCompare(b.texto); 
            });

            // Pintamos las sugerencias en pantalla si existen coincidencias útiles
            if (sugerenciasConScore.length > 0) {
                listaSugerencias.style.display = "block"; 
                
                // Limitamos a un máximo de 6 sugerencias en el menú desplegable para no saturar
                sugerenciasConScore.slice(0, 6).forEach(function(item) {
                    const elemento = document.createElement('div');
                    elemento.classList.add('sugerencia-item');
                    elemento.textContent = item.texto;

                    elemento.addEventListener('click', function() {
                        buscador.value = item.texto; 
                        listaSugerencias.innerHTML = ""; 
                        listaSugerencias.style.display = "none";
                        ejecutarFiltro(item.texto, false); 
                    });

                    listaSugerencias.appendChild(elemento);
                });
            } else {
                listaSugerencias.style.display = "none"; 
            }

            // Mantiene el filtrado reactivo de las tarjetas mientras escribe
            ejecutarFiltro(evento.target.value, false);
        });

        // Ocultar con tecla Escape
        buscador.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                listaSugerencias.innerHTML = "";
                listaSugerencias.style.display = "none";
            }
        });

        // Ocultar si pincha fuera del buscador
        document.addEventListener('click', function(evento) {
            if (!buscador.contains(evento.target) && !listaSugerencias.contains(evento.target)) {
                listaSugerencias.innerHTML = "";
                listaSugerencias.style.display = "none";
            }
        });
    }

    // 4. FILTRADO POR CLIC EN LAS CATEGORÍAS
    const botonesCategoria = document.querySelectorAll('.categoria');
    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', function() {
            const categoriaTexto = boton.textContent;
            if (buscador) buscador.value = categoriaTexto; 
            ejecutarFiltro(categoriaTexto, true); 
        });
    });
});