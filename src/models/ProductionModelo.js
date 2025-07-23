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

    // Create new production
    async createProduction(totalProducts, idProductionStatus) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(
                `CALL sp_insert_production(?, ?)`,
                [totalProducts, idProductionStatus]
            );

            await conn.commit();
            return result;
        } catch (error) {
            await conn.rollback();
            console.error("Error creating production:", error);
            throw new Error("Could not create production.");
        } finally {
            conn.release();
        }
    }

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

}

export default new ProductionModel();
