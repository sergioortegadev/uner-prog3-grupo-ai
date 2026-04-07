// Crea summary.json con id y fullName de cada personaje

import { readJsonData, writeJsonDataSummary } from "../utils/fileHandler.js";

export const createSummaryFile = async () => {
  const characters = await readJsonData();

  if (characters.length === 0) throw new Error("Error: Archivo sin ningún personaje");

  let summaryData = [];

  for (let char of characters) {
    let summaryEntry = {
      id: char.id,
      fullName: char.fullName,
    };
    summaryData.push(summaryEntry);
  }

  await writeJsonDataSummary(summaryData);
  console.log(`\nEjercicio 2 d\nPersonajes con ids y nombres guardados en nuevo archivo Summary`);
};
