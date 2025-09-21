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


const EXCLUDED_FIELDS = ['ID_PRODUCTO', 'ID_TIPO_PRO', 'ID_STATE', 'IMAGEN_URL'];


const COLUMN_NAMES_ES = {
  NOMBRE_TIPO_PRO: 'Tipo de producto',
  NOMBRE_PROD: 'Nombre del producto',
  PRECIO: 'Precio ($)',
  DESCRIPCION: 'Descripción',
  NOTA_ACTUAL: 'Nota actual',
  ADVERTENCIA: 'Advertencia',
  CREATED_AT: 'Fecha de creación',
  UPDATED_AT: 'Última actualización',
};


// GET /api/export/pdf
router.get('/pdf', async (req, res) => {
  try {
    // 🔹 Filtrar solo productos activos
    const [rows] = await pool.query(
      'SELECT * FROM vw_active_product_admin WHERE ID_STATE = 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron productos activos' });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=productos_activos.pdf');
    doc.pipe(res);

    // 🔹 Agregar logo de la empresa
    // (ajusta width o posición según lo necesites)
    doc.image('public/images/logo-proyecto.jpg', 40, 20, { width: 100 });

    // 🔹 Título del reporte debajo del logo
    doc.moveDown(3); // agrega espacio debajo del logo
    doc.fontSize(20).fillColor('#333').text('Reporte de Productos Activos', { align: 'center' });
    doc.moveDown(2);

    // Filtrar y traducir columnas
    const headers = Object.keys(rows[0]).filter(h => !EXCLUDED_FIELDS.includes(h));

    const table = {
      headers: headers.map(h => COLUMN_NAMES_ES[h] || h),
      rows: rows.map(row =>
        headers.map(h => {
          if (h.toLowerCase().includes('descripcion')) {
            return truncateText(String(row[h] ?? ''), 80);
          }
          if (h.toLowerCase().includes('url') || h.toLowerCase().includes('imagen')) {
            return truncateText(String(row[h] ?? ''), 40);
          }
          return String(row[h] ?? '');
        })
      ),
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#000'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(9).fillColor('#444'),
      columnSpacing: 8,
      padding: 5,
      width: 500,
    });

    // Footer con fecha
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

// GET /api/export/excel
router.get('/excel', async (req, res) => {
  try {
    // 🔹 Filtrar solo productos activos
    const [rows] = await pool.query(
      'SELECT * FROM vw_active_product_admin WHERE ID_STATE = 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron productos activos' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Productos Activos');

    // Filtrar y traducir columnas
    const headers = Object.keys(rows[0]).filter(h => !EXCLUDED_FIELDS.includes(h));

    sheet.columns = headers.map(key => ({
      header: COLUMN_NAMES_ES[key] || key,
      key,
      width: key.toLowerCase().includes('description') ? 50 : 25,
    }));

    rows.forEach(row => {
      const filteredRow = {};
      headers.forEach(h => (filteredRow[h] = row[h]));
      sheet.addRow(filteredRow);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=productos_activos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error generando Excel:', err);
    res.status(500).json({ error: 'No se pudo exportar el Excel' });
  }
});

export default router;
