import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { server } from '../mocks/server';
import {
  createOrder,
  createOrderCoupons,
  getOrderAmountHandler,
  getOrderCouponRecommendationHandler,
  getOrderCouponsHandler,
  getOrderErrorHandler,
  getOrderHandler,
  updateOrderHandler,
} from './orderHandlers';
import { renderOrderPage } from './cartTestUtils';
import type { OrderWithProduct } from '../types';

describe('OrderPage 주문 확인', () => {
  let order: OrderWithProduct;

  beforeEach(() => {
    order = createOrder();
    server.use(getOrderHandler(order));
  });

  it('주문 확인 페이지에 진입하면 GET /order/:orderId API를 호출한다', async () => {
    const requestOrder = vi.fn();
    server.use(getOrderHandler(order, requestOrder));

    renderOrderPage();

    await waitFor(() => {
      expect(requestOrder).toHaveBeenCalledWith('order-1');
    });
  });

  it('주문 상품과 서버가 계산한 결제 금액을 표시한다', async () => {
    renderOrderPage();

    const itemA = (await screen.findByText('상품이름A')).closest('li')!;
    const itemB = screen.getByText('상품이름B').closest('li')!;

    expect(screen.getByText(/2종류/)).toBeInTheDocument();
    expect(screen.getByText(/3개/)).toBeInTheDocument();
    expect(within(itemA).getByRole('img')).toHaveAttribute('src', order.items[0].product.image);
    expect(within(itemA).getByText(/35,?000원/)).toBeInTheDocument();
    expect(within(itemA).getByText('2개')).toBeInTheDocument();
    expect(within(itemB).getByText(/25,?000원/)).toBeInTheDocument();
    expect(screen.getByText(/95,?000원/)).toBeInTheDocument();
    expect(screen.getByText(/98,?000원/)).toBeInTheDocument();
  });

  it('주문 조회에 실패하면 에러 화면을 표시한다', async () => {
    server.use(getOrderErrorHandler());

    renderOrderPage();

    expect(await screen.findByText('에러가 발생했습니다.')).toBeInTheDocument();
  });

  it('도서산간 지역 선택을 변경하면 PATCH /order/:orderId API를 호출하고 갱신된 금액을 표시한다', async () => {
    const updateOrder = vi.fn();
    server.use(
      updateOrderHandler(
        order,
        (nextOrder) => {
          order = nextOrder;
          server.use(getOrderHandler(order));
        },
        updateOrder,
      ),
    );

    renderOrderPage();

    await screen.findByText('상품이름A');

    const remoteAreaCheckbox = screen.getByRole('checkbox', { name: '제주도 및 도서 산간 지역' });
    fireEvent.click(remoteAreaCheckbox);

    await waitFor(() => {
      expect(updateOrder).toHaveBeenCalledWith({ isRemoteArea: true });
    });

    expect(await screen.findByText(/101,?000원/)).toBeInTheDocument();
  });
});

