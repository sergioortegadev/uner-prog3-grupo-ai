import { readJsonDataSummary, writeJsonDataSummary } from "../utils/fileHandler.js";

export const sortByName = async () => {
  try {
    const summary = await readJsonDataSummary();

    summary.sort((a, b) => b.fullName.localeCompare(a.fullName));

    console.log(`\nEjercicio 2 e\nPersonajes ordenados por nombre en forma descendente. Archivo summary.json\n`);
    console.log(summary);
    await writeJsonDataSummary(summary);
  } catch (error) {
    console.error("Error en sortByName:", error.message);
    throw error;
  }
};
