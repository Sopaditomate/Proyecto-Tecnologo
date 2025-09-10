import pool from "../config/db.js";

class GraficsModel {



    async TopPrice() {
            const conn = await pool.getConnection();
        try {
            const [rows] = await pool.query("SELECT * FROM vw_top_product_price ");
            return rows;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("No se pudo obtener los productos por precio.");
        } finally {
            conn.release();
        }
    }

    async TopRating() {
            const conn = await pool.getConnection();
        try {
            const [rows] = await pool.query("SELECT * FROM vw_top_product_rating ");
            return rows;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("No se pudo obtener los productos por precio.");
        } finally {
            conn.release();
        }
    }
     async activeorinactive() {
            const conn = await pool.getConnection();
        try {
            const [rows] = await pool.query("SELECT * FROM vw_top_product_state ");
            return rows;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("No se pudo obtener los productos por estado.");
        } finally {
            conn.release();
        }
    }
}
export default new GraficsModel();