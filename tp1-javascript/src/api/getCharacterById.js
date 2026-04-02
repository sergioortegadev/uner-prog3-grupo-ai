// Busca un personaje por ID (GET /Characters/{id})

const url = "https://thronesapi.com/api/v2/Characters";

export async function getCharacterById(id) {
  const response = await fetch(`${url}/${id}`);

  if (!response.ok) {
    console.log("Error en fetch a la API");
    return {};
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
