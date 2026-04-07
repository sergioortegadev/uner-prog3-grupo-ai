// Busca un personaje por ID (GET /Characters/{id})
import { isValidId } from "../utils/validators.js";
import { API_URL } from "./constants.js";

export async function getCharacterById(id) {
  if (!isValidId(id)) {
    throw new Error(`ID de personaje inválido: se recibió "${id}". Debe ser un número positivo.`);
  }

  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Error al buscar personaje (ID ${id}): ${response.status} ${response.statusText}`);
  }

  const character = await response.json();
  console.log(`\nEjercicio 1 c\nGET un personaje por id\nNombre del Personaje: ${character.fullName}\n`);
  console.log(character);
  console.log("\nRespuesta del servidor (GET by ID):");
  console.log("Status code: ", response.status, " Status Text: ", response.statusText, "\n");
  return {
    status: response.status,
    statusText: response.statusText,
    data: character,
  };
}
