// routes/exportRoutes.js
import express from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import pool from '../../../../src/config/db.js';

const router = express.Router();

// GET /api/export/pdf/:productId
router.get('/pdfreceta/:productId', async (req, res) => {
  try {
    const { productId } = req.params;  // Get the product ID from the route parameter

    // Query the view and filter by product ID
    const [rows] = await pool.query(
      'SELECT * FROM vw_active_recipe WHERE ID_RECETA = ?',
      [productId]  // Pass the productId as a parameter to the query
    );

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=active_recetas.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Active receta Report', { align: 'center' }).moveDown();

    rows.forEach(row => {
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

// GET /api/export/excel/:productId
router.get('/excelreceta/:productId', async (req, res) => {
  try {
    const { productId } = req.params;  // Get the product ID from the route parameter

    // Query the view and filter by product ID
    const [rows] = await pool.query(
      'SELECT * FROM vw_active_recipe WHERE ID_RECETA = ?',
      [productId]  // Pass the productId as a parameter to the query
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Active Receta');

    sheet.columns = Object.keys(rows[0]).map(key => ({
      header: key,
      key,
      width: 20,
    }));

    rows.forEach(row => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=active_receta.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error generating Excel:', err);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

export default router;
