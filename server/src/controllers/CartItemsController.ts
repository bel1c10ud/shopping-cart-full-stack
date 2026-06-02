import { Request, Response, NextFunction } from 'express';
import { CartItemsServicePort } from '../types';
import {
  InsertCartItemBodySchema,
  UpdateCartItemRequestParamsSchema,
  UpdateCartItemRequestBodySchema,
  DeleteCartItemRequestParamsSchema,
} from '../schemas';

class CartItemsController {
  private readonly service;

  constructor({ service }: { service: CartItemsServicePort }) {
    this.service = service;
  }

  getCartItems = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cartItems = await this.service.getCartItems();

      res.status(200).json({ status: 'success', data: cartItems });
    } catch (error) {
      next(error);
    }
  };

  postCartItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = InsertCartItemBodySchema.parse(req.body);

      const cartItem = await this.service.insertCartItem(parsedBody);

      res.status(201).json({ status: 'success', data: cartItem });
    } catch (error) {
      next(error);
    }
  };

  patchCartItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = UpdateCartItemRequestParamsSchema.parse(req.params);
      const parsedBody = UpdateCartItemRequestBodySchema.parse(req.body);

      const cartItem = await this.service.patchCartItem(parsedParams.cartItemId, parsedBody);

      res.status(200).json({ status: 'success', data: cartItem });
    } catch (error) {
      next(error);
    }
  };

  deleteCartItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = DeleteCartItemRequestParamsSchema.parse(req.params);

      const cartItemId = await this.service.deleteCartItem(parsedParams.cartItemId);

      res.status(200).json({ status: 'success', data: cartItemId });
    } catch (error) {
      next(error);
    }
  };
}

export default CartItemsController;
