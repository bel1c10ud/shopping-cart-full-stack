import { Request, Response, NextFunction } from 'express';
import { OrdersServicePort } from '../types';
import {
  GetOrderRequestParamsSchema,
  InsertOrderRequestBodySchema,
  UpdateOrderRequestBodySchema,
  UpdateOrderRequestParamsSchema,
} from '../schemas';

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

  postOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = InsertOrderRequestBodySchema.parse(req.body);
      const order = await this.service.insertOrder(parsedBody.items);

      res.status(201).json({ status: 'success', data: order });
    } catch (error) {
      next(error);
    }
  };

  patchOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = UpdateOrderRequestParamsSchema.parse(req.params);
      const parsedBody = UpdateOrderRequestBodySchema.parse(req.body);
      const order = await this.service.patchOrder(parsedParams.orderId, parsedBody);

      res.status(200).json({ status: 'success', data: order });
    } catch (error) {
      next(error);
    }
  };
}

export default OrdersController;
