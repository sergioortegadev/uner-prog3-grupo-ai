// Ejercicio 1 b

const url = "https://thronesapi.com/api/v2/Characters";

async function guardarPersonaje() {

    try {
        const respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id": 53,
                "firstName": "Sergio",
                "lastName": "string",
                "fullName": "string",
                "title": "string",
                "family": "string",
                "image": "string",
                "imageUrl": "string"
            })
        });

        if (!respuesta.ok) {
            console.log("Error en la respuesta de la API");
            return; //se detiene la ejecución de la función si da error
        }   else {
                console.log("\nUsuario Nuevo Agregado\nRespuesta del servidor:\n");
                console.log("Status code: ",respuesta.status, " Status Text: ", respuesta.statusText, "\n");
            }
        }
     catch (error) {
        console.log("Error en POST a la API: ", error);
    }
}

guardarPersonaje()