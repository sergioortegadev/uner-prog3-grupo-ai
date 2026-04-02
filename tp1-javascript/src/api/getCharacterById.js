// Ejercicio 1 c

const url = "https://thronesapi.com/api/v2/Characters";

export async function obtenerPersonajePorId(id) {
  try {
    const respuesta = await fetch(`${url}/${id}`);

    if (!respuesta.ok) {
      console.log("Error en fetch a la API");
      return {};
    }

    const respuestaJSON = await respuesta.json();
    console.log(`\nEjercicio 1 c\nGET un personaje por id\nNombre del Personaje: ${respuestaJSON.fullName}\n`);
    console.log(respuestaJSON);
    console.log("\nRespuesta del servidor (GET by ID):");
    console.log("Status code: ", respuesta.status, " Status Text: ", respuesta.statusText, "\n");
    return {
      status: respuesta.status,
      statusText: respuesta.statusText,
      data: respuestaJSON,
    };
  } catch (error) {
    console.log("Error de la solicitud: ", error);
  }
}
