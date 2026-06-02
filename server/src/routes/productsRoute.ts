import { Router } from 'express';
import ProductsController from '../controllers/ProductsController';

export const createProductsRouter = (productsController: ProductsController) => {
  const productRouter = Router();

  productRouter.get('/', productsController.getProducts);
  productRouter.post('/', productsController.postProducts);
  productRouter.delete('/:productId', productsController.deleteProducts);

  return productRouter;
};
