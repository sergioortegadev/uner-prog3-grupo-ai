// Ejercicio 1 d

import { writeFile } from "fs";

export const fileHandler = (response, method) => {

    const {status, statusText, data} = response

    switch (method) {
        case 'GET':
        
            // Escribimos todos los datos en un archivo JSON

            writeFile("../../data/characters.json", JSON.stringify(data, null, 2), (error) => { 
                if (error) {
                    console.error("\nError al escribir el archivo: ", error);
                } else {
                    console.log("\nArchivo escrito correctamente\nRespuesta del servidor:");
                    console.log("Status code: ", status, " Status Text: ", statusText, "\n");    
                }
            } 
            )
            break;

        case 'POST':
            break;
        
        case '':
            break;
        
        case 'POST':
            break;
        
        default:
            break;
    }
        
        
}