import type { OrderCoupon } from '../types';
import { formatDate, formatTime, formatWon } from '../utils';
import CheckBox from './common/CheckBox';
import Flex from './common/Flex';
import Typo from './common/Typo';

interface CouponListItemProps {
  coupon: OrderCoupon;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

export default function CouponListItem({ coupon, checked, disabled, onChange }: CouponListItemProps) {
  const couponInputId = `coupon-${coupon.userCouponId}`;
  const fontColor = coupon.isDisabled ? 'gray-400' : undefined;

  return (
    <Flex.Column as="li" gap={8} py={12}>
      <Flex alignItems="center" gap={8}>
        <CheckBox id={couponInputId} checked={checked} disabled={disabled} onChange={onChange} />
        <Typo as="label" htmlFor={couponInputId} weight="bold" color={fontColor}>
          {coupon.name}
        </Typo>
      </Flex>
      <Flex.Column>
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
      </Flex.Column>
    </Flex.Column>
  );
}
