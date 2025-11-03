import express from 'express';
import driverController from '../delivery/controllers/driver.controller';

const router = express.Router();

// Driver routes - Order matters! Specific routes before parameterized routes
router.get('/routes', driverController.getOptimizedRoutes.bind(driverController));
router.put('/location', driverController.updateDriverLocation.bind(driverController));
router.post('/assign', driverController.assignDriver.bind(driverController));
router.get('/', driverController.getAllDrivers.bind(driverController));
router.get('/:id', driverController.getDriverById.bind(driverController));
router.post('/', driverController.createDriver.bind(driverController));
router.put('/:id', driverController.updateDriver.bind(driverController));
router.get('/:id/deliveries', driverController.getDriverDeliveries.bind(driverController));

export default router;
