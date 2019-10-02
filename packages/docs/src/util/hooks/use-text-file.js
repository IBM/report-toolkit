import {graphql, useStaticQuery} from 'gatsby';
import _ from 'lodash/fp';

const useTextFile = () => {
  const data = useStaticQuery(graphql`
    query {
      allTextFile {
        nodes {
          content
          name
        }
      }
    }
  `);

  return _.indexBy('name', data.allTextFile.nodes);
};

export default useTextFile;
