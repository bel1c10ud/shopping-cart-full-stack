import { Router } from 'express';
import OrdersController from '../controllers/OrdersController';

export const createOrdersRouter = (ordersController: OrdersController) => {
  const productRouter = Router();

  productRouter.post('/', ordersController.postOrder);
  productRouter.get('/:orderId', ordersController.getOrderById);

  return productRouter;
};
