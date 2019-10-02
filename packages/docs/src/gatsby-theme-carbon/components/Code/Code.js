/* eslint-disable react/jsx-key */
import cx from 'classnames';
import {Row} from 'gatsby-theme-carbon/src/components/Grid';
import Highlight, {defaultProps} from 'prism-react-renderer';
import React from 'react';

import {
  container,
  highlight,
  row,
  sideBarMinHeight,
  wordWrap
} from './Code.module.scss';
import PathRow from './PathRow';
import prismTheme from './prismTheme';
import Sidebar from './Sidebar';

const Code = ({
  children,
  className: classNameProp = '',
  path,
  src,
  wrap = false
}) => {
  const language = classNameProp.replace(/language-/, '');

  const removeTrailingEmptyLine = lines => {
    const [lastLine] = lines.splice(-1);
    if (lastLine[0].empty) {
      return lines;
    }
    return [...lines, lastLine];
  };

  return (
    <Row className={row}>
      <PathRow src={src} path={path}>
        {children}
      </PathRow>
      <Highlight
        {...defaultProps}
        code={children}
        language={language}
        theme={prismTheme}
      >
        {({className, style, tokens, getLineProps, getTokenProps}) => (
          <div className={container}>
            <pre
              className={cx(highlight, {
                [sideBarMinHeight]: !path && src,
                [className]: className,
                [wordWrap]: wrap
              })}
              style={style}
            >
              {removeTrailingEmptyLine(tokens).map((line, i) => (
                <div {...getLineProps({line, key: i})}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({token, key})} />
                  ))}
                </div>
              ))}
            </pre>
            <Sidebar path={path} src={src} wrap={wrap}>
              {children}
            </Sidebar>
          </div>
        )}
      </Highlight>
    </Row>
  );
};

export default Code;
