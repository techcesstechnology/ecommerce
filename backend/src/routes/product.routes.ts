import { Router } from 'express';
import { productController } from '../controllers/product.controller';

const router = Router();

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/on-sale', productController.getOnSaleProducts);
router.get('/categories', productController.getCategories);
router.get('/categories/:id', productController.getCategoryById);
router.get('/category/:slug', productController.getCategoryBySlug);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);

export default router;
