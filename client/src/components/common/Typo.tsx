import type { ComponentProps, HTMLElementType } from 'react';
import React from 'react';
import {
  FONT_COLOR,
  FONT_SIZE,
  FONT_WEIGHT,
  type FontColorToken,
  type FontSizeToken,
  type FontWeightToken,
} from '../../tokens';
import type { Property } from 'csstype';
import { css, cx } from '@emotion/css';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';

interface TypoProps extends SpacingStyleProps {
  size?: FontSizeToken;
  weight?: FontWeightToken;
  color?: FontColorToken;
  align?: Property.TextAlign;
}

export default function Typo<T extends HTMLElementType = 'p'>({
  as,
  className,
  size,
  weight,
  color,
  align,
  ...props
}: { as?: T } & ComponentProps<T> & TypoProps) {
  const { spacingProps, restProps } = splitSpacingProps(props);
  const typoStyleProps = { size, weight, color, align, ...spacingProps };
  return React.createElement(as ?? 'p', { ...restProps, className: cx(typoStyle(typoStyleProps), className) });
}

const typoStyle = (props: TypoProps) => css`
  font-size: ${FONT_SIZE[props.size ?? 'm']};
  font-weight: ${FONT_WEIGHT[props.weight ?? 'medium']};
  color: ${FONT_COLOR[props.color ?? 'black']};
  ${props.align ? `text-align: ${props.align};` : ''}
  ${spacingStyle(props)}
`;
