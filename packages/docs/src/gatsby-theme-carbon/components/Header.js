import Header from 'gatsby-theme-carbon/src/components/Header';
import React from 'react';

import useMetadata from '../util/hooks/useMetadata';

const CustomHeader = props => {
  const {packageName} = useMetadata();

  return <Header {...props}>{packageName}</Header>;
};

export default CustomHeader;
