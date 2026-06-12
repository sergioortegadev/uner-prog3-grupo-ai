import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { globalErrorHandler } from '../../src/middlewares/error.middleware.js';

describe('File Upload Cleanup Logic (Unit/Integration)', () => {
  const TEST_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'test-cleanup');
  const dummyFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');

  let testApp;
  const upload = multer({ dest: TEST_UPLOADS_DIR });

  beforeAll(() => {
    if (!fs.existsSync(TEST_UPLOADS_DIR)) {
      fs.mkdirSync(TEST_UPLOADS_DIR, { recursive: true });
    }
    const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    if (!fs.existsSync(dummyFilePath)) {
      fs.writeFileSync(dummyFilePath, 'dummy image content');
    }

    // App de prueba mínima para disparar el globalErrorHandler
    testApp = express();
    testApp.use(express.json());

    // Ruta que sube un solo archivo y falla
    testApp.post('/test-single-error', upload.single('foto'), (req, res, next) => {
      next(new Error('Forced Error'));
    });

    // Ruta que sube varios archivos (array) y falla
    testApp.post('/test-array-error', upload.array('fotos', 3), (req, res, next) => {
      next(new Error('Forced Error'));
    });

    // Ruta que sube varios archivos (fields) y falla
    testApp.post(
      '/test-fields-error',
      upload.fields([{ name: 'avatar' }, { name: 'gallery' }]),
      (req, res, next) => {
        next(new Error('Forced Error'));
      },
    );

    testApp.use(globalErrorHandler);
  });

  afterAll(() => {
    if (fs.existsSync(TEST_UPLOADS_DIR)) {
      fs.rmSync(TEST_UPLOADS_DIR, { recursive: true, force: true });
    }
  });

  describe('Success scenarios', () => {
    it('should keep req.file on disk when upload is successful', async () => {
      // Definimos una ruta de éxito para este test
      testApp.post('/test-single-success', upload.single('foto'), (req, res) => {
        res.status(200).json({ filename: req.file.filename });
      });

      const response = await request(testApp)
        .post('/test-single-success')
        .attach('foto', dummyFilePath);

      expect(response.status).toBe(200);

      const files = fs.readdirSync(TEST_UPLOADS_DIR);
      expect(files.length).toBe(1);
      expect(files[0]).toBe(response.body.filename);

      // Limpieza manual para el siguiente test
      fs.unlinkSync(path.join(TEST_UPLOADS_DIR, files[0]));
    });

    it('should keep all req.files (array) on disk when upload is successful', async () => {
      testApp.post('/test-array-success', upload.array('fotos', 3), (req, res) => {
        res.status(200).json({ filenames: req.files.map((f) => f.filename) });
      });

      const response = await request(testApp)
        .post('/test-array-success')
        .attach('fotos', dummyFilePath)
        .attach('fotos', dummyFilePath);

      expect(response.status).toBe(200);

      const files = fs.readdirSync(TEST_UPLOADS_DIR);
      expect(files.length).toBe(2);
      expect(response.body.filenames).toContain(files[0]);
      expect(response.body.filenames).toContain(files[1]);

      // Limpieza manual
      files.forEach((f) => fs.unlinkSync(path.join(TEST_UPLOADS_DIR, f)));
    });

    it('should keep all req.files (fields) on disk when upload is successful', async () => {
      testApp.post(
        '/test-fields-success',
        upload.fields([{ name: 'avatar' }, { name: 'gallery' }]),
        (req, res) => {
          const filenames = [];
          if (req.files.avatar) filenames.push(req.files.avatar[0].filename);
          if (req.files.gallery) filenames.push(req.files.gallery[0].filename);
          res.status(200).json({ filenames });
        },
      );

      const response = await request(testApp)
        .post('/test-fields-success')
        .attach('avatar', dummyFilePath)
        .attach('gallery', dummyFilePath);

      expect(response.status).toBe(200);

      const files = fs.readdirSync(TEST_UPLOADS_DIR);
      expect(files.length).toBe(2);

      // Limpieza manual
      files.forEach((f) => fs.unlinkSync(path.join(TEST_UPLOADS_DIR, f)));
    });
  });

  describe('Cleanup on error scenarios', () => {
    it('should clean up req.file when an error occurs', async () => {
      const response = await request(testApp)
        .post('/test-single-error')
        .attach('foto', dummyFilePath);

      expect(response.status).toBe(500);

      // Verificar que el directorio está vacío
      const files = fs.readdirSync(TEST_UPLOADS_DIR);
      expect(files.length).toBe(0);
    });

    it('should clean up req.files (array) when an error occurs', async () => {
      const response = await request(testApp)
        .post('/test-array-error')
        .attach('fotos', dummyFilePath)
        .attach('fotos', dummyFilePath);

      expect(response.status).toBe(500);

      // Verificar que el directorio está vacío
      const files = fs.readdirSync(TEST_UPLOADS_DIR);
      expect(files.length).toBe(0);
    });

    it('should clean up req.files (fields) when an error occurs', async () => {
      const response = await request(testApp)
        .post('/test-fields-error')
        .attach('avatar', dummyFilePath)
        .attach('gallery', dummyFilePath);

      expect(response.status).toBe(500);

      // Verificar que el directorio está vacío
      const files = fs.readdirSync(TEST_UPLOADS_DIR);
      expect(files.length).toBe(0);
    });
  });
});
