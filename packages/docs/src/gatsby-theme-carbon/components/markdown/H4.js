import AutolinkHeader from 'gatsby-theme-carbon/src/components/AutolinkHeader';
import {h4} from 'gatsby-theme-carbon/src/components/markdown/Markdown.module.scss';
import React from 'react';

const H4 = ({children, ...rest}) => (
  <AutolinkHeader is="h4" className={h4} {...rest}>
    {children}
  </AutolinkHeader>
);

export default H4;
