// Ejercicio 1 a


const url = "https://thronesapi.com/api/v2/Characters";

export async function obtenerPersonajes() {
    try {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error en fetch: ${respuesta.status} ${respuesta.statusText}`);
        }

        const respuestaJSON = await respuesta.json(); 
        console.log(`\nEjercicio 1 a\nGET de todos los personajes:\n`);
        console.log(respuestaJSON); 
        return {
            status: respuesta.status,
            statusText: respuesta.statusText,
            data: respuestaJSON
        }

    } catch (error) {
        console.log("Error de la solicitud: ", error);
    }
}
