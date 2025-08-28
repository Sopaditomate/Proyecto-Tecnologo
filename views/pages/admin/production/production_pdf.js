// routes/exportProductionRoutes.js
import express from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import pool from '../../../../src/config/db.js';

const router = express.Router();

// 📌 GET /api/export/pdf/produccion
router.get('/pdfproduction', async (req, res) => {
  try {
    // Traer los registros de la vista vw_production_report
    const [rows] = await pool.query('SELECT * FROM vw_production_report');

    // Agrupar por id_produccion
    const producciones = {};
    rows.forEach(row => {
      const {
        id_produccion,
        fecha_inicio,
        fecha_fin,
        total_productos,
        id_producto,
        nombre_producto,
        cantidad_planeada
      } = row;

      if (!producciones[id_produccion]) {
        producciones[id_produccion] = {
          id_produccion,
          fecha_inicio,
          fecha_fin,
          total_productos,
          detalles: []
        };
      }

      producciones[id_produccion].detalles.push({
        id_producto,
        nombre_producto,
        cantidad_planeada
      });
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte_produccion.pdf'
    );
    doc.pipe(res);

    // Título general
    doc.fontSize(18).text('Reporte de Producción', { align: 'center' }).moveDown(2);

    // Recorrer producciones agrupadas
    Object.values(producciones).forEach((prod, index) => {
      // Encabezado de producción con numeración simple
      doc.fontSize(14).text(`Producción ${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      // Datos generales
      doc.fontSize(10).text(`ID Producción: ${prod.id_produccion}`);
      doc.fontSize(10).text(`Fecha inicio: ${prod.fecha_inicio}`);
      doc.fontSize(10).text(`Fecha fin: ${prod.fecha_fin || 'En curso'}`);
      doc.fontSize(10).text(`Total productos: ${prod.total_productos}`).moveDown(0.5);

      // Detalles de productos
      doc.fontSize(12).text('Detalles:', { underline: true });
      prod.detalles.forEach(det => {
        doc.fontSize(10).text(
          `- [${det.id_producto}] ${det.nombre_producto} | Cantidad: ${det.cantidad_planeada}`
        );
      });

      // Separador visual entre producciones
      doc.moveDown();
      doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('❌ Error generando PDF de producción:', err);
    res.status(500).json({ error: 'Error al exportar PDF de producción' });
  }
});


// 📌 GET /api/export/excel/produccion
router.get('/excelproduction', async (req, res) => {
  try {
    // Traer los registros de la vista vw_production_report
    const [rows] = await pool.query('SELECT * FROM vw_production_report');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Producción');

    if (rows.length > 0) {
      // Definir columnas con los nombres de la vista
      sheet.columns = Object.keys(rows[0]).map(key => ({
        header: key, // Encabezado con alias en español
        key,
        width: 25,
      }));

      // Agregar filas
      rows.forEach(row => sheet.addRow(row));
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte_produccion.xlsx'
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error generando Excel de producción:', err);
    res.status(500).json({ error: 'Error al exportar Excel de producción' });
  }
});

export default router;
