import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { ROLES } from '../../src/constants/roles.constants.js';
import * as usuariosModel from '../../src/modules/usuarios/usuarios.model.js';
import { setupTestDB } from '../setup/db.js';
import { pool } from '../../src/config/db.js';

describe('Usuarios Model', () => {
  let connection;

  beforeAll(async () => {
    // 1. Cargamos el estado inicial de la base de datos (Ej: Admin ID 8)
    await setupTestDB();

    // 2. Insertamos un usuario de de prueba con estado inactivo para testear el flag includeInactive
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [99, '99999999', 'Inactivo', 'Test', 'inactivo@correo.com', 'hashed', '', ROLES.PACIENTE, 0],
    );

    // 3. Insertamos una Obra Social dummy para testear el update de Paciente sin romper la FK
    await pool.execute(
      'INSERT INTO obras_sociales (id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [99, 'OS Falsa', 'Para test de Update', 0, 0, 1],
    );
  });

  // Envolvemos DMLs en Transacciones para garantizar Aislamiento entre tests
  beforeEach(async () => {
    connection = await pool.getConnection();
    await connection.beginTransaction();
  });

  afterEach(async () => {
    await connection.rollback();
    connection.release();
  });

  describe('Consultas Generales (Usuarios)', () => {
    it('findByEmail: debe encontrar un usuario ACTIVO por su email', async () => {
      const email = 'ferben@correo.com';
      const user = await usuariosModel.findByEmail(email);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id_usuario).toBe(8);
      expect(user.rol).toBe(ROLES.ADMIN);
    });

    it('findByEmail: debe devolver null si el email no existe', async () => {
      const inexistente = await usuariosModel.findByEmail('inexistente@correo.com');
      expect(inexistente).toBeNull();
    });

    it('findByEmail: debe devolver null si el email está inactivo y no se pide activamente', async () => {
      const inactivo = await usuariosModel.findByEmail('inactivo@correo.com'); // default es includeInactive=false
      expect(inactivo).toBeNull();
    });

    it('findByEmail: debe encontrar un usuario INACTIVO si se incluye el flag includeInactive', async () => {
      const user = await usuariosModel.findByEmail('inactivo@correo.com', {
        includeInactive: true,
      });
      expect(user).toBeDefined();
      expect(user.activo).toBe(0);
      expect(user.id_usuario).toBe(99);
    });

    it('findByDocumento: debe encontrar un usuario ACTIVO por documento', async () => {
      const doc = '51000111';
      const user = await usuariosModel.findByDocumento(doc);

      expect(user).toBeDefined();
      expect(user.id_usuario).toBe(8);
      // El diseño de la BD devuelve solo el ID de usuario para los activos por defecto (optimización)
      expect(user.activo).toBeUndefined();
    });

    it('findByDocumento: debe encontrar un usuario INACTIVO devolviendo id_usuario y activo si se incluye includeInactive', async () => {
      const user = await usuariosModel.findByDocumento('99999999', { includeInactive: true });
      expect(user).toBeDefined();
      expect(user.activo).toBe(0);
      expect(user.id_usuario).toBe(99);
    });

    it('findById: debe encontrar a un usuario ACTIVO por su clave primaria', async () => {
      const user = await usuariosModel.findById(8);
      expect(user).toBeDefined();
      expect(user.email).toBe('ferben@correo.com');
      expect(user.documento).toBe('51000111');
    });
  });

  describe('Mutaciones DML (Transaccionales)', () => {
    it('create: debe insertar un usuario nuevo y devolver el insertId', async () => {
      const userData = {
        documento: '44444444',
        apellido: 'Perez',
        nombres: 'Gaston',
        email: 'gaston@correo.com',
        contrasenia: '123',
        rol: ROLES.PACIENTE,
        foto_path: null,
      };

      const newId = await usuariosModel.create(connection, userData);
      expect(newId).toBeGreaterThan(0);

      // Verificamos directo en la misma transacción (isolation)
      const [rows] = await connection.execute('SELECT * FROM usuarios WHERE id_usuario = ?', [
        newId,
      ]);
      expect(rows.length).toBe(1);
      expect(rows[0].email).toBe('gaston@correo.com');
      expect(rows[0].activo).toBe(1);
    });

    it('reactivateUser: debe actualizar todos los datos de un usuario inactivo y pasarlo a activo', async () => {
      const updatedData = {
        documento: '99999999', // Usamos el ID 99 que era Inactivo
        apellido: 'Reactivado',
        nombres: 'Test',
        email: 'reactivado@correo.com',
        contrasenia: 'hashnew',
        rol: ROLES.MEDICO,
      };

      const id = await usuariosModel.reactivateUser(connection, 99, updatedData);
      expect(id).toBe(99);

      const [rows] = await connection.execute(
        'SELECT email, activo, rol FROM usuarios WHERE id_usuario = ?',
        [99],
      );
      expect(rows[0].activo).toBe(1); // Ahora debe estar activo
      expect(rows[0].email).toBe('reactivado@correo.com');
      expect(rows[0].rol).toBe(ROLES.MEDICO);
    });
  });

  describe('Consultas Generales (Entidades Catálogo)', () => {
    it('findEspecialidadById: debe devolver la especialidad si existe y es activa', async () => {
      const esp = await usuariosModel.findEspecialidadById(1);
      expect(esp).toBeDefined();
      expect(esp.nombre).toBe('PEDIATRÍA');
    });

    it('findEspecialidadById: debe devolver null para un ID de especialidad inexistente', async () => {
      const esp = await usuariosModel.findEspecialidadById(999);
      expect(esp).toBeNull();
    });

    it('findObraSocialById: debe devolver la Obra Social si existe y es activa', async () => {
      const os = await usuariosModel.findObraSocialById(1);
      expect(os).toBeDefined();
      expect(os.nombre).toBe('Jerárquicos');
    });
  });

  describe('Sub-Módulos Perfilamiento (Medico y Paciente)', () => {
    it('createMedico y findMedicoByUserId: transacciona la creacion y asegura relacion 1 a 1', async () => {
      await usuariosModel.createMedico(connection, {
        id_usuario: 8, // Usamos el ID del seed
        id_especialidad: 1,
        matricula: 12345,
        valor_consulta: 5000,
      });

      // Validamos mediante el servicio utilitario
      const [rows] = await connection.execute('SELECT * FROM medicos WHERE id_usuario = 8');

      expect(rows.length).toBe(1);
      expect(rows[0].matricula).toBe(12345);
      expect(rows[0].id_especialidad).toBe(1);
    });

    it('updateMedicoProfile: actualiza las propiedades de un medico pre-existente', async () => {
      await usuariosModel.createMedico(connection, {
        id_usuario: 8,
        id_especialidad: 1,
        matricula: 12345,
        valor_consulta: 5000,
      });

      await usuariosModel.updateMedicoProfile(connection, 8, {
        id_especialidad: 1,
        matricula: 10000,
        valor_consulta: 6000, // Cambio importante
      });

      const [rows] = await connection.execute(
        'SELECT matricula, valor_consulta FROM medicos WHERE id_usuario = 8',
      );
      expect(rows[0].matricula).toBe(10000);
      // La BD lo mapea como un String en decimal, de ser DECIMAL
      expect(parseFloat(rows[0].valor_consulta)).toBe(6000);
    });

    it('deleteMedicoProfile: borra en cascada la sub-entidad del médico', async () => {
      await usuariosModel.createMedico(connection, {
        id_usuario: 8,
        id_especialidad: 1,
        matricula: 12345,
        valor_consulta: 5000,
      });
      await usuariosModel.deleteMedicoProfile(connection, 8);

      const [rows] = await connection.execute('SELECT * FROM medicos WHERE id_usuario = 8');
      expect(rows.length).toBe(0);
    });

    it('createPaciente: inserta y relaciona un nuevo paciente', async () => {
      await usuariosModel.createPaciente(connection, {
        id_usuario: 8,
        id_obra_social: 1,
      });

      const [rows] = await connection.execute(
        'SELECT id_obra_social FROM pacientes WHERE id_usuario = 8',
      );
      expect(rows.length).toBe(1);
      expect(rows[0].id_obra_social).toBe(1);
    });

    it('updatePacienteProfile: edita la relacion del paciente', async () => {
      await usuariosModel.createPaciente(connection, { id_usuario: 8, id_obra_social: 1 });
      await usuariosModel.updatePacienteProfile(connection, 8, { id_obra_social: 99 });

      const [rows] = await connection.execute(
        'SELECT id_obra_social FROM pacientes WHERE id_usuario = 8',
      );
      expect(rows[0].id_obra_social).toBe(99);
    });

    it('deletePacienteProfile: borra al paciente', async () => {
      await usuariosModel.createPaciente(connection, { id_usuario: 8, id_obra_social: 1 });
      await usuariosModel.deletePacienteProfile(connection, 8);

      const [rows] = await connection.execute('SELECT * FROM pacientes WHERE id_usuario = 8');
      expect(rows.length).toBe(0);
    });
  });
});
