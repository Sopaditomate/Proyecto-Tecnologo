import express from 'express';
import OrderControllerAdmin from '../controllers/OrderControllerAdmin.js';

const router = express.Router();

// Obtener todas las órdenes activas
router.get('/active-orders', OrderControllerAdmin.getActiveOrders);
router.get('/orders/user/:userId(\\d+)', OrderControllerAdmin.getAllOrdersAndDetailsByUserId);
router.get('/orders/:orderId(\\d+)', OrderControllerAdmin.getOrderDetailsByOrderId);



router.get('/order-status', OrderControllerAdmin.getOrderStatus);

router.put('/orders/update-status', OrderControllerAdmin.updateOrderStatus);

export default router;