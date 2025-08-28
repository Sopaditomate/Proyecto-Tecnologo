import pool from "../config/db.js";

class RecetasModel {
    // Get recipe by product ID using the view
    async getReceta(id) {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT * FROM vw_active_recipe WHERE ID_RECETA = ?`,
                [id]
            );
            return rows;
        } catch (error) {
            console.error("Error al obtener la receta:", error);
            throw new Error("No se pudo obtener la receta.");
        } finally {
            conn.release();
        }
    }

    //dropdown de insumos
    async getMateria(idProduct) {
        const conn = await pool.getConnection();
        try {
            // Ejecutar el procedimiento almacenado pasándole el id_product como parámetro
            const [rows] = await conn.query(
                `CALL sp_get_recipe_material(?)`,
                [idProduct]
            );

            return rows;
        } catch (error) {
            console.error("Error al obtener los materiales:", error);
            throw new Error("No se pudo obtener los materiales.");
        } finally {
            conn.release();
        }
    }

    // Insert new recipe
    
    async addReceta(ID_PRODUCT, ID_MATERIA, CANTIDAD_USAR) {
        console.log(ID_PRODUCT, ID_MATERIA, CANTIDAD_USAR);
        if (!ID_PRODUCT || !ID_MATERIA || CANTIDAD_USAR <= 0) {
            throw new Error("Parámetros inválidos.");
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `CALL sp_insert_recipe(?, ?, ?)`,
                [ID_PRODUCT, ID_MATERIA, CANTIDAD_USAR]
            );
            console.log('exito')
            await conn.commit();
        } catch (error) {
            await conn.rollback();
            console.error("Error al insertar receta:", error);
            throw new Error("No se pudo insertar la receta.");
        } finally {
            conn.release();
        }
    }

    // Update existing recipe
    async updateReceta(id_product, id_material, CANTIDAD_USAR) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `CALL sp_update_recipe(?, ?, ?)`,
                [id_product, id_material, CANTIDAD_USAR]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            if (error.sqlState === "45000") {
                throw new Error(error.message); // 'Recipe entry not found'
            }
            console.error("Error al actualizar la receta:", error);
            throw new Error("No se pudo actualizar la receta.");
        } finally {
            conn.release();
        }
    }


    // Logical delete of a recipe
    async deleteReceta(ID_PRODUCT, ID_MATERIA) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `CALL sp_delete_recipe(?, ?)`,
                [ID_PRODUCT, ID_MATERIA]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            if (error.sqlState === "45000") {
                throw new Error(error.message); // 'Recipe entry not found'
            }
            console.error("Error al eliminar la receta:", error);
            throw new Error("No se pudo eliminar la receta.");
        } finally {
            conn.release();
        }
    }

}

export default new RecetasModel();
