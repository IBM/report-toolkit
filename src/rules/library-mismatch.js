exports.meta = {
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

const VERSION_REGEXP = /(\d+(?:\.\d+)+[a-z]?)/;

exports.inspect = (context, {ignore = []} = {}) => {
  const ignoredComponents = new Set(ignore);
  const {sharedObjects, header} = context;
  return Object.keys(header.componentVersions)
    .filter(component => !ignoredComponents.has(component))
    .flatMap(component => {
      const version = header.componentVersions[component];
      return sharedObjects
        .filter(filepath => filepath.includes(component))
        .filter(filepath => {
          const sharedVersion = VERSION_REGEXP.exec(filepath);
          return sharedVersion && sharedVersion[1] !== version;
        })
        .map(
          filepath =>
            `Custom shared library at ${filepath} in use conflicting with ${component}@${version}`
        );
    });
};
