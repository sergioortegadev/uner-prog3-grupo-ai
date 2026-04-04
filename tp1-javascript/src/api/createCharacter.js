// Crea un nuevo personaje vía POST /Characters

const url = "https://thronesapi.com/api/v2/Characters";

export async function createCharacter() {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 53,
      firstName: "Sergio",
      lastName: "string",
      fullName: "string",
      title: "string",
      family: "string",
      image: "string",
      imageUrl: "string",
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al crear personaje: ${response.status} ${response.statusText}`);
  }

  console.log("\nUsuario Nuevo Agregado\nRespuesta del servidor (POST):");
  console.log("Status code: ", response.status, " Status Text: ", response.statusText, "\n");
}
