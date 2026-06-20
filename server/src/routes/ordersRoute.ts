import { Router } from 'express';
import OrdersController from '../controllers/OrdersController';

export const createOrdersRouter = (ordersController: OrdersController) => {
  const productRouter = Router();

  productRouter.post('/', ordersController.postOrder);
  productRouter.get('/:orderId/amount', ordersController.getOrderAmount);
  productRouter.get('/:orderId', ordersController.getOrderById);
  productRouter.patch('/:orderId', ordersController.patchOrder);

  return productRouter;
};
