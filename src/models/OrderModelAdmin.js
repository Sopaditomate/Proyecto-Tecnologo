// models/OrderModelAdmin.js
import pool from "../config/db.js";

class OrderModelAdmin {
    // Obtener todas las órdenes activas
    //este ya esta
    async getActiveOrders() {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM vw_active_orders_admin');
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }
    //este ya esta
    // Obtener detalles de una orden por ID de usuario
    async getAllOrdersAndDetailsByUserId(userId) {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                'SELECT * FROM vw_get_all_orders_and_details_by_user WHERE id_user = ?',
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }

    async getOrderDetailsByOrderId(orderId) {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                'SELECT * FROM vw_get_order_details_by_order_id WHERE id_order = ?',
                [orderId]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }


    // Cambiar el estado de una orden utilizando un procedimiento almacenado
    async updateOrderStatus(orderId, statusId) {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                'CALL UpdateOrderStatus(?, ?)',
                [orderId, statusId]
            );

            // En procedimientos, rows[0] suele ser el primer result set.
            // No puedo usar affectedRows directamente, así que asumo éxito si no hay error.
            return true;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }

    // Obtener todos los estados de órdenes activos
    async getOrderStatus() {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                'SELECT * FROM vw_order_status'
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }
}

export default new OrderModelAdmin();
