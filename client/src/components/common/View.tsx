import { css } from '@emotion/css';
import Flex, { type FlexStyleProps } from './Flex';
import { Children, isValidElement } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import Image from './Image';

interface ViewProps extends FlexStyleProps {
  children?: ReactNode;
}

interface ViewCTAProps extends Omit<ComponentProps<'div'>, keyof FlexStyleProps>, FlexStyleProps {}

function ViewRoot({ children, ...contentFlexProps }: ViewProps) {
  const { contents, ctas } = splitChildren(children);

  return (
    <Flex.Column className={viewStyle}>
      <Header />
      <Flex.Column flexGrow={1} p={24} {...contentFlexProps} className={contentStyle}>
        {contents}
      </Flex.Column>
      {ctas}
    </Flex.Column>
  );
}

function splitChildren(children: ReactNode) {
  const contents: ReactNode[] = [];
  const ctas: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === ViewCTA) {
      ctas.push(child);
      return;
    }

    contents.push(child);
  });

  return { contents, ctas };
}

function ViewCTA({ children, ...props }: ViewCTAProps) {
  return (
    <Flex.Column flexGrow={0} flexShrink={0} {...props}>
      {children}
    </Flex.Column>
  );
}

const View = Object.assign(ViewRoot, { CTA: ViewCTA });

export default View;

const viewStyle = css`
  width: 100%;
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
  overflow: hidden;
`;

const contentStyle = css`
  min-height: 0;
  overflow-y: auto;
`;

function Header() {
  const location = useLocation();

  return (
    <Flex as="header" className={headerStyle} p={24} flexGrow={0} flexShrink={0}>
      {location.pathname === '/' ? (
        <Image height={16} src={`${import.meta.env.BASE_URL}logo.svg`} alt="shopping cart" />
      ) : (
        <Link to="/" aria-label="뒤로가기">
          <Image src={`${import.meta.env.BASE_URL}back.svg`} alt="뒤로가기" />
        </Link>
      )}
    </Flex>
  );
}

const headerStyle = css`
  width: 100%;
  height: 64px;
  background-color: var(--color-black);
`;
