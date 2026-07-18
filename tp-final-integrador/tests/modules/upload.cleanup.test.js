import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { body } from 'express-validator';
// Definir el directorio de prueba antes de importar los módulos que lo usan
const TEST_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'test-usuarios');
process.env.UPLOADS_DIR = TEST_UPLOADS_DIR;
import { globalErrorHandler } from '../../src/middlewares/error.middleware.ts';
import { uploadImage } from '../../src/middlewares/multer.middleware.ts';
import { validateRequest } from '../../src/middlewares/validate.middleware.ts';
describe('File Upload Cleanup Logic (Unit/Integration)', () => {
    const dummyFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
    let testApp;
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
        // --- Success Routes ---
        testApp.post('/test-single-success', uploadImage.single('foto'), (req, res) => {
            res.status(200).json({ filename: req.file.filename });
        });
        testApp.post('/test-array-success', uploadImage.array('fotos', 3), (req, res) => {
            res.status(200).json({ filenames: req.files.map((f) => f.filename) });
        });
        testApp.post('/test-fields-success', uploadImage.fields([{ name: 'avatar' }, { name: 'gallery' }]), (req, res) => {
            const filenames = [];
            if (req.files.avatar)
                filenames.push(req.files.avatar[0].filename);
            if (req.files.gallery)
                filenames.push(req.files.gallery[0].filename);
            res.status(200).json({ filenames });
        });
        // --- Error Routes ---
        // Ruta que sube un solo archivo y falla
        testApp.post('/test-single-error', uploadImage.single('foto'), (req, res, next) => {
            next(new Error('Forced Error'));
        });
        // Ruta que sube varios archivos (array) y falla
        testApp.post('/test-array-error', uploadImage.array('fotos', 3), (req, res, next) => {
            next(new Error('Forced Error'));
        });
        // Ruta que sube varios archivos (fields) y falla
        testApp.post('/test-fields-error', uploadImage.fields([{ name: 'avatar' }, { name: 'gallery' }]), (req, res, next) => {
            next(new Error('Forced Error'));
        });
        // Ruta que simula un fallo de validación de express-validator
        testApp.post('/test-validation-error', uploadImage.single('foto'), body('nombre').notEmpty().withMessage('El nombre es requerido'), validateRequest, (req, res) => {
            res.status(200).json({ filename: req.file.filename });
        });
        testApp.use(globalErrorHandler);
    });
    afterEach(() => {
        // Limpiar el directorio después de cada test para aislamiento total
        if (fs.existsSync(TEST_UPLOADS_DIR)) {
            const files = fs.readdirSync(TEST_UPLOADS_DIR);
            for (const file of files) {
                fs.unlinkSync(path.join(TEST_UPLOADS_DIR, file));
            }
        }
    });
    afterAll(() => {
        // Ahora es seguro borrar todo el directorio de pruebas
        if (fs.existsSync(TEST_UPLOADS_DIR)) {
            fs.rmSync(TEST_UPLOADS_DIR, { recursive: true, force: true });
        }
    });
    describe('Success scenarios', () => {
        it('should keep req.file on disk when upload is successful', async () => {
            const response = await request(testApp)
                .post('/test-single-success')
                .attach('foto', dummyFilePath);
            expect(response.status).toBe(200);
            const filePath = path.join(TEST_UPLOADS_DIR, response.body.filename);
            expect(fs.existsSync(filePath)).toBe(true);
        });
        it('should keep all req.files (array) on disk when upload is successful', async () => {
            const response = await request(testApp)
                .post('/test-array-success')
                .attach('fotos', dummyFilePath)
                .attach('fotos', dummyFilePath);
            expect(response.status).toBe(200);
            for (const filename of response.body.filenames) {
                const filePath = path.join(TEST_UPLOADS_DIR, filename);
                expect(fs.existsSync(filePath)).toBe(true);
            }
        });
        it('should keep all req.files (fields) on disk when upload is successful', async () => {
            const response = await request(testApp)
                .post('/test-fields-success')
                .attach('avatar', dummyFilePath)
                .attach('gallery', dummyFilePath);
            expect(response.status).toBe(200);
            for (const filename of response.body.filenames) {
                const filePath = path.join(TEST_UPLOADS_DIR, filename);
                expect(fs.existsSync(filePath)).toBe(true);
            }
        });
    });
    describe('Cleanup on error scenarios', () => {
        it('should clean up req.file when an error occurs', async () => {
            const beforeFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            const response = await request(testApp)
                .post('/test-single-error')
                .attach('foto', dummyFilePath);
            expect(response.status).toBe(500);
            const afterFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(afterFiles.length).toBe(beforeFiles.length);
        });
        it('should clean up req.files (array) when an error occurs', async () => {
            const beforeFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            const response = await request(testApp)
                .post('/test-array-error')
                .attach('fotos', dummyFilePath)
                .attach('fotos', dummyFilePath);
            expect(response.status).toBe(500);
            const afterFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(afterFiles.length).toBe(beforeFiles.length);
        });
        it('should clean up req.files (fields) when an error occurs', async () => {
            const beforeFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            const response = await request(testApp)
                .post('/test-fields-error')
                .attach('avatar', dummyFilePath)
                .attach('gallery', dummyFilePath);
            expect(response.status).toBe(500);
            const afterFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(afterFiles.length).toBe(beforeFiles.length);
        });
        it('should clean up req.file when express-validator validation fails', async () => {
            const beforeFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            const response = await request(testApp)
                .post('/test-validation-error')
                .attach('foto', dummyFilePath)
                .field('nombre', ''); // Esto disparará el error de validación
            expect(response.status).toBe(422);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            const afterFiles = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(afterFiles.length).toBe(beforeFiles.length);
        });
    });
    describe('Specific Multer/Middleware error scenarios', () => {
        it('should return 415 when MIME type is invalid', async () => {
            const txtFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'test.txt');
            fs.writeFileSync(txtFilePath, 'plain text content');
            const response = await request(testApp)
                .post('/test-single-success') // Usamos una ruta exitosa para ver si Multer lo rebota
                .attach('foto', txtFilePath);
            expect(response.status).toBe(415);
            expect(response.body.error.message).toContain('Tipo de archivo no permitido');
            const files = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(files.length).toBe(0);
            fs.unlinkSync(txtFilePath);
        });
        it('should return 413 when file size exceeds limit (2MB)', async () => {
            const largeFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'large-image.png');
            const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024); // 2.5 MB
            fs.writeFileSync(largeFilePath, largeBuffer);
            const response = await request(testApp)
                .post('/test-single-success')
                .attach('foto', largeFilePath);
            expect(response.status).toBe(413);
            expect(response.body.error.message).toContain('demasiado grande');
            const files = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(files.length).toBe(0);
            fs.unlinkSync(largeFilePath);
        });
        it('should return 400 when using incorrect field name', async () => {
            const response = await request(testApp)
                .post('/test-single-success')
                .attach('wrong_field', dummyFilePath);
            expect(response.status).toBe(400);
            expect(response.body.error.message).toContain('no es válido');
            expect(response.body.error.message).toContain('wrong_field');
            const files = fs.readdirSync(TEST_UPLOADS_DIR);
            expect(files.length).toBe(0);
        });
    });
});
