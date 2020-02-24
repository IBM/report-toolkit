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
        repository: {
          baseUrl: 'https://github.com/IBM/report-toolkit',
          subDirectory: 'packages/docs'
        },
        titleType: 'append',
        gatsbyRemarkPlugins: ['gatsby-remark-import-code']
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
