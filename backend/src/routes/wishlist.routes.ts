import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/items', wishlistController.addToWishlist);
router.put('/items/:productId', wishlistController.updateWishlistItem);
router.delete('/items/:productId', wishlistController.removeFromWishlist);
router.delete('/', wishlistController.clearWishlist);
router.put('/settings', wishlistController.updateWishlistSettings);
router.get('/check/:productId', wishlistController.checkProductInWishlist);

export default router;
