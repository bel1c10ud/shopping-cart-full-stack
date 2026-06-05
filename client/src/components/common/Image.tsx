import { css, cx } from '@emotion/css';
import React from 'react';
import type { ComponentProps } from 'react';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';

export default function Image({ className, ...props }: ComponentProps<'img'> & SpacingStyleProps) {
  const { spacingProps, restProps } = splitSpacingProps(props);

  return React.createElement('img', {
    ...restProps,
    className: cx(imageStyle, spacingStyle(spacingProps), className),
  });
}

const imageStyle = css`
  display: block;
`;
