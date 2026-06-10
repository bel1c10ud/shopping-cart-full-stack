import { css, cx } from '@emotion/css';
import React from 'react';
import type { ComponentProps } from 'react';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';

const sizes = {
  s: '16px',
  m: '24px',
  l: '32px',
} as const;

interface SpinnerProps extends Omit<ComponentProps<'span'>, 'children'>, SpacingStyleProps {
  size?: keyof typeof sizes;
}

export default function Spinner({ className, size = 'm', ...props }: SpinnerProps) {
  const { spacingProps, restProps } = splitSpacingProps(props);

  return React.createElement('span', {
    ...restProps,
    className: cx(spinnerStyle(size), spacingStyle(spacingProps), className),
  });
}

const spinnerStyle = (size: keyof typeof sizes) => css`
  display: inline-block;
  width: ${sizes[size]};
  height: ${sizes[size]};
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
