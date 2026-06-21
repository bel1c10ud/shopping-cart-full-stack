import { Request, Response, NextFunction } from 'express';
import { OrdersServicePort } from '../types';
import {
  GetOrderAmountRequestParamsSchema,
  GetOrderAmountRequestQuerySchema,
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

  getOrderAmount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = GetOrderAmountRequestParamsSchema.parse(req.params);
      const parsedQuery = GetOrderAmountRequestQuerySchema.parse(req.query);
      const amount = await this.service.getOrderAmount(parsedParams.orderId, parsedQuery);

      res.status(200).json({ status: 'success', data: amount });
    } catch (error) {
      next(error);
    }
  };

  getOrderCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = GetOrderRequestParamsSchema.parse(req.params);
      const coupons = await this.service.getOrderCoupons(parsedParams.orderId);

      res.status(200).json({ status: 'success', data: coupons });
    } catch (error) {
      next(error);
    }
  };

  getOrderCouponRecommendation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = GetOrderRequestParamsSchema.parse(req.params);
      const recommendation = await this.service.getOrderCouponRecommendation(parsedParams.orderId);

      res.status(200).json({ status: 'success', data: recommendation });
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
