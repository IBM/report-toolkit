import {
  Header as ShellHeader,
  HeaderGlobalBar,
  HeaderMenuButton,
  SkipToContent
} from 'carbon-components-react/lib/components/UIShell';
import cx from 'classnames';
import {Link} from 'gatsby';
import GlobalSearch from 'gatsby-theme-carbon/src/components/GlobalSearch';
import {
  collapsed,
  header,
  headerButton,
  headerName,
  skipToContent
} from 'gatsby-theme-carbon/src/components/Header/Header.module.scss';
import NavContext from 'gatsby-theme-carbon/src/util/context/NavContext';
import useMetadata from 'gatsby-theme-carbon/src/util/hooks/useMetadata';
import React, {useContext} from 'react';

const Header = () => {
  const {leftNavIsOpen, toggleNavState, searchIsOpen} = useContext(NavContext);
  const {packageName, isSearchEnabled} = useMetadata();

  return (
    <>
      <ShellHeader aria-label="Header" className={header}>
        <SkipToContent className={skipToContent} />
        <HeaderMenuButton
          className={cx('bx--header__action--menu', headerButton)}
          aria-label="Open menu"
          onClick={() => {
            toggleNavState('leftNavIsOpen');
            toggleNavState('switcherIsOpen', 'close');
          }}
          isActive={leftNavIsOpen}
        />
        <Link
          className={cx(headerName, {
            [collapsed]: searchIsOpen
          })}
          to="/"
        >
          {packageName}
        </Link>
        <HeaderGlobalBar>{isSearchEnabled && <GlobalSearch />}</HeaderGlobalBar>
      </ShellHeader>
    </>
  );
};

export default Header;
