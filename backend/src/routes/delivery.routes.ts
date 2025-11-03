import express from 'express';
import deliveryController from '../delivery/controllers/delivery.controller';

const router = express.Router();

// Delivery routes
router.get('/', deliveryController.getAllDeliveries.bind(deliveryController));
router.get('/pending', deliveryController.getPendingDeliveries.bind(deliveryController));
router.get('/active', deliveryController.getActiveDeliveries.bind(deliveryController));
router.get('/:id', deliveryController.getDeliveryById.bind(deliveryController));
router.post('/', deliveryController.createDelivery.bind(deliveryController));
router.put('/:id/status', deliveryController.updateDeliveryStatus.bind(deliveryController));
router.post('/track', deliveryController.initializeTracking.bind(deliveryController));
router.get('/:id/tracking', deliveryController.getTrackingInfo.bind(deliveryController));

export default router;
