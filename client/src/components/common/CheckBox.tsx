import type { ComponentProps } from 'react';
import React from 'react';
import { css, cx } from '@emotion/css';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';

export default function CheckBox({ className, ...props }: Omit<ComponentProps<'input'>, 'type'> & SpacingStyleProps) {
  const { spacingProps, restProps } = splitSpacingProps(props);
  return React.createElement('input', {
    ...restProps,
    type: 'checkbox',
    className: cx(checkBoxStyle, spacingStyle(spacingProps), className),
  });
}

const checkBoxStyle = css`
  width: 24px;
  height: 24px;
  appearance: none;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-l);
  background: url(${import.meta.env.BASE_URL}check.svg) center no-repeat;
  background-size: 16px;

  &:disabled {
    border: 1px solid var(--color-gray-200);
    background: url(${import.meta.env.BASE_URL}check_disabled.svg) center no-repeat;
  }

  &:checked {
    border: 0;
    background-color: var(--color-black);
    background-image: url(${import.meta.env.BASE_URL}check_checked.svg);
    background-position: center;
    background-repeat: no-repeat;
  }
`;