describe('OrderPage 쿠폰 적용', () => {
  let order: OrderWithProduct;

  beforeEach(() => {
    order = createOrder();
    server.use(
      getOrderHandler(order),
      getOrderCouponsHandler(createOrderCoupons()),
      getOrderAmountHandler({
        orderAmount: 95000,
        shippingAmount: 3000,
        discountAmount: 5000,
        totalAmount: 93000,
      }),
      getOrderCouponRecommendationHandler({
        couponIds: ['user-coupon-fixed', 'user-coupon-miracle'],
      }),
      updateOrderHandler(order),
    );
  });

  it('쿠폰 적용 버튼을 누르면 쿠폰 목록 API를 호출하고 쿠폰 정보를 표시한다', async () => {
    const requestCoupons = vi.fn();
    server.use(getOrderCouponsHandler(createOrderCoupons(), requestCoupons));

    renderOrderPage();

    await screen.findByText('상품이름A');
    fireEvent.click(screen.getByRole('button', { name: '쿠폰 적용' }));

    expect(await screen.findByText('쿠폰을 선택해 주세요')).toBeInTheDocument();

    await waitFor(() => {
      expect(requestCoupons).toHaveBeenCalledWith('order-1');
    });

    expect(screen.getByText('5,000원 할인 쿠폰')).toBeInTheDocument();
    expect(screen.getByText('만료일: 2026년 11월 30일')).toBeInTheDocument();
    expect(screen.getByText('최소 주문 금액: 100,000원')).toBeInTheDocument();
    expect(screen.getByText('사용 가능 시간: 오전 4시부터 오전 7시까지')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '무료 배송 쿠폰' })).toBeDisabled();
  });

  it('쿠폰을 선택하면 서버 금액 미리보기를 요청하고 할인 금액을 표시한다', async () => {
    const requestAmount = vi.fn();
    server.use(
      getOrderAmountHandler(
        {
          orderAmount: 95000,
          shippingAmount: 3000,
          discountAmount: 5000,
          totalAmount: 93000,
        },
        requestAmount,
      ),
    );

    renderOrderPage();

    await screen.findByText('상품이름A');
    fireEvent.click(screen.getByRole('button', { name: '쿠폰 적용' }));

    const fixedCoupon = await screen.findByRole('checkbox', { name: '5,000원 할인 쿠폰' });
    fireEvent.click(fixedCoupon);

    await waitFor(() => {
      expect(requestAmount).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '?couponIds=user-coupon-fixed&isRemoteArea=false',
        }),
      );
    });

    expect(await screen.findByRole('button', { name: /총 5,?000원 할인 쿠폰 사용하기/ })).toBeInTheDocument();
  });

  it('같은 타입의 쿠폰을 두 개 선택하려 하면 안내 메시지를 표시한다', async () => {
    renderOrderPage();

    await screen.findByText('상품이름A');
    fireEvent.click(screen.getByRole('button', { name: '쿠폰 적용' }));

    fireEvent.click(await screen.findByRole('checkbox', { name: '5,000원 할인 쿠폰' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '2+1 쿠폰' }));

    expect(await screen.findByText('정액 쿠폰은 1개만 사용할 수 있습니다.')).toBeInTheDocument();
  });

  it('최고 혜택 적용 버튼을 누르면 추천 쿠폰을 선택 상태로 반영한다', async () => {
    renderOrderPage();

    await screen.findByText('상품이름A');
    fireEvent.click(screen.getByRole('button', { name: '쿠폰 적용' }));

    fireEvent.click(await screen.findByRole('button', { name: '최고 혜택 적용' }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: '5,000원 할인 쿠폰' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: '30% 시간제 할인 쿠폰' })).toBeChecked();
    });
  });

  it('쿠폰 사용하기 버튼을 누르면 PATCH /order/:orderId API로 선택한 쿠폰을 적용한다', async () => {
    const updateOrder = vi.fn();
    server.use(updateOrderHandler(order, undefined, updateOrder));

    renderOrderPage();

    await screen.findByText('상품이름A');
    fireEvent.click(screen.getByRole('button', { name: '쿠폰 적용' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: '5,000원 할인 쿠폰' }));
    fireEvent.click(await screen.findByRole('button', { name: /총 5,?000원 할인 쿠폰 사용하기/ }));

    await waitFor(() => {
      expect(updateOrder).toHaveBeenCalledWith({ couponIds: ['user-coupon-fixed'] });
    });

    await waitFor(() => {
      expect(screen.queryByText('쿠폰을 선택해 주세요')).not.toBeInTheDocument();
    });
  });
});

describe('OrderPage 결제 완료', () => {
  it('결제하기 버튼을 누르면 최신 주문 정보를 조회한 뒤 결제 완료 페이지로 이동한다', async () => {
    const order = createOrder();
    const requestOrder = vi.fn();
    server.use(getOrderHandler(order, requestOrder));

    renderOrderPage();

    await screen.findByText('상품이름A');
    fireEvent.click(screen.getByRole('button', { name: '결제하기' }));

    expect(await screen.findByText('결제 확인')).toBeInTheDocument();
    expect(screen.getByText(/2종류/)).toBeInTheDocument();
    expect(screen.getByText(/3개/)).toBeInTheDocument();
    expect(screen.getByText(/98,?000원/)).toBeInTheDocument();
    expect(requestOrder).toHaveBeenCalledTimes(2);
  });
});
