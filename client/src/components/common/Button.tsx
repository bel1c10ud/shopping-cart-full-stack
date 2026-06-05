import type { ComponentProps, HTMLElementType } from 'react';
import React from 'react';
import { css, cx } from '@emotion/css';
import { BUTTON_SIZE, type ButtonSizeToken } from '../../tokens';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';

const variants = {
  default: css`
    border-radius: var(--radius-m);
    background: var(--color-white);
    color: var(--color-black);
    border: 1px solid var(--color-gray-300);

    &:disabled {
      color: var(--color-gray-300);
      border: 1px solid var(--color-gray-200);
    }
  `,
  cta: css`
    background-color: var(--color-black);
    color: var(--color-white);

    &:disabled {
      background-color: var(--color-gray-300);
      color: var(--color-white);
    }
  `,
};

interface ButtonProps extends SpacingStyleProps {
  variant?: keyof typeof variants;
  size?: ButtonSizeToken;
}

export default function Button<T extends HTMLElementType = 'button'>({
  as,
  className,
  variant,
  size = 'm',
  ...props
}: { as?: T } & ComponentProps<T> & ButtonProps) {
  const { spacingProps, restProps } = splitSpacingProps(props);
  return React.createElement(as ?? 'button', {
    ...restProps,
    className: cx(buttonStyle(size), spacingStyle(spacingProps), variants[variant ?? 'default'], className),
  });
}

const buttonStyle = (size: ButtonSizeToken) => css`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  font-size: ${BUTTON_SIZE[size].fontSize};
  font-weight: var(--font-weight-bold);
  height: ${BUTTON_SIZE[size].height};
  padding: 0 ${BUTTON_SIZE[size].paddingX};
`;
