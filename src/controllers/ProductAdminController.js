import ProductAdminModel from "../models/ProducAdminModel.js";
class ProductAdminController {

    async getProductos(req, res) {
        try {
            const producto = await ProductAdminModel.getProduct();
            res.json(producto);

        } catch (err) {
            console.error('error al obtener los productos', err);
            res.status(500).json({ error: "errpr al obtener los productos" });
        }
    }

    async UpdateProductos(req, res) {
        const { id } = req.params;
        const { ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA } = req.body;
        try {
            await ProductAdminModel.UpdateProduct(id, ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA);
            res.json({ message: "producto actualizado correctamente" });

        } catch (err) {
            console.error("no se pudo actualizar el producto", err);
            res.status(500).json({ error: "error al actualizar el producto" });
        }
    }

    async DeleteProductos(req,res){
        const {id} = req.params;
        
        try{
            await ProductAdminModel.DeleteProduct(id);
            res.json({message:"producto eliminado correctamente"});
        }catch(err){
            console.error("error al eliminar el producto",err)
            res.status(500).json({error:"error al eliminar el producto"})
        }
    }
    async AddProductos (req,res){
        const {ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA} = req.body;
        try{
            await ProductAdminModel.AddProduct(ID_TIPO_PRO, NOMBRE, PRECIO, DESCRIPCION, IMAGEN_URL, NOTA_ACTUAL, ADVERTENCIA);
            res.status(201).json({message:"producto agregado correctamente"});
        }catch(err){
            console.error("error al agregar producto",err)
            res.status(500).json({error:"error al agregar el producto"})
        }
    }

    async AddProductosToCart (req,res){
        const {id_catalog, id_product, discount} = req.body;
        try{
            await ProductAdminModel.addProductToCart(id_catalog, id_product, discount);
            res.status(201).json({message:"producto agregado correctamente"});
        }catch(err){
            console.error("error al agregar producto",err)
            res.status(500).json({error:"error al agregar el producto"})
        }
    }


}
export default new ProductAdminController();