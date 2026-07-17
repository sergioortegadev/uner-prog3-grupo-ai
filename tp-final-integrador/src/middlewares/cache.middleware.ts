import apicache from 'apicache';

// Configuración global de apicache
apicache.options({
  debug: false,
  statusCodes: {
    include: [200],
  },
});

/**
 * Duraciones predefinidas para el cache
 */
export const CACHE_DURATIONS = {
  SHORT: '5 minutes',
  MEDIUM: '15 minutes',
  LONG: '1 hour',
};

/**
 * Helper para verificar si la caché está activa en el entorno actual
 * @returns {boolean}
 */
const isCacheEnabled = () => {
  return process.env.NODE_ENV !== 'test' || process.env.ENABLE_CACHE === 'true';
};

/**
 * Middleware para cachear respuestas
 * @param {string} duration - Duración del cache (e.g. '5 minutes')
 * @param {string} group - Grupo al que pertenece el cache para invalidación selectiva
 */
export const cacheMiddleware = (duration, group) => {
  return (req, res, next) => {
    if (!isCacheEnabled()) {
      return next();
    }

    // Parcheamos temporalmente setHeader para obligar a apicache a mandar 'no-cache' en el Hit
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name, value) {
      if (name.toLowerCase() === 'cache-control') {
        return originalSetHeader.call(this, name, 'no-cache');
      }
      return originalSetHeader.call(this, name, value);
    };

    req.apicacheGroup = group;
    return apicache.middleware(duration)(req, res, next);
  };
};

/**
 * Middleware para limpiar el cache de un grupo específico
 * @param {string} group - Grupo a limpiar
 */
export const clearCacheMiddleware = (group) => {
  return (req, res, next) => {
    if (!isCacheEnabled()) {
      return next();
    }

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        apicache.clear(group);
      }
    });
    next();
  };
};
