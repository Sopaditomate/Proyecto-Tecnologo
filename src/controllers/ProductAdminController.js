import ProductAdminModel from "../models/ProducAdminModel.js";
import csv from 'csv-parser';
import { Readable } from 'stream';
class ProductAdminController {
  async getProductos(req, res) {
    try {
      const producto = await ProductAdminModel.getProduct();
      res.json(producto);
    } catch (err) {
      console.error("error al obtener los productos", err);
      res.status(500).json({ error: "errpr al obtener los productos" });
    }
  }

  async UpdateProductos(req, res) {
    const { id } = req.params;
    const {
      ID_TIPO_PRO,
      NOMBRE,
      PRECIO,
      DESCRIPCION,
      IMAGEN_URL,
      NOTA_ACTUAL,
      ADVERTENCIA,
    } = req.body;
    try {
      await ProductAdminModel.UpdateProduct(
        id,
        ID_TIPO_PRO,
        NOMBRE,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA
      );
      res.json({ message: "producto actualizado correctamente" });
    } catch (err) {
      console.error("no se pudo actualizar el producto", err);
      res.status(500).json({ error: "error al actualizar el producto" });
    }
  }

  async DeleteProductos(req, res) {
    const { id } = req.params;

    try {
      await ProductAdminModel.DeleteProduct(id);
      res.json({ message: "producto eliminado correctamente" });
    } catch (err) {
      console.error("error al eliminar el producto", err);
      res.status(500).json({ error: "error al eliminar el producto" });
    }
  }
  async AddProductos(req, res) {
    const {
      ID_TIPO_PRO,
      NOMBRE,
      PRECIO,
      DESCRIPCION,
      IMAGEN_URL,
      NOTA_ACTUAL,
      ADVERTENCIA,
      ID_CATALOGO
    } = req.body;
    try {
      await ProductAdminModel.AddProduct(
        ID_TIPO_PRO,
        NOMBRE,
        PRECIO,
        DESCRIPCION,
        IMAGEN_URL,
        NOTA_ACTUAL,
        ADVERTENCIA,
        ID_CATALOGO
      );
      res.status(201).json({ message: "producto agregado correctamente" });
    } catch (err) {
      console.error("error al agregar producto", err);
      res.status(500).json({ error: "error al agregar el producto" });
    }
  }

  async AddProductosToCart(req, res) {
    const { id_catalog, id_product, discount } = req.body;
    try {
      await ProductAdminModel.addProductToCart(
        id_catalog,
        id_product,
        discount
      );
      res.status(201).json({ message: "producto agregado correctamente" });
    } catch (err) {
      console.error("error al agregar producto", err);
      res.status(500).json({ error: "error al agregar el producto" });
    }
  }
  async ActivateProducto(req, res) {
    const { id } = req.params;
    try {
      await ProductAdminModel.ActivateProduct(id);
      res.json({ message: "Producto activado correctamente" });
    } catch (err) {
      console.error("Error al activar el producto", err);
      res.status(500).json({ error: "Error al activar el producto" });
    }
  }
  async CargarMasivaProductos(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ningún archivo.' });
      }

      const buffer = req.file.buffer;
      const registros = [];

      const contenido = buffer.toString('utf8');
      const stream = Readable.from(contenido);

      stream
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          registros.push(row);
        })
        .on('end', async () => {
          try {
            await ProductAdminModel.cargarMasivaDesdeCSV(registros);
            res.status(200).json({
              message: 'Carga masiva completada con éxito.',
              registrosProcesados: registros.length
            });
          } catch (modelError) {
            console.error('Error al guardar en BD:', modelError);
            res.status(500).json({ message: 'Error al guardar los registros en la base de datos.' });
          }
        })
        .on('error', (parseError) => {
          console.error('Error al leer CSV:', parseError);
          res.status(500).json({ message: 'Error al procesar el archivo CSV.' });
        });

    } catch (err) {
      console.error('Error general en la carga masiva:', err);
      res.status(500).json({ message: 'Error en la carga masiva del inventario.' });
    }
  }

}
export default new ProductAdminController();
