import { css, cx } from '@emotion/css';
import type { ComponentProps, ReactNode } from 'react';
import Flex from './Flex';
import type { FlexStyleProps } from './Flex';

interface ListDivider {
  header?: boolean;
  footer?: boolean;
  item?: boolean;
}

interface RenderSlots {
  header?: ReactNode;
  footer?: ReactNode;
}

interface ListProps
  extends
    Omit<ComponentProps<'div'>, keyof RenderSlots | keyof FlexStyleProps | 'children' | 'divider'>,
    RenderSlots,
    FlexStyleProps {
  children?: ReactNode;
  divider?: ListDivider;
}

interface ListItemSlots extends RenderSlots {
  left?: ReactNode;
  content?: ReactNode;
  right?: ReactNode;
}

interface ListItemProps
  extends
    Omit<ComponentProps<'li'>, keyof ListItemSlots | keyof FlexStyleProps | 'children'>,
    ListItemSlots,
    FlexStyleProps {}

function ListRoot({ className, header, footer, children, divider, ...props }: ListProps) {
  return (
    <Flex direction="column" {...props} className={className}>
      {header && <div className={cx(divider?.header && borderBottomStyle)}>{header}</div>}
      <Flex as="ul" direction="column" className={cx(listStyle, divider?.item && itemDividerStyle)}>
        {children}
      </Flex>
      {footer && <div className={cx(divider?.footer && borderTopStyle)}>{footer}</div>}
    </Flex>
  );
}

function ListItem({ className, header, footer, left, content, right, ...props }: ListItemProps) {
  return (
    <Flex as="li" direction="column" {...props} className={cx(listItemStyle, className)}>
      {header}
      <Flex justifyContent="space-between" alignItems="center" className={listItemBodyStyle}>
        {left && <div>{left}</div>}
        {content && <div>{content}</div>}
        {right && <div>{right}</div>}
      </Flex>
      {footer}
    </Flex>
  );
}

const List = Object.assign(ListRoot, { Item: ListItem });

export default List;

const listStyle = css`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const listItemStyle = css`
  list-style: none;
`;

const listItemBodyStyle = css`
  width: 100%;
`;

const borderTopStyle = css`
  border-top: 1px solid var(--color-gray-200);
`;

const borderBottomStyle = css`
  border-bottom: 1px solid var(--color-gray-200);
`;

const itemDividerStyle = css`
  > li + li {
    border-top: 1px solid var(--color-gray-200);
  }
`;
