exports.meta = {
  type: 'info',
  docs: {
    description: 'Identify potential library version mismatches',
    category: 'runtime',
    url: 'https://more-information-for-this-rule'
  },
  schema: {},
  mode: 'simple',
  messages: {
    mismatch: 'Potential library version mismatch'
  }
};

exports.match = (context, opts = {}) => {
  const {sharedObjects, header} = context;
  const problems = {};
  Object.keys(header.componentVersions).forEach(component => {
    const version = header.componentVersions[component];
    sharedObjects.forEach(filepath => {
      if (!problems[component] && filepath.includes(component)) {
        const sharedVersion = filepath.match(/(\d+(?:\.\d+)+[a-z]?)/);
        if (sharedVersion && sharedVersion[1] !== version) {
          problems[
            component
          ] = `Potential problem: custom shared library at ${filepath} in use conflicting with ${component}@${version}`;
        }
      }
    });
  });
  Object.keys(problems).forEach(component => {
    context.report(problems[component]);
  });
};
