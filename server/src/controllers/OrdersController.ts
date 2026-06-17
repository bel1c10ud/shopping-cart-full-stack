import { Request, Response, NextFunction } from 'express';
import { OrdersServicePort } from '../types';
import { GetOrderRequestParamsSchema } from '../schemas';

class OrdersController {
  private readonly service;

  constructor({ service }: { service: OrdersServicePort }) {
    this.service = service;
  }

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = GetOrderRequestParamsSchema.parse(req.params);
      const order = await this.service.getOrderById(parsedParams.orderId);

      res.status(200).json({ status: 'success', data: order });
    } catch (error) {
      next(error);
    }
  };
}

export default OrdersController;
