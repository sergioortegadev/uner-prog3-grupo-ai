/**
 * Configuración de Swagger (OpenAPI 3.0.0) para la API de Clínica Médica.
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Clínica Médica API',
    version: '1.0.0',
    description:
      'API REST robusta para la gestión integral de una clínica médica, incluyendo autenticación, obras sociales, especialidades, médicos, pacientes y reserva de turnos.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Entorno de Desarrollo API v1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Ingrese el token JWT obtenido en el inicio de sesión para acceder a los endpoints protegidos.',
      },
    },
    schemas: {
      // Wrapper de respuesta exitosa estándar
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
        },
      },
      // Wrapper de respuesta paginada
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 12 },
              limit: { type: 'integer', example: 10 },
              offset: { type: 'integer', example: 0 },
              order: { type: 'string', example: 'nombre' },
              asc: { type: 'boolean', example: true },
              filters: { type: 'object', nullable: true, example: null },
            },
          },
        },
      },
      // Error estándar de la aplicación
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Error de validación en los datos enviados' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                },
                example: [
                  {
                    type: 'field',
                    value: '',
                    msg: 'El nombre de la obra social es requerido',
                    path: 'nombre',
                    location: 'body',
                  },
                ],
              },
            },
          },
        },
      },
      // Entidades
      ObraSocial: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'OSDE' },
          descripcion: { type: 'string', example: 'Plan Integral de Salud' },
          porcentajeDescuento: { type: 'number', format: 'float', example: 0.2 },
          esParticular: { type: 'boolean', example: false },
          activo: { type: 'boolean', example: true },
        },
      },
      Especialidad: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'PEDIATRÍA' },
          activo: { type: 'boolean', example: true },
        },
      },
      Medico: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          documento: { type: 'string', example: '31000111' },
          apellido: { type: 'string', example: 'Lopez' },
          nombres: { type: 'string', example: 'Marcelo' },
          email: { type: 'string', example: 'lopmar@correo.com' },
          matricula: { type: 'integer', example: 1000 },
          descripcion: { type: 'string', example: 'Pediatra de cabecera' },
          valorConsulta: { type: 'number', format: 'float', example: 5000.0 },
          activo: { type: 'boolean', example: true },
          especialidad: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nombre: { type: 'string', example: 'PEDIATRÍA' },
            },
          },
          obrasSociales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'OSDE' },
              },
            },
          },
        },
      },
      Paciente: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          documento: { type: 'string', example: '41000111' },
          apellido: { type: 'string', example: 'Lopez' },
          nombres: { type: 'string', example: 'Jacinto' },
          email: { type: 'string', example: 'lopjac@correo.com' },
          activo: { type: 'boolean', example: true },
          obraSocial: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nombre: { type: 'string', example: 'Jerárquicos' },
              descripcion: { type: 'string', example: 'jer' },
              porcentajeDescuento: { type: 'number', example: 0.1 },
            },
          },
        },
      },
      Turno: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          fechaHora: { type: 'string', example: '2026-07-15 14:30:00' },
          valorTotal: { type: 'number', format: 'float', example: 4500.0 },
          atendido: { type: 'boolean', example: false },
          activo: { type: 'boolean', example: true },
          medico: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              apellido: { type: 'string', example: 'Lopez' },
              nombres: { type: 'string', example: 'Marcelo' },
              especialidad: { type: 'string', example: 'PEDIATRÍA' },
            },
          },
          paciente: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              apellido: { type: 'string', example: 'Lopez' },
              nombres: { type: 'string', example: 'Jacinto' },
            },
          },
          obraSocial: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nombre: { type: 'string', example: 'OSDE' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Obtener el estado de salud del sistema',
        description: 'Retorna el estado operativo de la API y de la conexión a la base de datos.',
        tags: ['Sistema'],
        responses: {
          200: {
            description: 'Servicio operativo y saludable.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'OK' },
                        database: { type: 'string', example: 'CONNECTED' },
                        uptime: { type: 'number', example: 120.5 },
                        timestamp: { type: 'string', example: '2026-06-10T04:32:00.000Z' },
                        version: { type: 'string', example: '1.0.0' },
                      },
                    },
                  },
                },
              },
            },
          },
          503: {
            description: 'Error al conectar con la base de datos o servicio inactivo.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Iniciar sesión en el sistema',
        description:
          'Autentica a un usuario por correo y contraseña, y retorna el token JWT firmado.',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'contrasenia'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'lopmar@correo.com',
                    description: 'Email del usuario registrado.',
                  },
                  contrasenia: {
                    type: 'string',
                    format: 'password',
                    example: '123456',
                    description: 'Contraseña del usuario.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticación exitosa. Retorna el token JWT.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                          description:
                            'Token JWT para incluir en la cabecera Authorization: Bearer <token>',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos faltantes o incorrectos.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Credenciales inválidas.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/obras-sociales': {
      get: {
        summary: 'Listar todas las obras sociales',
        description:
          'Obtiene el listado completo de obras sociales en el sistema. Soporta paginación, ordenamiento y filtrado por estado u otros campos. Solo disponible para administradores.',
        tags: ['Obras Sociales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'order',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'nombre', 'porcentajeDescuento', 'activo'],
              default: 'nombre',
            },
            description: 'Campo por el cual ordenar.',
          },
          {
            name: 'asc',
            in: 'query',
            schema: {
              type: 'boolean',
              default: true,
            },
            description: 'Dirección del orden (true para ascendente, false para descendente).',
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
            description: 'Cantidad máxima de resultados.',
          },
          {
            name: 'offset',
            in: 'query',
            schema: {
              type: 'integer',
              default: 0,
            },
            description: 'Desplazamiento para paginación.',
          },
          {
            name: 'activo',
            in: 'query',
            schema: {
              type: 'integer',
              enum: [0, 1],
            },
            description: 'Filtrar por estado activo (1) o inactivo (0).',
          },
          {
            name: 'nombre',
            in: 'query',
            schema: {
              type: 'string',
            },
            description: 'Filtrar por nombre (búsqueda parcial).',
          },
        ],
        responses: {
          200: {
            description: 'Listado de obras sociales obtenido con éxito.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaginatedResponse',
                },
              },
            },
          },
          401: { description: 'No autenticado.' },
          403: { description: 'Acceso denegado (Requiere rol Administrador).' },
        },
      },
      post: {
        summary: 'Registrar nueva obra social',
        description: 'Crea un nuevo registro de obra social. Solo disponible para administradores.',
        tags: ['Obras Sociales'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'descripcion'],
                properties: {
                  nombre: { type: 'string', maxLength: 120, example: 'OSDE' },
                  descripcion: { type: 'string', maxLength: 255, example: 'Plan Integral prepago' },
                  porcentajeDescuento: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    default: 0.0,
                    example: 0.2,
                  },
                  esParticular: { type: 'boolean', default: false, example: false },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Obra social creada con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ObraSocial' },
                  },
                },
              },
            },
          },
          422: {
            description: 'Error de validación.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/obras-sociales/{id}': {
      get: {
        summary: 'Obtener detalle de obra social',
        description:
          'Busca y retorna la información completa de una obra social por su identificador. Solo disponible para administradores.',
        tags: ['Obras Sociales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la obra social.',
          },
        ],
        responses: {
          200: {
            description: 'Detalle de la obra social obtenido.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ObraSocial' },
                  },
                },
              },
            },
          },
          404: {
            description: 'La obra social no existe.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Actualizar obra social',
        description:
          'Actualiza de forma parcial o total los campos de una obra social por su identificador. Requiere rol Administrador.',
        tags: ['Obras Sociales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la obra social.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', maxLength: 120, example: 'OSDE' },
                  descripcion: {
                    type: 'string',
                    maxLength: 255,
                    example: 'Descripción actualizada',
                  },
                  porcentajeDescuento: { type: 'number', minimum: 0, maximum: 1, example: 0.25 },
                  esParticular: { type: 'boolean', example: false },
                  activo: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Obra social actualizada con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Obra social actualizada correctamente',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Obra social no encontrada.' },
        },
      },
      delete: {
        summary: 'Dar de baja una obra social',
        description:
          'Realiza una baja lógica (soft delete) marcando el campo activo como inactivo. Requiere rol Administrador.',
        tags: ['Obras Sociales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la obra social.',
          },
        ],
        responses: {
          200: {
            description: 'Obra social eliminada lógicamente.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'Obra social eliminada correctamente' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Obra social no encontrada.' },
        },
      },
    },
    '/especialidades': {
      get: {
        summary: 'Listar especialidades médicas',
        description:
          'Obtiene el listado de especialidades activas. Administradores pueden ver todas, los pacientes solo las activas.',
        tags: ['Especialidades'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'order',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'nombre'],
              default: 'nombre',
            },
          },
          {
            name: 'asc',
            in: 'query',
            schema: { type: 'boolean', default: true },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: {
            description: 'Listado de especialidades médicas.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Registrar nueva especialidad',
        description: 'Crea una especialidad médica. Requiere rol Administrador.',
        tags: ['Especialidades'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'CARDIOLOGÍA' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Especialidad creada con éxito.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Especialidad' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/especialidades/{id}': {
      get: {
        summary: 'Obtener detalle de especialidad',
        tags: ['Especialidades'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Detalle de la especialidad.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Especialidad' },
                  },
                },
              },
            },
          },
          404: { description: 'Especialidad no encontrada.' },
        },
      },
      put: {
        summary: 'Actualizar especialidad',
        description: 'Modifica el nombre de una especialidad médica. Requiere rol Administrador.',
        tags: ['Especialidades'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'TRAUMATOLOGÍA INFANTIL' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Especialidad actualizada correctamente.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Especialidad actualizada correctamente',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Eliminar/Baja lógica de especialidad',
        description:
          'Desactiva una especialidad del sistema de manera lógica. Requiere rol Administrador.',
        tags: ['Especialidades'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Especialidad eliminada correctamente.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Especialidad eliminada correctamente',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/medicos': {
      get: {
        summary: 'Listar todos los médicos',
        description:
          'Obtiene el listado de médicos con su información de usuario, especialidad y obras sociales. Disponible para Pacientes.',
        tags: ['Médicos'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Listado completo de médicos.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Medico' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/medicos/{idMedico}/obras-sociales': {
      post: {
        summary: 'Asociar obras sociales al médico',
        description:
          'Asocia una lista de obras sociales aceptadas por el médico. Requiere rol Administrador.',
        tags: ['Médicos'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'idMedico', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['obrasSociales'],
                properties: {
                  obrasSociales: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 2, 3],
                    description: 'IDs de obras sociales a asociar.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Asociaciones actualizadas.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        asociadas: { type: 'array', items: { type: 'integer' }, example: [1, 2] },
                        yaAsociadas: { type: 'array', items: { type: 'integer' }, example: [3] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/medicos/{idMedico}/especialidad': {
      patch: {
        summary: 'Actualizar especialidad del médico',
        description:
          'Modifica la especialidad de un médico asignando un nuevo ID de especialidad. Requiere rol Administrador.',
        tags: ['Médicos'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'idMedico', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idEspecialidad'],
                properties: {
                  idEspecialidad: {
                    type: 'integer',
                    example: 3,
                    description: 'ID de la nueva especialidad.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Especialidad modificada correctamente.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Especialidad actualizada correctamente',
                        },
                        idMedico: { type: 'integer', example: 1 },
                        idEspecialidad: { type: 'integer', example: 3 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/pacientes': {
      get: {
        summary: 'Listar todos los pacientes',
        description:
          'Retorna la lista completa de pacientes de la clínica con su información de usuario y obra social. Requiere rol Administrador.',
        tags: ['Pacientes'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Listado de pacientes.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Paciente' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/pacientes/{id_paciente}': {
      get: {
        summary: 'Obtener paciente por ID',
        description:
          'Retorna los datos de un paciente por su identificador. Requiere rol Administrador.',
        tags: ['Pacientes'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id_paciente', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Datos del paciente.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Paciente' },
                  },
                },
              },
            },
          },
          404: { description: 'Paciente no encontrado.' },
        },
      },
    },
    '/pacientes/{id_paciente}/{id_obra_social}': {
      patch: {
        summary: 'Asignar obra social a un paciente',
        description:
          'Asocia una obra social existente a un paciente registrado. Requiere rol Administrador.',
        tags: ['Pacientes'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id_paciente', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'id_obra_social', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Obra social asignada correctamente.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        idPaciente: { type: 'integer', example: 1 },
                        idObraSocial: { type: 'integer', example: 2 },
                        obraSocialNombre: { type: 'string', example: 'OSUNER' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/turnos': {
      get: {
        summary: 'Listar turnos del usuario',
        description:
          'Obtiene los turnos propios del Médico o del Paciente autenticado. Los resultados están filtrados y variarán según el rol del usuario (los médicos no ven campos del médico, los pacientes no ven campos del paciente).',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', default: 'fecha_hora' },
            description: 'Campo de ordenamiento (solo fecha_hora).',
          },
          {
            name: 'asc',
            in: 'query',
            schema: { type: 'boolean', default: false },
            description: 'Dirección del orden (true para asc, false para desc).',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
          {
            name: 'atendido',
            in: 'query',
            schema: { type: 'integer', enum: [0, 1] },
            description: 'Filtrar por turnos atendidos (1) o no atendidos (0).',
          },
        ],
        responses: {
          200: {
            description: 'Listado de turnos propios.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Registrar un nuevo turno',
        description:
          'Registra un turno en la clínica. Si es Paciente, se resuelven automáticamente su idPaciente y su idObraSocial de su perfil. Si es Administrador, debe proveer obligatoriamente idPaciente e idObraSocial en el body.',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idMedico', 'fecha', 'hora'],
                properties: {
                  idMedico: { type: 'integer', example: 1, description: 'ID del médico asignado.' },
                  fecha: {
                    type: 'string',
                    format: 'date',
                    example: '2026-07-15',
                    description: 'Fecha en formato YYYY-MM-DD.',
                  },
                  hora: {
                    type: 'string',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    example: '14:30',
                    description: 'Hora en formato HH:mm.',
                  },
                  idPaciente: {
                    type: 'integer',
                    example: 1,
                    description: 'Requerido solo si el rol del emisor es Administrador.',
                  },
                  idObraSocial: {
                    type: 'integer',
                    example: 2,
                    description: 'Requerido solo si el rol del emisor es Administrador.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description:
              'Turno reservado exitosamente. Retorna los detalles del turno y el valor calculado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Turno' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/turnos/{id}/atendido': {
      patch: {
        summary: 'Marcar turno como atendido',
        description:
          'Registra que el médico atendió el turno correspondiente. Solo disponible para Médicos y sobre sus propios turnos.',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Turno actualizado como atendido.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 5 },
                        atendido: { type: 'boolean', example: true },
                        fechaHora: { type: 'string', example: '2026-07-15 14:30:00' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
