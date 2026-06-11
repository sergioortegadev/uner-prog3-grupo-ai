import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pdfGenerator = async (estadisticas, reporte, patience = null) => {
  // 1. Resolver la ruta de la plantilla .hbs
  // Subimos un nivel ('..') para salir de 'helpers' e ingresamos a 'utils/template.hbs'
  const plantillaPath = path.join(__dirname, '..', 'utils', `${reporte}.template.hbs`);
  const plantillaHtml = fs.readFileSync(plantillaPath, 'utf-8');

  // 2. Resolver y convertir el logo a Base64
  // Subimos un nivel ('..') para salir de 'helpers' e ingresamos a 'assets/logo.jpg'
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.jpg');
  const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
  const logoSrc = `data:image/jpeg;base64,${logoBase64}`;

  // 3. Compilar el template con Handlebars
  const template = Handlebars.compile(plantillaHtml);

  // 4. Inyectar los datos de la DB y el logo al template
  const htmlFinal = template({
    logo: logoSrc,
    items: estadisticas,
    patience: patience,
  });

  // 5. Inicializar Puppeteer para renderizar el HTML a PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const pagina = await browser.newPage();

  // Asignamos el HTML compilado
  await pagina.setContent(htmlFinal, { waitUntil: 'networkidle0' });

  // 6. Generar el buffer del PDF en formato A4
  const pdfBuffer = await pagina.pdf({
    format: 'A4',
    printBackground: true, // Obligatorio para pintar los fondos #2b37fb y #3f3f3f
    margin: {
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
    },
  });

  return await pdfBuffer;
};
