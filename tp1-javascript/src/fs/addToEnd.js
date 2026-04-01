import { readData, writeData } from '../utils/fileHandler.js';

export const addToEnd = async (character) => {
    try {
        const characters = await readData();
        const id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
        const newCharacter = { id, ...character };
        await writeData([...characters, newCharacter]);
        console.log(`Personaje con id ${id} agregado al final`);
    } catch (error) {
        console.error('Error en addToEnd:', error.message);
        throw error;
    }
};