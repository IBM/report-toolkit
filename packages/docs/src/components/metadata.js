import React from 'react';

import useMetadata from '../gatsby-theme-carbon/util/hooks/useMetadata';
import InlineCode from './inline-code';

const Metadata = ({prop}) => {
  const metadata = useMetadata();

  switch (prop) {
    case 'packageName':
      return <strong>{metadata[prop]}</strong>;
    case 'executable':
      return <InlineCode>{metadata[prop]}</InlineCode>;
    default:
      return <>{metadata[prop]}</>;
  }
};

export default Metadata;
