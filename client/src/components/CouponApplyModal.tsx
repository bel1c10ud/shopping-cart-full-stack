import { css } from '@emotion/css';
import { useState } from 'react';
import type { OrderCoupon, OrderWithProduct } from '../types';
import { formatDate, formatTime, formatWon } from '../utils';
import useUpdateOrderMutation from '../hooks/mutations/useUpdateOrderMutation';
import useOrderAmountQuery from '../hooks/queries/useOrderAmountQuery';
import useOrderCouponsQuery from '../hooks/queries/useOrderCouponsQuery';
import Button from './common/Button';
import CheckBox from './common/CheckBox';
import Flex from './common/Flex';
import Typo from './common/Typo';
import Image from './common/Image';
import ModalLayout from './modal/ModalLayout';
import { useModal } from '../hooks/useModal';
import ConfirmModal from './ConfirmModal';
import Spinner from './common/Spinner';

interface CouponApplyModalProps {
  order: OrderWithProduct;
  onConfirm: (couponIds: string[]) => void;
  onCancel: () => void;
}

export default function CouponApplyModal({ order, onConfirm, onCancel }: CouponApplyModalProps) {
  const { openModalAsync } = useModal();

  const [selectedCouponIds, setSelectedCouponIds] = useState(order.couponIds);
  const [errorMessage, setErrorMessage] = useState('');

  const couponsQuery = useOrderCouponsQuery(order.orderId);

  const updateOrder = useUpdateOrderMutation(order.orderId);

  const amountQuery = useOrderAmountQuery(order.orderId, {
    couponIds: selectedCouponIds,
    isRemoteArea: order.isRemoteArea,
  });

  const toggleCoupon = (coupon: OrderCoupon) => {
    setErrorMessage('');

    if (selectedCouponIds.includes(coupon.userCouponId)) {
      setSelectedCouponIds((prev) => prev.filter((couponId) => couponId !== coupon.userCouponId));
      return;
    }

    if (selectedCouponIds.length >= 2) {
      setErrorMessage('쿠폰은 최대 2개까지 사용할 수 있습니다.');
      return;
    }

    const selectedCoupons = coupons?.filter((coupon) => selectedCouponIds.includes(coupon.userCouponId)) ?? [];
    const hasSameTypeCoupon = selectedCoupons.some((selectedCoupon) => selectedCoupon.couponType === coupon.couponType);

    if (hasSameTypeCoupon) {
      setErrorMessage(
        coupon.couponType === 'AMOUNT'
          ? '정액 쿠폰은 1개만 사용할 수 있습니다.'
          : '정률 쿠폰은 1개만 사용할 수 있습니다.',
      );
      return;
    }

    setSelectedCouponIds((prev) =>
      prev.includes(coupon.userCouponId)
        ? prev.filter((couponId) => couponId !== coupon.userCouponId)
        : [...prev, coupon.userCouponId],
    );
  };

  const handleApply = async () => {
    const response = await updateOrder.mutateAsync({ couponIds: selectedCouponIds });

    if (response.status !== 'success') {
      setErrorMessage('쿠폰을 적용할 수 없습니다. 다시 선택해 주세요.');
      return;
    }

    onConfirm(selectedCouponIds);
  };

  const handleClose = async () => {
    if (isSameCouponIds(order.couponIds, selectedCouponIds)) {
      onCancel();
      return;
    }

    const result = await openModalAsync<boolean>(({ close, exit }) => (
      <ConfirmModal
        title="정말 닫으시겠습니까?"
        description="적용하지 않은 쿠폰 선택은 저장되지 않습니다."
        cancelText="취소"
        confirmText="닫기"
        onCancel={exit}
        onConfirm={() => close(true)}
      />
    ));

    if (result.type === 'exit') return;

    onCancel();
  };

  const coupons = couponsQuery.status === 'success' ? couponsQuery.data : null;
  const amount = amountQuery.data ? amountQuery.data : order.amount;

  return (
    <ModalLayout onClose={handleClose}>
      <Flex direction="column" gap={16}>
        <Flex alignItems="center" justifyContent="space-between">
          <Typo as="h2" weight="bold">
            쿠폰을 선택해 주세요
          </Typo>
          <Button variant="ghost" size="s" onClick={handleClose} aria-label="쿠폰 모달 닫기">
            <Image src={`${import.meta.env.BASE_URL}x.svg`} />
          </Button>
        </Flex>

        <Flex gap={4}>
          <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
          <Typo size="s">쿠폰은 최대 2개까지 사용할 수 있습니다.</Typo>
        </Flex>

        <Flex as="ul" direction="column" className={couponListStyle}>
          {couponsQuery.status === 'loading' && (
            <Typo as="li" size="s">
              쿠폰을 불러오는 중입니다.
            </Typo>
          )}

          {(couponsQuery.status === 'fail' || couponsQuery.status === 'error') && (
            <Typo as="li" size="s">
              쿠폰을 불러오지 못했습니다.
            </Typo>
          )}

          {coupons?.map((coupon) => {
            const couponInputId = `coupon-${coupon.userCouponId}`;

            const fontColor = coupon.isDisabled ? 'gray-400' : undefined;
            const checked = selectedCouponIds.includes(coupon.userCouponId);

            return (
              <Flex as="li" key={coupon.userCouponId} direction="column" gap={8} py={12}>
                <Flex alignItems="center" gap={8}>
                  <CheckBox
                    id={couponInputId}
                    checked={checked}
                    disabled={coupon.isDisabled}
                    onChange={() => toggleCoupon(coupon)}
                  />
                  <Typo as="label" htmlFor={couponInputId} weight="bold" color={fontColor}>
                    {coupon.name}
                  </Typo>
                </Flex>
                <Flex direction="column">
                  <Typo size="s" color={fontColor}>
                    만료일: {formatDate(coupon.dueDate)}
                  </Typo>
                  {coupon.minOrderAmount !== null && (
                    <Typo size="s" color={fontColor}>
                      최소 주문 금액: {formatWon(coupon.minOrderAmount)}
                    </Typo>
                  )}
                  {coupon.availableTime.startTime && coupon.availableTime.endTime && (
                    <Typo size="s" color={fontColor}>
                      사용 가능 시간: {formatTime(coupon.availableTime.startTime)}부터{' '}
                      {formatTime(coupon.availableTime.endTime)}까지
                    </Typo>
                  )}
                </Flex>
              </Flex>
            );
          })}
        </Flex>

        {errorMessage && (
          <Typo size="s" color="red-500" align="center">
            {errorMessage}
          </Typo>
        )}
        {updateOrder.error?.message && (
          <Typo size="s" color="red-500" align="center">
            {updateOrder.error?.message}
          </Typo>
        )}
        {(amountQuery.status === 'fail' || amountQuery.status === 'error') && (
          <Typo size="s" color="red-500" align="center">
            할인 금액을 계산 중 오류가 발생했습니다.
          </Typo>
        )}

        <Button variant="primary" onClick={handleApply} disabled={amountQuery.isFetching}>
          {amountQuery.isFetching ? (
            <Spinner size="s" mr={8} aria-label="할인 금액 계산 중" />
          ) : (
            `총 ${formatWon(amount.discountAmount)} 할인 쿠폰 사용하기`
          )}
        </Button>
      </Flex>
    </ModalLayout>
  );
}

const couponListStyle = css`
  & > li {
    border-top: 1px solid var(--color-gray-200);
  }
`;

function isSameCouponIds(a: string[], b: string[]) {
  if (a.length !== b.length) return false;

  return a.every((couponId) => b.includes(couponId));
}
