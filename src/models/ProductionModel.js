import pool from "../config/db.js";

class ProductionModel {

    // Get all active productions
    async getActiveProductions() {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(`SELECT * FROM vw_get_active_production`);
            return rows;
        } catch (error) {
            console.error("Error getting productions:", error);
            throw new Error("Could not fetch productions.");
        } finally {
            conn.release();
        }
    }
///
    // Get production details
    async getProductionDetails(productionId) {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT * FROM vw_get_active_production_detail WHERE id_production = ?`,
                [productionId]
            );
            return rows;
        } catch (error) {
            console.error("Error getting production details:", error);
            throw new Error("Could not fetch production details.");
        } finally {
            conn.release();
        }
    }

///

    //trae productos con receta
    async getProductsWithRecipe() {
        try {
        const [resultSets] = await pool.query("CALL sp_get_products_with_recipe()");
        // mysql2 con CALL devuelve [[rows], meta] → el primer [0] son las filas
        const rows = resultSets[0] || resultSets; 

        return rows.map((product) => ({
            id_product: product.id_product,
            name: product.name,
        }));
        } catch (error) {
        console.error("Error al obtener productos con receta:", error);
        throw error;
        }
    }

    // Obtener historial de producciones
    async getProductionHistory() {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(`SELECT * FROM vw_production_history`);
            return rows;
        } catch (error) {
            console.error("Error getting production history:", error);
            throw new Error("Could not fetch production history.");
        } finally {
            conn.release();
        }
    }



    // Create new production
    async createProduction(totalProducts, idProductionStatus) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(`CALL sp_insert_production(?, ?)`, [totalProducts, idProductionStatus]);
            console.log(result); // Verifica la estructura de `result`

            await conn.commit();
            const id_production = result?.[0]?.[0]?.id_production;
            return { id_production }; //Esto garantiza que el frontend reciba el ID correctamente
        } catch (error) {
            await conn.rollback();
            console.error("Error creating production:", error);
            throw new Error("Could not create production.");
        } finally {
            conn.release();
        }
    }
///
    // Add detail to production
    async addProductionDetail(productionId, productId, quantity) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `CALL sp_insert_production_detail(?, ?, ?)`,
                [productionId, productId, quantity]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            console.error("Error adding production detail:", error);
            throw new Error("Could not add detail.");
        } finally {
            conn.release();
        }
    }
///
    // Update production status
    async updateProductionStatus(productionId, newStatus) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `CALL sp_update_production_status(?, ?)`,
                [productionId, newStatus]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            console.error("Error updating status:", error);
            throw new Error("Could not update production status.");
        } finally {
            conn.release();
        }
    }
///

    // Logical delete of a production detail
    async deleteProductionDetail(productionId, productId) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `CALL sp_delete_production_detail(?, ?)`,
                [productionId, productId]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            console.error("Error deleting detail:", error);
            throw new Error("Could not delete production detail.");
        } finally {
            conn.release();
        }
    }
    //obtener los estado de produccion
    async getAllStatuses() {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(`SELECT * FROM vw_get_production_status`);
            return rows;
        } catch (error) {
            console.error("Error fetching production statuses:", error);
            throw new Error("Could not fetch production statuses.");
        } finally {
            conn.release();
        }
    }

    // Calcular producción máxima posible de un producto
    async calculateMaxProduction(productId) {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(`CALL sp_calculate_max_production(?)`, [productId]);
            // rows[0] = primer result set (array de filas)
            return rows?.[0] ?? []; 
        } catch (error) {
            console.error("Error calculating max production:", error);
            throw new Error("Could not calculate max production.");
        } finally {
            conn.release();
        }
        }

        async validateProduction(productId, requestedQty) {
        const conn = await pool.getConnection();
        try {
            // 1) Máximo producible
            const [maxResultSets] = await conn.query(`CALL sp_calculate_max_production(?)`, [productId]);
            const maxProducible = maxResultSets?.[0]?.[0]?.max_producible ?? 0; // <-- ojo al [0][0]

            // 2) Faltantes
            const [missingResultSets] = await conn.query(`CALL sp_check_missing_materials(?, ?)`, [
            productId,
            requestedQty
            ]);

            // Algunos MySQL devuelven: [[rows], meta]; nos quedamos con el primer set
            const missingRows = Array.isArray(missingResultSets?.[0]) ? missingResultSets[0] : (missingResultSets || []);
            const missing = missingRows.filter(r => Number(r.missing ?? 0) > 0);

            return {
            maxProducible,
            canProduce: Number(requestedQty) <= Number(maxProducible),
            missing
            };
        } catch (error) {
            console.error("Error validating production:", error);
            throw new Error("Could not validate production.");
        } finally {
            conn.release();
        }
        }

        // Logical delete of a production
async deleteProduction(productionId) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            `CALL sp_delete_production(?)`,
            [productionId]
        );

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        console.error("Error deleting production:", error);
        throw new Error("Could not delete production.");
    } finally {
        conn.release();
    }
}


}

export default new ProductionModel();
