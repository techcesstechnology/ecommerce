import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { formatResponse, formatError } from '../utils';
import { sendCartShareEmail } from '../utils/notification.utils';

/**
 * Get cart
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;

    const cart = await cartService.getCart(sessionId, userId);
    res.status(200).json(formatResponse(cart, 'Cart retrieved successfully'));
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json(formatError('Failed to retrieve cart', error));
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { productId, quantity } = req.body;

    const cart = await cartService.addItem(sessionId, { productId, quantity }, userId);
    res.status(200).json(formatResponse(cart, 'Item added to cart successfully'));
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json(formatError('Failed to add item to cart', error));
  }
};

/**
 * Update cart item
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateItem(sessionId, itemId, { quantity }, userId);
    res.status(200).json(formatResponse(cart, 'Cart item updated successfully'));
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(400).json(formatError('Failed to update cart item', error));
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { itemId } = req.params;

    const cart = await cartService.removeItem(sessionId, itemId, userId);
    res.status(200).json(formatResponse(cart, 'Item removed from cart successfully'));
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(400).json(formatError('Failed to remove cart item', error));
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;

    const cart = await cartService.clearCart(sessionId, userId);
    res.status(200).json(formatResponse(cart, 'Cart cleared successfully'));
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json(formatError('Failed to clear cart', error));
  }
};

/**
 * Apply discount code
 */
export const applyDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { code } = req.body;

    const cart = await cartService.applyDiscount(sessionId, { code }, userId);
    res.status(200).json(formatResponse(cart, 'Discount applied successfully'));
  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(400).json(formatError('Failed to apply discount', error));
  }
};

/**
 * Remove discount code
 */
export const removeDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;

    const cart = await cartService.removeDiscount(sessionId, userId);
    res.status(200).json(formatResponse(cart, 'Discount removed successfully'));
  } catch (error) {
    console.error('Error removing discount:', error);
    res.status(500).json(formatError('Failed to remove discount', error));
  }
};

/**
 * Get cart summary
 */
export const getCartSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;

    const summary = await cartService.getCartSummary(sessionId, userId);
    res.status(200).json(formatResponse(summary, 'Cart summary retrieved successfully'));
  } catch (error) {
    console.error('Error getting cart summary:', error);
    res.status(500).json(formatError('Failed to retrieve cart summary', error));
  }
};

/**
 * Save item for later
 */
export const saveForLater = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json(formatError('User must be logged in to save items'));
      return;
    }

    const savedItems = await cartService.saveForLater(sessionId, itemId, userId);
    res.status(200).json(formatResponse(savedItems, 'Item saved for later'));
  } catch (error) {
    console.error('Error saving item for later:', error);
    res.status(400).json(formatError('Failed to save item for later', error));
  }
};

/**
 * Get saved items
 */
export const getSavedItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json(formatError('User must be logged in'));
      return;
    }

    const savedItems = await cartService.getSavedItems(userId);
    res.status(200).json(formatResponse(savedItems, 'Saved items retrieved successfully'));
  } catch (error) {
    console.error('Error getting saved items:', error);
    res.status(500).json(formatError('Failed to retrieve saved items', error));
  }
};

/**
 * Move saved item to cart
 */
export const moveToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json(formatError('User must be logged in'));
      return;
    }

    const cart = await cartService.moveToCart(sessionId, itemId, userId);
    res.status(200).json(formatResponse(cart, 'Item moved to cart successfully'));
  } catch (error) {
    console.error('Error moving item to cart:', error);
    res.status(400).json(formatError('Failed to move item to cart', error));
  }
};

/**
 * Share cart
 */
export const shareCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'guest';
    const userId = req.headers['x-user-id'] as string;
    const { email, message } = req.body;

    const cart = await cartService.getCart(sessionId, userId);
    await sendCartShareEmail(cart, email, message);

    res.status(200).json(formatResponse({ success: true }, 'Cart shared successfully'));
  } catch (error) {
    console.error('Error sharing cart:', error);
    res.status(500).json(formatError('Failed to share cart', error));
  }
};

/**
 * Merge carts
 */
export const mergeCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestSessionId } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json(formatError('User must be logged in'));
      return;
    }

    const cart = await cartService.mergeCarts(guestSessionId, userId);
    res.status(200).json(formatResponse(cart, 'Carts merged successfully'));
  } catch (error) {
    console.error('Error merging carts:', error);
    res.status(500).json(formatError('Failed to merge carts', error));
  }
};
