// Obtiene todos los personajes de la API (GET /Characters)

const url = "https://thronesapi.com/api/v2/Characters";

export async function getAllCharacters() {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error en fetch: ${response.status} ${response.statusText}`);
    }

    const characters = await response.json();
    console.log(`\nEjercicio 1 a\nGET de todos los personajes:\n`);
    console.log(characters);
    console.log("\nRespuesta del servidor (GET):");
    console.log("Status code: ", response.status, " Status Text: ", response.statusText, "\n");
    return {
      status: response.status,
      statusText: response.statusText,
      data: characters,
    };
  } catch (error) {
    console.log("Error de la solicitud: ", error);
  }
}
