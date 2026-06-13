import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pdfGenerator = async (estadisticas, reporte, patience = null) => {
  // 1. Resolver rutas
  const plantillaPath = path.join(__dirname, '..', 'utils', `${reporte}.template.hbs`);
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.jpg');

  // 2. Leer archivos en paralelo (async)
  const [plantillaHtml, logoBase64] = await Promise.all([
    fs.readFile(plantillaPath, 'utf-8'),
    fs.readFile(logoPath, { encoding: 'base64' }),
  ]);
  const logoSrc = `data:image/jpeg;base64,${logoBase64}`;

  // 3. Compilar el template con Handlebars
  const template = Handlebars.compile(plantillaHtml);

  // 4. Inyectar datos
  const htmlFinal = template({
    logo: logoSrc,
    items: estadisticas,
    patience: patience,
  });

  // 5. Inicializar Puppeteer con try/finally para evitar leaks
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const pagina = await browser.newPage();

    // Asignamos el HTML compilado
    await pagina.setContent(htmlFinal, { waitUntil: 'networkidle0' });

    // 6. Generar el buffer del PDF en formato A4
    const pdfBuffer = await pagina.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};
