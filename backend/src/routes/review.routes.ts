import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/product/:productId', reviewController.getReviewsByProduct);
router.get('/product/:productId/summary', reviewController.getProductRatingSummary);
router.get('/user', authenticate, reviewController.getReviewsByUser);
router.get('/:id', reviewController.getReviewById);
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markHelpful);

export default router;
