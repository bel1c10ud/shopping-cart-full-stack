import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import {
  CartItemNotFoundError,
  CouponNotFoundError,
  CouponTypeLimitError,
  CouponUnavailableError,
  OrderNotFoundError,
  ProductAlreadyInCartError,
  ProductNotFoundError,
} from '../errors';

const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    const data = error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = [...issue.path].reverse().find((path) => typeof path === 'string');

      if (typeof key === 'string' && acc[key] === undefined) {
        acc[key] = issue.message;
      }

      return acc;
    }, {});

    res.status(400).json({ status: 'fail', data });
    return;
  }

  if (error instanceof ProductNotFoundError) {
    res.status(404).json({
      status: 'fail',
      data: { productId: '존재하지 않는 상품입니다.' },
    });
    return;
  }

  if (error instanceof CartItemNotFoundError) {
    res.status(404).json({
      status: 'fail',
      data: { cartItemId: '존재하지 않는 장바구니 항목입니다.' },
    });
    return;
  }

  if (error instanceof OrderNotFoundError) {
    res.status(404).json({
      status: 'fail',
      data: { orderId: '존재하지 않는 주문입니다.' },
    });
    return;
  }

  if (error instanceof CouponNotFoundError) {
    res.status(404).json({
      status: 'fail',
      data: { couponId: '존재하지 않는 쿠폰입니다.' },
    });
    return;
  }

  if (error instanceof ProductAlreadyInCartError) {
    res.status(400).json({
      status: 'fail',
      data: { productId: '이미 장바구니에 담긴 상품입니다.' },
    });
    return;
  }

  if (error instanceof CouponUnavailableError || error instanceof CouponTypeLimitError) {
    res.status(400).json({
      status: 'fail',
      data: { couponId: '사용할 수 없는 쿠폰입니다.' },
    });
    return;
  }

  console.error(error);

  res.status(500).json({ status: 'error', message: '서버 에러가 발생했습니다.' });
};

export default errorHandler;
