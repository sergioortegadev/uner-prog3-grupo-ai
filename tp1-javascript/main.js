import { writeData } from './src/utils/fileHandler.js';
import {guardarPersonaje,obtenerPersonajePorId, obtenerPersonajes} from './src/api/index.js';
import { addToEnd } from './src/fs/addToEnd.js';


const nuevoPersonaje = {
    firstName: 'Jon',
    lastName: 'Snow',
    fullName: 'Jon Snow',
    title: 'King in the North',
    family: 'House Stark',
    image: "jon.jpg",
    imageUrl: 'https://picsum.photos/200/300'
};


const main = async () => {
    console.log('\n===== PARTE 1: API =====');
    try {
        // a) Recuperar la información de todos los personajes (GET) 
        const {data: personajes} = await obtenerPersonajes();
        // y persistirla en un archivo JSON.
        await writeData(personajes);
        // b) Agregar un nuevo personaje (POST).
        await guardarPersonaje()
        // c) Buscar la información de un determinado personaje, utilizando un "id" como parámetro GET
        await obtenerPersonajePorId(3);
    } catch (err) {
        console.error('Error en Parte 1:', err.message);
    }

    console.log('\n===== PARTE 2: ARCHIVOS =====');
    try {
        //a) Agregar un personaje al final del archivo.
        await addToEnd(nuevoPersonaje)
    } catch (error) {
        console.error('Error en Parte 2:', error.message);
    }
};

main();