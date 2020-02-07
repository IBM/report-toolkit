import defaultComponents from 'gatsby-theme-carbon/src/components/MDXProvider/defaultComponents';
import {Breadcrumb, BreadcrumbItem} from 'carbon-components-react';
import {EmbedCode, InlineCode, Metadata} from '../../../components';
import Code from '../Code';
import H4 from '../markdown/H4';

export default {
  ...defaultComponents,
  h4: H4,
  code: Code,
  inlineCode: InlineCode,
  EmbedCode,
  Metadata,
  Breadcrumb,
  BreadcrumbItem
};
