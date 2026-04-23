import fs from 'fs';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { uploadFotoUsuario } from '../../src/middlewares/upload.middleware.js';
import { UPLOAD_CONFIG } from '../../src/config/upload.config.js';

// ---- Configuración de App Falsa para Mocks de Express ----
const app = express();

app.post('/test-upload', (req, res, _next) => {
  uploadFotoUsuario(req, res, (err) => {
    if (err) {
      // Diferenciamos AppError vs MulterError vs Default Error
      const status =
        err.statusCode || // AppError
        (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400); // Multer
      return res.status(status).json({ status: 'error', message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    res.status(200).json({ status: 'success', file: req.file });
  });
});

// ---- Suite de Tests ----
describe('Upload Middleware - Multer (Integration)', () => {
  const testFiles = []; // Para limpiar disco después

  beforeAll(() => {
    // Aseguramos que el directorio físico exista sino Multer se rompe
    if (!fs.existsSync(UPLOAD_CONFIG.STORAGE_DEST)) {
      fs.mkdirSync(UPLOAD_CONFIG.STORAGE_DEST, { recursive: true });
    }
  });

  afterAll(() => {
    // Wipe de limpieza: borramos cada archivo creado
    for (const filePath of testFiles) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });

  // Generador Helper de payload simulado
  const getTestBuffer = (size) => Buffer.alloc(size, 'a');

  it('debe permitir subir una imagen válida y crearla en disco con prefijo epoch único', async () => {
    const buffer = getTestBuffer(1024); // 1KB ficticio

    const res = await request(app)
      .post('/test-upload')
      .attach('foto', buffer, { filename: 'avatar_feliz.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.file).toBeDefined();

    // Comprobamos la semántica del Multer diskStorage (Timestamp + CleanName)
    expect(res.body.file.filename).toMatch(/^\d+-avatar_feliz\.jpg$/);

    // Guardado global para limpiarlo mágicamente en el afterAll
    testFiles.push(res.body.file.path);
  });

  it('debe rechazar cualquier archivo fuera del vector MIME permitido (Ej: un ejecutable/pdf)', async () => {
    const buffer = getTestBuffer(1024);

    const res = await request(app)
      .post('/test-upload')
      .attach('foto', buffer, { filename: 'documento_malo.pdf', contentType: 'application/pdf' });

    // Esperamos status Code de nuestro AppError por default (400)
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Tipo de archivo inválido');
    expect(res.body.message).toContain('Solo se permiten imágenes JPEG, PNG, GIF o WebP');
  });

  it('debe rechazar en el parseo una subida que supere la cota estricta asigada (MAX_FILE_SIZE)', async () => {
    // Forzamos pasar el límite máximo + 1KB
    const oversizedBuffer = getTestBuffer(UPLOAD_CONFIG.MAX_FILE_SIZE + 1024);

    const res = await request(app)
      .post('/test-upload')
      .attach('foto', oversizedBuffer, { filename: 'heavy.png', contentType: 'image/png' });

    // status 413 "Payload Too Large" esperado
    expect(res.status).toBe(413);
    expect(res.body.message).toContain('File too large');
  });

  it('debe sanitizar caracteres extraños/peligrosos del nombre del archivo y convertir a minúsculas', async () => {
    const buffer = getTestBuffer(1024);

    const res = await request(app).post('/test-upload').attach('foto', buffer, {
      filename: '../../../../C!H@A#U.WEBP', // Intento de Path Traversal + Mayúsculas + caracteres feos
      contentType: 'image/webp',
    });

    expect(res.status).toBe(200);

    // basename() recorta el '../../../'
    // regex reescribe a "_" los caracteres especiales de 'C!H@A#U' -> "C_H_A_U"
    // toLowerCase() lo pasa a "c_h_a_u"
    expect(res.body.file.filename).toMatch(/^\d+-c_h_a_u\.webp$/);

    testFiles.push(res.body.file.path);
  });

  it('debe prevenir MIME Spoofing forzando la extensión correcta basada en el mimetype (ej: .php -> .jpg)', async () => {
    const buffer = getTestBuffer(1024);

    const res = await request(app).post('/test-upload').attach('foto', buffer, {
      filename: 'malicious.php',
      contentType: 'image/jpeg',
    });

    expect(res.status).toBe(200);
    // Debe haber ignorado .php y puesto .jpg
    expect(res.body.file.filename).toMatch(/\.jpg$/);
    expect(res.body.file.filename).not.toMatch(/\.php$/);

    testFiles.push(res.body.file.path);
  });

  it('debe retornar 400 si no se envía ningún archivo', async () => {
    const res = await request(app).post('/test-upload').send({}); // Payload vacío sin multipart

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No file uploaded');
  });

  it('debe rechazar el archivo si se envía con un nombre de campo incorrecto', async () => {
    const buffer = getTestBuffer(1024);

    const res = await request(app)
      .post('/test-upload')
      .attach('archivo_incorrecto', buffer, { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Unexpected field');
  });

  it('debe asignar una extensión segura si el archivo original no tiene ninguna', async () => {
    const buffer = getTestBuffer(1024);

    const res = await request(app)
      .post('/test-upload')
      .attach('foto', buffer, { filename: 'justname', contentType: 'image/webp' });

    expect(res.status).toBe(200);
    expect(res.body.file.filename).toMatch(/^\d+-justname\.webp$/);

    testFiles.push(res.body.file.path);
  });

  it('debe rechazar archivos vacíos (0 bytes)', async () => {
    const emptyBuffer = Buffer.alloc(0);

    const res = await request(app)
      .post('/test-upload')
      .attach('foto', emptyBuffer, { filename: 'empty.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('archivo subido está vacío');
  });
});
