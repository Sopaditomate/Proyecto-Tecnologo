import GraficModel from "../models/GraficModel.js";

class GraficController{
      async getProductosByPrice(req, res) {
        try {
          const producto = await GraficModel.TopPrice();
          res.json(producto);
        } catch (err) {
          console.error("error al obtener los productos por precio", err);
          res.status(500).json({ error: "errpr al obtener los productos por precio" });
        }
      }
            async getProductosByRating(req, res) {
        try {
          const producto = await GraficModel.TopRating();
          res.json(producto);
        } catch (err) {
          console.error("error al obtener los productos por rating", err);
          res.status(500).json({ error: "errpr al obtener los productos por rating" });
        }
      }
         async getProductosByState(req, res) {
        try {
          const producto = await GraficModel.activeorinactive();
          res.json(producto);
        } catch (err) {
          console.error("error al obtener los productos por estado", err);
          res.status(500).json({ error: "errpr al obtener los productos por estado" });
        }
      }
}
export default new GraficController();