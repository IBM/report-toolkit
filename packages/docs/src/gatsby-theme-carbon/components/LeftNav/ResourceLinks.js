import ResourceLinks from 'gatsby-theme-carbon/src/components/LeftNav/ResourceLinks';
import React from 'react';

const links = [
  {
    title: 'Github',
    href: 'https://github.com/IBM/report-toolkit'
  },
  {
    title: 'Code of Conduct',
    href:
      'https://github.com/IBM/report-toolkit/blob/master/.github/CODE_OF_CONDUCT.md'
  },
  {
    title: 'Diagnostic Reports API',
    href: 'https://nodejs.org/api/report.html'
  }
];

// shouldOpenNewTabs: true if outbound links should open in a new tab
const CustomResources = () => <ResourceLinks shouldOpenNewTabs links={links} />;

export default CustomResources;
