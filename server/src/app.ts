import express from 'express';
import cors from 'cors';
import ProductsController from './controllers/ProductsController';
import CartItemsController from './controllers/CartItemsController';
import InMemoryProductsRepository from './repositories/InMemoryProductsRepository';
import InMemoryCartItemsRepository from './repositories/InMemoryCartItemsRepository';
import ProductsService from './services/ProductsService';
import CartItemsService from './services/CartItemsService';
import { createProductsRouter } from './routes/productsRoute';
import { createCartItemsRouter } from './routes/cartItemsRoute';
import errorHandler from './middlewares/errorHandler';
import InMemoryOrdersRepository from './repositories/InMemoryOrdersRepository';
import OrdersService from './services/OrdersService';
import OrdersController from './controllers/OrdersController';
import { createOrdersRouter } from './routes/ordersRoute';

const app = express();

app.use(cors());
app.use(express.json());

const inMemoryProductsRepository = new InMemoryProductsRepository();
const inMemoryCartItemsRepository = new InMemoryCartItemsRepository();
const inMemoryOrdersRepository = new InMemoryOrdersRepository();

const productsService = new ProductsService({
  productsRepository: inMemoryProductsRepository,
  cartItemsRepository: inMemoryCartItemsRepository,
});

const cartItemsService = new CartItemsService({
  productsRepository: inMemoryProductsRepository,
  cartItemsRepository: inMemoryCartItemsRepository,
});

const ordersService = new OrdersService({
  productsRepository: inMemoryProductsRepository,
  ordersRepository: inMemoryOrdersRepository,
});

const productsController = new ProductsController({ service: productsService });
const cartItemsController = new CartItemsController({ service: cartItemsService });
const ordersController = new OrdersController({ service: ordersService });

app.use('/products', createProductsRouter(productsController));
app.use('/cart', createCartItemsRouter(cartItemsController));
app.use('/order', createOrdersRouter(ordersController));

app.use(errorHandler);

export default app;
