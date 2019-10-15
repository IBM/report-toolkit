import Footer from 'gatsby-theme-carbon/src/components/Footer';
import React from 'react';

const Content = () => (
  <>
    <p>
      Have questions?{' '}
      <a href="https://github.com/IBM/report-toolkit/issues/new">
        Open an issue on GitHub
      </a>
      .{' '}
    </p>
    <p>
      Built with{' '}
      <a href="https://github.com/carbon-design-system/gatsby-theme-carbon">
        Gatsby Theme Carbon
      </a>
      .
    </p>
    <p>
      <strong>report-toolkit</strong> is licensed Apache-2.0
    </p>
    <p>Copyright ©2019 IBM</p>
  </>
);

const links = {
  firstCol: [
    {href: 'https://ibm.com/privacy', linkText: 'Privacy'},
    {href: 'https://ibm.com/legal', linkText: 'Terms of Use'},
    {href: 'https://ibm.com', linkText: 'IBM.com'}
  ],
  secondCol: [
    {href: 'https://nodejs.org', linkText: 'NodeJS'},
    {href: 'https://gatsbyjs.org', linkText: 'Gatsby'}
  ]
};

const CustomFooter = () => <Footer links={links} Content={Content} />;

export default CustomFooter;
