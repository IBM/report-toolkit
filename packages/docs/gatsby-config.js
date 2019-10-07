const path = require('path');
// @ts-ignore
const {description, keywords} = require('./package.json');
const {
  NAMESPACE,
  SHORT_NAMESPACE
} = require('@report-toolkit/common').constants;

module.exports = {
  pathPrefix: '/report-toolkit',
  plugins: [
    {
      options: {
        name: 'raw',
        path: path.join(__dirname, 'src', 'pages', 'raw')
      },
      resolve: 'gatsby-source-filesystem'
    },
    {
      options: {
        repository: {
          baseUrl: 'https://github.com/ibm/report-toolkit',
          subDirectory: 'packages/docs'
        },
        titleType: 'append'
      },
      resolve: 'gatsby-theme-carbon'
    }
  ],
  siteMetadata: {
    description,
    executable: SHORT_NAMESPACE,
    keywords,
    packageName: NAMESPACE,
    title: `${NAMESPACE} for Node.js`
  }
};
