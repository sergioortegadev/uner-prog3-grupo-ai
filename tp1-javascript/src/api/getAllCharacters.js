// Obtiene todos los personajes de la API (GET /Characters)
import { API_URL } from "./constants.js";

export async function getAllCharacters() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Error al obtener todos los personajes: ${response.status} ${response.statusText}`);
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
}
