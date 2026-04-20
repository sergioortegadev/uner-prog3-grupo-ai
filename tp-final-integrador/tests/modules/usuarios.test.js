import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app } from '../../src/app.js';
import { UPLOAD_CONFIG } from '../../src/config/upload.config.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Usuarios - Integration Tests', () => {
  const uploadedFiles = [];

  beforeEach(async () => {
    const { setupTestDB } = await import('../setup/db.js');
    await setupTestDB();
  });

  afterAll(() => {
    // Cleanup de archivos subidos durante los tests
    uploadedFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  describe('POST /api/v1/usuarios', () => {
    it('debería registrar un usuario con foto y devolver el foto_path correctamente', async () => {
      // Crear un buffer que simula una imagen en memoria
      const buffer = Buffer.from('fake image content');
      const fileName = 'test_integration_foto.jpg';

      const response = await request(app)
        .post('/api/v1/usuarios')
        .field('documento', '99888777')
        .field('apellido', 'TestLastName')
        .field('nombres', 'TestFirstName')
        .field('email', 'test.integration@correo.com')
        .field('password', 'password123')
        .field('rol', ROLES.PACIENTE)
        .field('id_obra_social', 1)
        .attach('foto', buffer, fileName);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const user = response.body.data;
      expect(user).toBeDefined();
      expect(user.email).toBe('test.integration@correo.com');

      // Validar que el foto_path está presente y tiene el formato correcto
      expect(user.foto_path).toBeDefined();
      expect(user.foto_path).toContain(UPLOAD_CONFIG.URL_PREFIX);
      expect(user.foto_path).toContain('.jpg');

      // Guardar para posterior cleanup (convertir ruta de URL a ruta del filesystem)
      // foto_path ej: /uploads/usuarios/168...-test_integration_foto.jpg
      // El STORAGE_DEST es public/uploads/usuarios
      const filenameOnly = path.basename(user.foto_path);
      const filePath = path.join(UPLOAD_CONFIG.STORAGE_DEST, filenameOnly);
      uploadedFiles.push(filePath);

      // Verificar físicamente que el archivo se haya creado
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('debería registrar un usuario sin foto si no se envía el campo', async () => {
      const response = await request(app).post('/api/v1/usuarios').send({
        documento: '99888666',
        apellido: 'NoPhoto',
        nombres: 'User',
        email: 'nophoto@correo.com',
        password: 'password123',
        rol: ROLES.PACIENTE,
        id_obra_social: 1,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const user = response.body.data;
      expect(user.foto_path).toBeNull();
    });

    it('debería fallar si se intenta subir un archivo que no sea imagen', async () => {
      const buffer = Buffer.from('fake txt content');
      const fileName = 'test.txt';

      const response = await request(app)
        .post('/api/v1/usuarios')
        .field('documento', '99888555')
        .field('apellido', 'InvalidFile')
        .field('nombres', 'User')
        .field('email', 'invalidfile@correo.com')
        .field('password', 'password123')
        .field('rol', ROLES.PACIENTE)
        .field('id_obra_social', 1)
        .attach('foto', buffer, fileName);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Tipo de archivo inválido');
    });

    it('debería fallar con 400 si faltan campos obligatorios', async () => {
      const response = await request(app).post('/api/v1/usuarios').send({
        nombres: 'FaltanDatos',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBeDefined();
    });

    it('debería fallar con 409 si el usuario ya existe (Integration)', async () => {
      await request(app).post('/api/v1/usuarios').send({
        documento: '11223344',
        apellido: 'Test',
        nombres: 'Integration',
        email: 'dup.integration@correo.com',
        password: 'password123',
        rol: ROLES.PACIENTE,
        id_obra_social: 1,
      });

      const response = await request(app).post('/api/v1/usuarios').send({
        documento: '11223344',
        apellido: 'Test',
        nombres: 'Integration',
        email: 'other@correo.com',
        password: 'password123',
        rol: ROLES.PACIENTE,
        id_obra_social: 1,
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });
});
