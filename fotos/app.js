// ===============================================
// ESTADO GLOBAL Y CONFIGURACIÓN
// ===============================================
const CONFIG = {
    archivos: {
        // Tu enlace CSV actual
        datos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTe5uuBPPubw4paa2c_xADHayB6cqwZ5i6wxxy9XTUkkVnY6GtyOqfqQlVzGEeQB51F4QkHxffF90M/pub?gid=0&single=true&output=csv"
    },
    iconos: {
        "VERDADERO": `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
        "FALSO": `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 13.59L15.17 17 12 13.83 8.83 17 7.41 15.59 10.59 12 7.41 8.41 8.83 7 12 10.17 15.17 7l1.41 1.41L13.41 12l3.18 3.59z"/></svg>`,
        "ENGAÑOSO": `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
    },
    colores: {
        calificaciones: {
            "VERDADERO": "badge-verdadero",
            "FALSO": "badge-falso",
            "ENGAÑOSO": "badge-enganoso"
        },
        bordeTarjeta: {
            "VERDADERO": "#4caf50", 
            "FALSO": "#e53935",     
            "ENGAÑOSO": "#ffb300"   
        }
    }
};

// ===============================================
// MOTOR DE RENDERIZADO (TARJETAS LIMPIAS)
// ===============================================
function renderizarTarjetas(datos) {
    const contenedor = document.getElementById('fact-checking-feed');
    
    // SISTEMA DE DIAGNÓSTICO
    console.log("=== DIAGNÓSTICO DE GOOGLE SHEETS ===");
    console.log("Cantidad de filas detectadas:", datos.length);
    if (datos.length > 0) {
        console.log("Nombres de cabeceras (columnas) detectadas en la fila 1:");
        console.log(Object.keys(datos[0]));
    }
    
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px dashed #ccc;">
                <p style="font-family: 'Georgia', serif; font-size: 20px; color: #666; margin: 0; font-style: italic;">
                    La información irá apareciendo conforme avance el discurso.
                </p>
            </div>
        `;
        return;
    }

    let htmlAcumulado = '';
    const datosOrdenados = [...datos].reverse(); // Orden cronológico inverso (nuevo arriba)

    datosOrdenados.forEach((item) => {
        const fraseCita = item.frase || item.Frase || item.FRASE;
        if (!fraseCita) return; 

        // Capturamos el tema (si lo dejan en blanco, dirá "Sin clasificar")
        const tema = item.tema || item.Tema || item.TEMA || "Sin clasificar";
        const calif = item.calificacion || item.Calificacion || item.CALIFICACION || "";
        const expli = item.explicacion || item.Explicacion || item.EXPLICACION || "";
        const fuent = item.fuente || item.Fuente || item.FUENTE || "";

        const keyCalificacion = calif.trim().toUpperCase();
        const claseBadge = CONFIG.colores.calificaciones[keyCalificacion] || "";
        const iconoSVG = CONFIG.iconos[keyCalificacion] || "";
        const colorBorde = CONFIG.colores.bordeTarjeta[keyCalificacion] || "#ccc";

        htmlAcumulado += `
            <article class="fact-card" style="border-top-color: ${colorBorde};">
                <div class="fact-header" style="align-items: center;">
                    <div class="fact-author-wrapper">
                        <div class="fact-author-text">
                            <!-- El Tema ahora es el protagonista absoluto de la tarjeta -->
                            <span class="fact-author-name" style="font-size: 16px; color: #111; letter-spacing: 1px;">
                                ${tema.trim().toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <span class="fact-badge ${claseBadge}">
                        ${iconoSVG} ${calif}
                    </span>
                </div>
                <p class="fact-quote">${fraseCita}</p>
                <p class="fact-explanation"><strong>Explicación:</strong> ${expli}</p>
                <p class="fact-source"><strong>Fuente:</strong> ${fuent}</p>
            </article>
        `;
    });

    contenedor.innerHTML = htmlAcumulado;
}

// ===============================================
// INICIALIZACIÓN
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    const separador = CONFIG.archivos.datos.includes('?') ? '&' : '?';
    const urlFresca = `${CONFIG.archivos.datos}${separador}t=${new Date().getTime()}`;

    Papa.parse(urlFresca, {
        download: true,       
        header: true,         
        skipEmptyLines: true, 
        complete: function(results) {
            try {
                if (results.errors.length > 0 && results.data.length === 0) {
                    console.error("PapaParse encontró un error de formato:", results.errors);
                    throw new Error("Formato de CSV inválido");
                }
                renderizarTarjetas(results.data);
            } catch (error) {
                console.error("Error crítico procesando los datos:", error);
                document.getElementById('fact-checking-feed').innerHTML = 
                    "<p style='text-align:center;'>⚠️ Ocurrió un problema de lectura del documento.</p>";
            }
        },
        error: function(err) {
            console.error("No se pudo alcanzar el archivo de Google Sheets:", err);
        }
    });
});