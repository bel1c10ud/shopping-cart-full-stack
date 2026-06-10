import { SPACING, type SpacingToken } from '../../tokens';

export interface SpacingStyleProps {
  p?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  pt?: SpacingToken;
  pr?: SpacingToken;
  pb?: SpacingToken;
  pl?: SpacingToken;
  m?: SpacingToken;
  mx?: SpacingToken;
  my?: SpacingToken;
  mt?: SpacingToken;
  mr?: SpacingToken;
  mb?: SpacingToken;
  ml?: SpacingToken;
}

export function splitSpacingProps<P extends SpacingStyleProps>(props: P) {
  const { p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml, ...restProps } = props;

  return {
    spacingProps: { p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml },
    restProps,
  };
}

export function spacingStyle(props: SpacingStyleProps) {
  return `
    ${style('padding', props.p)}
    ${style('padding-left', props.px)}
    ${style('padding-right', props.px)}
    ${style('padding-top', props.py)}
    ${style('padding-bottom', props.py)}
    ${style('padding-top', props.pt)}
    ${style('padding-right', props.pr)}
    ${style('padding-bottom', props.pb)}
    ${style('padding-left', props.pl)}
    ${style('margin', props.m)}
    ${style('margin-left', props.mx)}
    ${style('margin-right', props.mx)}
    ${style('margin-top', props.my)}
    ${style('margin-bottom', props.my)}
    ${style('margin-top', props.mt)}
    ${style('margin-right', props.mr)}
    ${style('margin-bottom', props.mb)}
    ${style('margin-left', props.ml)}
  `;
}

function style(property: string, token?: SpacingToken) {
  return token ? `${property}: ${SPACING[token]};` : '';
}
