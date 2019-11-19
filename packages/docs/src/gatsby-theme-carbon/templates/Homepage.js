import BackToTopBtn from 'gatsby-theme-carbon/src/components/BackToTopBtn';
import {
  HomepageBanner,
  HomepageCallout
} from 'gatsby-theme-carbon/src/components/Homepage';
import Main from 'gatsby-theme-carbon/src/components/Main';
import React from 'react';

import BannerImage from '../../images/report-json.png';
import Layout from '../components/Layout';
import useMetadata from '../util/hooks/useMetadata';
import {calloutLink} from './Homepage.module.scss';

const Homepage = ({children, location, pageContext}) => {
  const {frontmatter = {}, titleType} = pageContext;
  const {title, description, keywords} = frontmatter;

  const FirstLeftText = () => {
    const {title} = useMetadata();
    return <p>{title}</p>;
  };

  const FirstRightText = () => (
    <p>
      <strong>report-toolkit</strong> provides a CLI &amp; programmable API to
      help developers analyze &amp; process{' '}
      <a
        href="https://nodejs.org/api/report.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Node.js Diagnostic Reports
      </a>
      .
      <a className={calloutLink} href="quick-start">
        Quick Start →
      </a>
    </p>
  );

  return (
    <Layout
      pageTitle={title}
      pageDescription={description}
      pageKeywords={keywords}
      titleType={titleType}
      homepage
      theme="dark"
    >
      <HomepageBanner
        position={'top 20% center'}
        renderText={() => ''}
        image={BannerImage}
      />
      <HomepageCallout
        backgroundColor="#030303"
        color="white"
        leftText={FirstLeftText}
        rightText={FirstRightText}
      />
      <Main>{children}</Main>
      <BackToTopBtn />
    </Layout>
  );
};

export default Homepage;
