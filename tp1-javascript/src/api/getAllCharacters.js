// Ejercicio 1 a

import { fileHandler } from "../utils/fileHandler.js";

const url = "https://thronesapi.com/api/v2/Characters";

async function obtenerPersonajes() {
    try {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            console.log("Error en fetch a la API");
            return {}; 
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

fileHandler(await obtenerPersonajes(), 'GET')