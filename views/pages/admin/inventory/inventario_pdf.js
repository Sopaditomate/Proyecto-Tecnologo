// routes/exportRoutes.js
import express from 'express';
import PDFDocument from 'pdfkit-table';
import ExcelJS from 'exceljs';
import pool from '../../../../src/config/db.js';

const router = express.Router();

// Función para acortar textos largos
function truncateText(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// 🔹 Campos que no se mostrarán en los reportes (quitamos todos los ids excepto inventario)
const EXCLUDED_FIELDS = ['ID_REGISTRO', 'ID_ADMINISTRADOR_NEGOCIO', 'ID_UNIDAD', 'ID_TIPO'];

// 🔹 Traducción de nombres de columnas a un formato serio y legible
const COLUMN_NAMES_ES = {
  id_inventory: 'ID inventario',
  quantity: 'Cantidad',
  raw_material: 'Materia prima',
  unit: 'Unidad',
  type: 'Tipo',
  description: 'Descripción',
  fecha_ingreso: 'Fecha de ingreso',
  fecha_actualizacion: 'Última actualización',
};

// 🔹 Función para transformar automáticamente si no existe traducción
function formatHeader(key) {
  if (!key) return '';
  const lowerKey = key.toLowerCase();
  if (COLUMN_NAMES_ES[lowerKey]) {
    return COLUMN_NAMES_ES[lowerKey];
  }
  // convierte id_registro → Id registro
  return lowerKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// GET /api/export/pdf/inventario
router.get('/pdfinventario', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_active_inventory_report');

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron registros de inventario' });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_activo.pdf');
    doc.pipe(res);

    // 🔹 Logo
    doc.image('public/images/logo-proyecto.jpg', 40, 20, { width: 100 });

    // 🔹 Título
    doc.moveDown(3);
    doc.fontSize(20).fillColor('#333').text('Reporte de Inventario Activo', { align: 'center' });
    doc.moveDown(2);

    // 🔹 Filtrar y traducir columnas
    const headers = Object.keys(rows[0]).filter(h => !EXCLUDED_FIELDS.includes(h));

    // Agregar numeración como primera columna
    const table = {
      headers: ['N°', ...headers.map(h => formatHeader(h))],
      rows: rows.map((row, idx) => [
        String(idx + 1), // numeración
        ...headers.map(h => {
          if (h.toLowerCase().includes('descripcion') || h.toLowerCase().includes('nota')) {
            return truncateText(String(row[h] ?? ''), 80);
          }
          return String(row[h] ?? '');
        }),
      ]),
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#000'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(9).fillColor('#444'),
      columnSpacing: 8,
      padding: 5,
      width: 500,
    });

    // 🔹 Footer con fecha
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#666').text(`Reporte generado el: ${new Date().toLocaleString()}`, {
      align: 'right',
    });

    doc.end();
  } catch (err) {
    console.error('❌ Error generando PDF:', err);
    res.status(500).json({ error: 'No se pudo exportar el PDF' });
  }
});

// GET /api/export/excel/inventario
router.get('/excelinventario', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_active_inventory');

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron registros de inventario' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inventario Activo');

    // 🔹 Filtrar y traducir columnas
    const headers = Object.keys(rows[0]).filter(h => !EXCLUDED_FIELDS.includes(h));

    // Configurar columnas con numeración incluida
    sheet.columns = [
      { header: 'N°', key: 'numero', width: 5 },
      ...headers.map(key => ({
        header: formatHeader(key),
        key,
        width: key.toLowerCase().includes('descripcion') ? 50 : 25,
      })),
    ];

    rows.forEach((row, idx) => {
      const filteredRow = { numero: idx + 1 }; // numeración
      headers.forEach(h => (filteredRow[h] = row[h]));
      sheet.addRow(filteredRow);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_activo.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error generando Excel:', err);
    res.status(500).json({ error: 'No se pudo exportar el Excel' });
  }
});

export default router;