import {Breadcrumb, BreadcrumbItem} from 'carbon-components-react';
import {
  Accordion,
  AccordionItem
} from 'gatsby-theme-carbon/src/components/Accordion';
import {
  AnchorLink,
  AnchorLinks
} from 'gatsby-theme-carbon/src/components/AnchorLinks';
import ArtDirection from 'gatsby-theme-carbon/src/components/ArtDirection';
import ArticleCard from 'gatsby-theme-carbon/src/components/ArticleCard';
import Aside from 'gatsby-theme-carbon/src/components/Aside';
import Caption from 'gatsby-theme-carbon/src/components/Caption';
import DoDontExample from 'gatsby-theme-carbon/src/components/DoDontExample';
import FeatureCard from 'gatsby-theme-carbon/src/components/FeatureCard';
import {Column, Grid, Row} from 'gatsby-theme-carbon/src/components/Grid';
import ImageCard from 'gatsby-theme-carbon/src/components/ImageCard';
import ImageGallery from 'gatsby-theme-carbon/src/components/ImageGallery';
import ImageGalleryImage from 'gatsby-theme-carbon/src/components/ImageGallery/ImageGalleryImage';
import InlineNotification from 'gatsby-theme-carbon/src/components/InlineNotification';
import Link from 'gatsby-theme-carbon/src/components/Link';
import {
  Blockquote,
  H1,
  H2,
  H3,
  H4,
  H5,
  Li,
  Ol,
  P,
  Ul
} from 'gatsby-theme-carbon/src/components/markdown';
import PageDescription from 'gatsby-theme-carbon/src/components/PageDescription';
import PageTable from 'gatsby-theme-carbon/src/components/PageTable';
import ResourceCard from 'gatsby-theme-carbon/src/components/ResourceCard';
import {Tab, Tabs} from 'gatsby-theme-carbon/src/components/Tabs';
import Video from 'gatsby-theme-carbon/src/components/Video';
import React from 'react';

import {EmbedCode, InlineCode, Metadata} from '../../../components';
import Code from '../Code';

const components = {
  wrapper: function Wrapper({children, ...props}) {
    return <div {...props}>{children}</div>;
  },
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  p: P,
  ol: Ol,
  ul: Ul,
  li: Li,
  blockquote: Blockquote,
  code: Code,
  inlineCode: InlineCode,
  table: PageTable,
  a: Link,
  ArtDirection,
  PageDescription,
  Accordion,
  AccordionItem,
  Video,
  DoDontExample,
  Row,
  Column,
  Grid,
  Caption,
  ResourceCard,
  ArticleCard,
  Aside,
  FeatureCard,
  ImageCard,
  ImageGallery,
  ImageGalleryImage,
  AnchorLink,
  AnchorLinks,
  Tab,
  Tabs,
  InlineNotification,
  Metadata,
  EmbedCode,
  Breadcrumb,
  BreadcrumbItem
};

export default components;
