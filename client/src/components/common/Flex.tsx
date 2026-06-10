import type { ComponentProps, HTMLElementType } from 'react';
import React from 'react';
import { SPACING, type SpacingToken } from '../../tokens';
import type { Property } from 'csstype';
import { css, cx } from '@emotion/css';
import { spacingStyle, splitSpacingProps, type SpacingStyleProps } from './styleProps';

export interface FlexStyleProps extends SpacingStyleProps {
  direction?: Property.FlexDirection;
  justifyContent?: Property.JustifyContent;
  alignItems?: Property.AlignItems;
  flexGrow?: Property.FlexGrow;
  flexShrink?: Property.FlexShrink;
  gap?: SpacingToken;
}

export default function Flex<T extends HTMLElementType = 'div'>({
  as,
  className,
  ...props
}: { as?: T } & ComponentProps<T> & FlexStyleProps) {
  const {
    direction,
    justifyContent,
    alignItems,
    flexGrow,
    flexShrink,
    gap,
    ...restProps
  } = props;
  const { spacingProps, restProps: flexProps } = splitSpacingProps(restProps);
  const flexStyleProps = {
    direction,
    justifyContent,
    alignItems,
    flexGrow,
    flexShrink,
    gap,
    ...spacingProps,
  };
  return React.createElement(as ?? 'div', { ...flexProps, className: cx(flexStyle(flexStyleProps), className) });
}

const flexStyle = (props: FlexStyleProps) => css`
  display: flex;
  ${props.direction ? `flex-direction: ${props.direction};` : ''}
  ${props.justifyContent ? `justify-content: ${props.justifyContent};` : ''}
  ${props.alignItems ? `align-items: ${props.alignItems};` : ''}
  ${props.gap ? `gap: ${SPACING[props.gap]};` : ''}
  ${props.flexGrow ? `flex-grow: ${props.flexGrow};` : ''}
  ${props.flexShrink ? `flex-shrink: ${props.flexShrink};` : ''}
  ${spacingStyle(props)}
`;
