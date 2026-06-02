import { Request, Response, NextFunction } from 'express';
import { ProductsServicePort } from '../types';
import { InsertProductRequestBodySchema, DeleteProductRequestParamsSchema } from './../schemas';

class ProductsController {
  private readonly service;

  constructor({ service }: { service: ProductsServicePort }) {
    this.service = service;
  }

  getProducts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.service.getProducts();

      res.status(200).json({ status: 'success', data: products });
    } catch (error) {
      next(error);
    }
  };

  postProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = InsertProductRequestBodySchema.parse(req.body);

      const product = await this.service.insertProduct(parsedBody);

      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  deleteProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedParams = DeleteProductRequestParamsSchema.parse(req.params);

      const productId = await this.service.deleteProduct(parsedParams.productId);

      res.status(200).json({ status: 'success', data: productId });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductsController;
