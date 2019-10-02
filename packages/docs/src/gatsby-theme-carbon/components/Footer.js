import Footer from 'gatsby-theme-carbon/src/components/Footer';
import React from 'react';

const Content = () => (
  <>
    <p>
      By importing the <strong>Footer</strong> component from
      gatsby-theme-carbon, we can supply our own props.
    </p>
    <p>
      The default export from a shadowed component will replace that component
      in the theme.
    </p>
    <p>
      <a href="https://www.gatsbyjs.org/docs/themes/api-reference/#component-shadowing">
        More about component shadowing
      </a>
    </p>
  </>
);

const links = {
  firstCol: [
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'},
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'},
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'}
  ],
  secondCol: [
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'},
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'},
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'},
    {href: 'https://ibm.com/design', linkText: 'Shadowed link'}
  ]
};

const CustomFooter = () => <Footer links={links} Content={Content} />;

export default CustomFooter;
