import ProductionModel from "../models/ProductionModel.js";

class ProductionController {

    // GET /api/production/:id - Obtener detalles de una producción
    async getProductionDetails(req, res) {
        const { id } = req.params;

        try {
            const details = await ProductionModel.getProductionDetails(id);

            if (details.length === 0) {
                return res.status(404).json({ message: "No production details found" });
            }

            res.json(details);
        } catch (error) {
            console.error("Error getting production details:", error);
            res.status(500).json({ message: "Error retrieving production details" });
        }
    }

    // GET /api/production - Obtener lista de producciones activas
    async getActiveProductions(req, res) {
        try {
            const productions = await ProductionModel.getActiveProductions();
            res.json(productions);
        } catch (error) {
            console.error("Error getting productions:", error);
            res.status(500).json({ message: "Error retrieving productions" });
        }
    }

    // POST /api/production - Crear nueva producción
    async createProduction(req, res) {
        const { total_products, id_production_status } = req.body;

        if (!total_products || !id_production_status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        try {
            const result = await ProductionModel.createProduction(total_products, id_production_status);
            res.status(201).json({ message: "Production created successfully", data: result });
        } catch (error) {
            console.error("Error creating production:", error);
            res.status(500).json({ message: "Could not create production" });
        }
    }

    // POST /api/production/:id/add-detail - Agregar detalle a una producción
    async addProductionDetail(req, res) {
        const { id } = req.params;
        console.log(id);
        const { id_product, planned_quantity } = req.body;
        console.log(req.body);
        if (!id_product || !planned_quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        try {
            await ProductionModel.addProductionDetail(id, id_product, planned_quantity);
            res.status(201).json({ message: "Detail added successfully" });
        } catch (error) {
            console.error("Error adding detail:", error);
            res.status(500).json({ message: "Could not add detail" });
        }
    }

    // PUT /api/production/:id/change-status - Cambiar el estado de la producción
    async updateProductionStatus(req, res) {
        const { id } = req.params;
        const new_status = req.body;

        if (!new_status) {
            return res.status(400).json({ error: "Missing status value" });
        }

        try {
            await ProductionModel.updateProductionStatus(id, new_status.id_production_status);
            res.json({ message: "Production status updated successfully" });
        } catch (error) {
            console.error("Error updating status:", error);
            res.status(500).json({ message: "Could not update production status" });
        }
    }

    // DELETE /api/production/:id/detail/:productId - Eliminar detalle (borrado lógico)
    async deleteProductionDetail(req, res) {
        const { id, productId } = req.params;

        try {
            await ProductionModel.deleteProductionDetail(id, productId);
            res.json({ message: "Production detail deleted successfully" });
        } catch (error) {
            console.error("Error deleting detail:", error);
            res.status(500).json({ message: error.message || "Could not delete detail" });
        }
    }

    // Obtener todos los estados de producción activos
    async getAllStatuses(req, res) {
        try {
            const statuses = await ProductionModel.getAllStatuses();
            res.json(statuses);
        } catch (error) {
            console.error("Error retrieving production statuses:", error);
            res.status(500).json({ message: "Error retrieving production statuses" });
        }
    }

}

export default new ProductionController();
