import RecetaModel from "../models/RecetaModel.js";

class RecetaController {

    async getRecetas(req, res) {
        const { id } = req.params;

        try {
            const producto = await RecetaModel.GetReceta(id);
            res.json(producto);
        } catch (err) {
            console.error("error al obtener receta", err);
            res.status(500).json({ message: "error al obtener receta" });
        }
    }
    async UpdateRecetas(req, res) {
        const { id } = req.params;
        const { ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR } = req.body;
        try {
            await RecetaModel.UpdateReceta(id, ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR);
            res.json({ message: "receta actualizada correctamente" });
        } catch (err) {
            console.error("error al actualizar la receta", err);
            res.status(500).json({ error: "error al actualizar la receta" });
        }
    }
    async DeleteRecetas(req, res) {
        const { id } = req.params;
        try {
            await RecetaModel.DeleteReceta(id);
            res.json({ message: "receta eliminada correctamente" });
        } catch (err) {
            console.error("error al eliminar la receta", err);
            res.status(500).json({ error: "error al eliminar la receta" });
        }
    }

    async AddRecetas(req, res) {
        const ID_PRODUCTO = req.params.id;
        const { ID_MATERIA, CANTIDAD_USAR } = req.body;

        
        if (!ID_MATERIA || !CANTIDAD_USAR) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        try {
            await RecetaModel.AddReceta(ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR);
            res.status(201).json({ message: "Receta agregada correctamente" });
        } catch (err) {
            console.error("Error al agregar receta", err);
            res.status(500).json({ error: "Error al agregar la receta" });
        }
    }

}
export default new RecetaController();