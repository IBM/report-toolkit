const path = require('path');
const {description, keywords} = require('./package.json');
const {
  NAMESPACE,
  SHORT_NAMESPACE
} = require('@report-toolkit/common').constants;

module.exports = {
  siteMetadata: {
    title: `${NAMESPACE} for Node.js`,
    description,
    keywords,
    packageName: NAMESPACE,
    executable: SHORT_NAMESPACE
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'raw',
        path: path.join(__dirname, 'src', 'pages', 'raw')
      }
    },
    {
      resolve: 'gatsby-theme-carbon',
      options: {
        titleType: 'append',
        repository: {
          baseUrl: 'https://github.com/ibm/report-toolkit',
          subDirectory: 'packages/docs'
        }
      }
    }
  ]
};
