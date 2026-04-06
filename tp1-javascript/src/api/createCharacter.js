// Crea un nuevo personaje vía POST /Characters
import { isValidCharacter } from "../utils/validators.js";
import { API_URL } from "./constants.js";

export async function createCharacter(character) {
  if (!isValidCharacter(character)) {
    throw new Error("Datos de personaje inválidos: faltan campos obligatorios (firstName, lastName, fullName, title, family, image, imageUrl).");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(character),
  });

  if (!response.ok) {
    throw new Error(`Error al crear personaje: ${response.status} ${response.statusText}`);
  }

  console.log("\nUsuario Nuevo Agregado\nRespuesta del servidor (POST):");
  console.log("Status code: ", response.status, " Status Text: ", response.statusText, "\n");
}
