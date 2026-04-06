/**
 * Valida si un ID es numérico y positivo.
 * @param {any} id 
 * @returns {boolean}
 */
export const isValidId = (id) => {
  const numericId = Number(id);
  return !isNaN(numericId) && id !== null && id !== undefined && numericId >= 0;
};

/**
 * Valida que un objeto personaje tenga los campos obligatorios.
 * @param {object} character 
 * @returns {boolean}
 */
export const isValidCharacter = (character) => {
  if (!character || typeof character !== 'object') return false;
  
  const requiredFields = ['firstName', 'lastName', 'fullName', 'title', 'family', 'image', 'imageUrl'];
  return requiredFields.every(field => 
    typeof character[field] === 'string' && character[field].trim() !== ''
  );
};
