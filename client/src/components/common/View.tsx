import { css } from '@emotion/css';
import Flex, { type FlexStyleProps } from './Flex';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import Image from './Image';

interface ViewProps extends FlexStyleProps {
  children?: ReactNode;
}

export default function View({ children, ...contentFlexProps }: ViewProps) {
  return (
    <Flex direction="column" className={viewStyle}>
      <Header />
      <Flex flexGrow={1} direction="column" p={24} {...contentFlexProps} className={contentStyle}>
        {children}
      </Flex>
    </Flex>
  );
}

const viewStyle = css`
  width: 100%;
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
`;

const contentStyle = css`
  overflow-y: auto;
`;

function Header() {
  const location = useLocation();

  return (
    <Flex as="header" className={headerStyle} p={24} flexGrow={0} flexShrink={0}>
      {location.pathname === '/' ? (
        <Image className={logoStyle} src={`${import.meta.env.BASE_URL}logo.svg`} alt="shopping cart" />
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

const logoStyle = css`
  height: 16px;
`;
