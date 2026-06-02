import { Router } from 'express';
import CartItemsController from '../controllers/CartItemsController';

export const createCartItemsRouter = (cartItemsController: CartItemsController) => {
  const cartItemsRouter = Router();

  cartItemsRouter.get('/', cartItemsController.getCartItems);
  cartItemsRouter.post('/', cartItemsController.postCartItems);
  cartItemsRouter.patch('/:cartItemId', cartItemsController.patchCartItems);
  cartItemsRouter.delete('/:cartItemId', cartItemsController.deleteCartItems);

  return cartItemsRouter;
};
