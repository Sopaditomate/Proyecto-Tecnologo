import RecetaModel from "../models/RecetaModel.js";

class RecetaController {

    async getRecetas(req, res) {
        const { id } = req.params;

        try {
            const producto = await RecetaModel.getReceta(id);
            res.json(producto);
        } catch (err) {
            console.error("error al obtener receta", err);
            res.status(500).json({ message: "error al obtener receta" });
        }
    }
async UpdateRecetas(req, res) {
    const { id_product, id_material } = req.params; // Ahora obtienes ambos parámetros
    const { CANTIDAD_USAR } = req.body; // Asegúrate de que este campo esté en el cuerpo de la solicitud

    try {
        await RecetaModel.updateReceta(id_product, id_material, CANTIDAD_USAR);
        res.json({ message: "Receta actualizada correctamente" });
    } catch (err) {
        console.error("Error al actualizar la receta", err);
        res.status(500).json({ error: "Error al actualizar la receta" });
    }
}


async DeleteRecetas(req, res) {
    const { id_product, id_material } = req.params; // Obtener ambos parámetros

    try {
        await RecetaModel.deleteReceta(id_product, id_material);
        res.status(200).json({ message: "Receta eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la receta:", error);
        res.status(500).json({ error: error.message || "No se pudo eliminar la receta." });
    }
}


    async AddRecetas(req, res) {
        const ID_PRODUCTO = req.params.id;
        const { ID_MATERIA, CANTIDAD_USAR } = req.body;

        
        if (!ID_MATERIA || !CANTIDAD_USAR) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        try {
            await RecetaModel.addReceta(ID_PRODUCTO, ID_MATERIA, CANTIDAD_USAR);
            res.status(201).json({ message: "Receta agregada correctamente" });
        } catch (err) {
            console.error("Error al agregar receta", err);
            res.status(500).json({ error: "Error al agregar la receta" });
        }
    }

}
export default new RecetaController();