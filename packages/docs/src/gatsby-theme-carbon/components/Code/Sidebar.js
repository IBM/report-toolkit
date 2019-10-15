import {Launch16} from '@carbon/icons-react';
import {CopyButton} from 'carbon-components-react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import React from 'react';

// @ts-ignore
import {button, copyButton, sidebar, sidebarWrapped} from './Code.module.scss';

// If there is a src url, but no path name, both icons appear in the sidebar.
// If there is a path name, but no src url, the copy button should be in the PathRow
// so we don't put it in the side bar.
//
// We'll still render the sidebar regardless of the path since we want the text fade.
const Sidebar = ({src, path, children, wrap}) => {
  const shouldShowSrcLink = !path && src;
  const shouldShowCopyButton = !path || src;
  return (
    <div className={cx(sidebar, {[sidebarWrapped]: wrap})}>
      {shouldShowCopyButton && (
        <CopyButton
          className={cx(button, copyButton)}
          onClick={() => {
            copy(children);
          }}
        />
      )}
      {shouldShowSrcLink && (
        <a
          title="View source"
          target="_blank"
          rel="noopener noreferrer"
          className={button}
          href={src}
          style={{zIndex: 200}}
        >
          <Launch16 />
        </a>
      )}
    </div>
  );
};

export default Sidebar;
