import {HomepageBanner, HomepageCallout} from 'gatsby-theme-carbon';
import HomepageTemplate from 'gatsby-theme-carbon/src/templates/Homepage';
import React from 'react';

import BannerImage from '../../images/report-json.png';
import useMetadata from '../util/hooks/useMetadata';
import {calloutLink} from './Homepage.module.scss';

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

const SecondLeftText = () => <></>;

const SecondRightText = () => (
  <p>
    You can also not use these components at all by not providing the callout
    props to the template or writing your own template.
    <a
      className={calloutLink}
      href="https://github.com/carbon-design-system/gatsby-theme-carbon/blob/master/packages/example/src/gatsby-theme-carbon/templates/Homepage.js"
    >
      Homepage source →
    </a>
  </p>
);

const customProps = {
  Banner: (
    <HomepageBanner
      position={'top 20% center'}
      renderText={() => ''}
      image={BannerImage}
    />
  ),
  FirstCallout: (
    <HomepageCallout
      backgroundColor="#030303"
      color="white"
      leftText={FirstLeftText}
      rightText={FirstRightText}
    />
  ),
  SecondCallout: (
    <HomepageCallout
      leftText={SecondLeftText}
      rightText={SecondRightText}
      color="white"
      backgroundColor="#061f80"
    />
  )
};

// spreading the original props gives us props.children (mdx content)
function ShadowedHomepage(props) {
  return <HomepageTemplate {...props} {...customProps} />;
}

export default ShadowedHomepage;
