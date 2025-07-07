import InventoryModel from '../models/InventoryModel.js';

class InventoryController {
  async getInventario(req, res) {
    try {
      const inventory = await InventoryModel.getInventory();
      res.json(inventory);
    } catch (err) {
      console.error('Error al obtener inventario:', err);
      res.status(500).json({ message: 'Error al obtener inventario' });
    }
  }

  //Controlador General

  async updateInventario(req, res) {
    const { id } = req.params;
    const { nombre, id_tipo_materia, id_unidad, cantidad, descripcion } = req.body; // Agregar descripcion

    if (!nombre || !id_tipo_materia || !id_unidad || !cantidad || !descripcion) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    try {
        await InventoryModel.updateRawMaterial(id, nombre, id_tipo_materia, id_unidad, descripcion); // Pasar descripcion
        await InventoryModel.updateQuantity(id, cantidad);
        res.json({ message: 'Insumo actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar insumo:', err);
        res.status(500).json({ message: 'Error al actualizar insumo' });
    }
  }

  async updateCantidad(req, res) {
    const { id } = req.params;
    const { cantidad } = req.body;

    try {
      await InventoryModel.updateQuantity(id, cantidad);
      res.json({ message: 'Cantidad actualizada correctamente' });
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      res.status(500).json({ message: 'Error al actualizar cantidad' });
    }
  }

  async updateMateriaPrimaPorInventario(req, res) {
    const { id } = req.params;
    const { nombre, id_tipo_materia, id_unidad, descripcion } = req.body; // Agregar descripcion

    try {
      await InventoryModel.updateRawMaterial(id, nombre, id_tipo_materia, id_unidad, descripcion); // Pasar descripcion
      res.json({ message: 'Materia prima actualizada correctamente' });
    } catch (err) {
      console.error('Error al actualizar materia prima:', err);
      res.status(500).json({ message: 'Error al actualizar materia prima' });
    }
  }

  async deleteInventario(req, res) {
    const { id } = req.params;

    try {
      await InventoryModel.deleteInventory(id);
      res.json({ message: 'Inventario eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar inventario:', err);
      res.status(500).json({ message: 'Error al eliminar inventario' });
    }
  }

  async getTiposMateria(req, res) {
    try {
      const tiposMateria = await InventoryModel.getRawMaterialTypes();
      res.json(tiposMateria);
    } catch (err) {
      console.error('Error al obtener tipos de materia:', err);
      res.status(500).json({ message: 'Error al obtener tipos de materia' });
    }
  }

  async getUnidades(req, res) {
    try {
      const unidades = await InventoryModel.getUnits();
      res.json(unidades);
    } catch (err) {
      console.error('Error al obtener unidades:', err);
      res.status(500).json({ message: 'Error al obtener unidades' });
    }
  }

  async agregarNuevoInsumo(req, res) {
    const { nombre, tipoMateria, unidad, cantidad, descripcion, idAdministrador } = req.body;

    if (!nombre || !tipoMateria || !unidad || !cantidad || !idAdministrador) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    try {
      await InventoryModel.addNewRawMaterial(nombre, tipoMateria, unidad, cantidad, descripcion, idAdministrador);
      res.status(201).json({ message: "Nuevo insumo agregado correctamente" });
    } catch (error) {
      console.error("Error al agregar nuevo insumo:", error);
      res.status(500).json({ message: "Error al agregar nuevo insumo" });
    }
  }

  async getHistorialInventario(req, res) {
    try {
      const historial = await InventoryModel.getInventoryHistory();
      res.status(200).json(historial);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ message: 'Error al obtener historial del inventario' });
    }
  }

  async getResumenInventario(req, res) {
    try {
      const resumen = await InventoryModel.getInventorySummary();
      res.status(200).json(resumen);
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({ message: 'Error al obtener resumen del inventario' });
    }
  }


  async getInventoryByUnit(req, res) {

    const { id } = req.params;
    //para probar
    console.log(id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'El parámetro debe ser un número válido.' });
    }

    try {
      const inventoryUnit = await InventoryModel.getInventoryByUnitType(Number(id));
      res.status(200).json(inventoryUnit);
    } catch (error) {
      console.error('Error al obtener el inventario por unidad:', error);
      res.status(500).json({ message: 'Error al obtener el inventario por unidad.' });
    }
  }

}

export default new InventoryController();