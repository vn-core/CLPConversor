// Datos desde la API
async function mindicador() {
    try {
        const res = await fetch("https://mindicador.cl/api");
        const data = await res.json();
        const selectMoneda = document.getElementById('cambiomoneda');
        let opcionesHTML = '<option value="">Seleccione moneda</option>';

// Exclusion de algunos datos y seleccion de moneda
        Object.keys(data).forEach(moneda => { 
            if (data[moneda].codigo && moneda !== "version" && moneda !== "autor") {
                opcionesHTML += `<option value="${data[moneda].valor}">${data[moneda].nombre} (${data[moneda].codigo})</option>`;
            }
        });

            selectMoneda.innerHTML = opcionesHTML;
    
//En caso de error con la API
    } catch (error) {
        console.error("Error al obtener datos de la API", error);
        alert("Error al obtener datos de la API")
    }
}

// Conversión
async function convertirMoneda() {
    const montoCLP = document.getElementById('inputCLP').value;
    const tasaConversion = document.getElementById('cambiomoneda').value;
    const resultadoElemento = document.querySelector('.resultados p');
    const monedaIcon = document.getElementById('monedaIcon');

    // Hacer girar la moneda
    monedaIcon.classList.add('girar');
    setTimeout(() => {
        monedaIcon.classList.remove('girar');
    }, 1000);

    if (tasaConversion === "") {
        resultadoElemento.textContent = "Selecciona un tipo de moneda";
        return;
    }

    const resultado = montoCLP / tasaConversion;
    resultadoElemento.textContent = `Resultado: $${resultado.toFixed(2)}`;

    // Obtener el código de la moneda seleccionada
    const codigoMoneda = document.getElementById('cambiomoneda').selectedOptions[0].text.split('(')[1].slice(0, -1);

    // Mostrar el gráfico de historial
    await mostrarGraficoHistorial(codigoMoneda);
}

// Ejecuta la función al cargar la página
document.addEventListener('DOMContentLoaded', mindicador);

// Asigna el evento al botón
document.getElementById('boton').addEventListener('click', convertirMoneda);



// GRAFICO

async function obtenerHistorialMoneda(codigoMoneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${codigoMoneda}`);
        const data = await res.json();
        // Solo toma los últimos 10 días
        const serie = data.serie.slice(-10);
        
        // Extraer y formatear datos
        const labels = serie.map(dato => new Date(dato.fecha).toLocaleDateString());
        const valores = serie.map(dato => dato.valor);

        return { labels, valores };
    } catch (error) {
        console.error("Error al obtener el historial de la moneda:", error);
        alert("Error al obtener el historial de la moneda.");
    }
}

let miGrafico = null; // Variable global para mantener referencia al gráfico

async function mostrarGraficoHistorial(codigoMoneda) {
    const historial = await obtenerHistorialMoneda(codigoMoneda);

    if (historial) {
        const ctx = document.getElementById('historialChart').getContext('2d');
        
        // Destruir el gráfico anterior si existe
        if (miGrafico) {
            miGrafico.destroy();
        }

        // Crear nuevo gráfico
        miGrafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historial.labels,
                datasets: [{
                    label: `Historial de ${codigoMoneda}`,
                    data: historial.valores,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor'
                        }
                    }
                }
            }
        });
    }
}