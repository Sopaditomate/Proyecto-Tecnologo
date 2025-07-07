// routes/exportRoutes.js
import express from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import pool from '../../../../src/config/db.js';

const router = express.Router();

// GET /api/export/pdf/inventario
router.get('/pdfinventario', async (req, res) => {
  try {
    // Traer todos los registros activos de la vista
    const [rows] = await pool.query('SELECT * FROM vw_active_inventory');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=active_inventory.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Reporte de Inventario Activo', { align: 'center' }).moveDown();

    rows.forEach((row, index) => {
      doc.fontSize(12).text(`Registro ${index + 1}`, { underline: true });
      Object.entries(row).forEach(([key, value]) => {
        doc.fontSize(10).text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// GET /api/export/excel/inventario
router.get('/excelinventario', async (req, res) => {
  try {
    // Traer todos los registros activos de la vista
    const [rows] = await pool.query('SELECT * FROM vw_active_inventory');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inventario Activo');

    if (rows.length > 0) {
      sheet.columns = Object.keys(rows[0]).map(key => ({
        header: key,
        key,
        width: 20,
      }));

      rows.forEach(row => sheet.addRow(row));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=active_inventory.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error generating Excel:', err);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

export default router;
