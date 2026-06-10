import { css, cx } from '@emotion/css';
import React from 'react';
import type { ComponentProps } from 'react';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';
import { RADIUS, type RadiusToken } from '../../tokens';

interface ImageProps extends SpacingStyleProps {
  width?: number;
  height?: number;
  radius?: RadiusToken;
}

export default function Image({
  className,
  width,
  height,
  radius,
  ...props
}: Omit<ComponentProps<'img'>, 'width' | 'height'> & ImageProps) {
  const { spacingProps, restProps } = splitSpacingProps(props);

  return React.createElement('img', {
    ...restProps,
    className: cx(imageStyle({ width, height, radius }), spacingStyle(spacingProps), className),
  });
}

const imageStyle = (props: ImageProps) => css`
  display: block;
  ${props.width ? `width: ${props.width}px;` : ''}
  ${props.height ? `height: ${props.height}px;` : ''}
  ${props.radius ? `border-radius: ${RADIUS[props.radius]};` : ''}
`;
