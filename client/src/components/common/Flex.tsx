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

type FlexProps<T extends HTMLElementType = 'div'> = { as?: T } & ComponentProps<T> & FlexStyleProps;
type FixedDirectionFlexProps<T extends HTMLElementType = 'div'> = Omit<FlexProps<T>, 'direction'>;

function FlexRoot<T extends HTMLElementType = 'div'>({
  as,
  className,
  ...props
}: FlexProps<T>) {
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

function FlexColumn<T extends HTMLElementType = 'div'>(props: FixedDirectionFlexProps<T>) {
  return <FlexRoot {...(props as FlexProps<T>)} direction="column" />;
}

function FlexRow<T extends HTMLElementType = 'div'>(props: FixedDirectionFlexProps<T>) {
  return <FlexRoot {...(props as FlexProps<T>)} direction="row" />;
}

const Flex = Object.assign(FlexRoot, {
  Column: FlexColumn,
  Row: FlexRow,
});

export default Flex;

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
