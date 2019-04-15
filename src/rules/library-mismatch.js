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

const VERSION_REGEXP = /(\d+(?:\.\d+)+[a-z]?)/;

exports.match = (context, {ignore = []} = {}) => {
  const ignoredComponents = new Set(ignore);
  const {sharedObjects, header} = context;
  Object.keys(header.componentVersions)
    .filter(component => !ignoredComponents.has(component))
    .forEach(component => {
      const version = header.componentVersions[component];
      sharedObjects
        .filter(filepath => filepath.includes(component))
        .forEach(filepath => {
          const sharedVersion = VERSION_REGEXP.exec(filepath);
          if (sharedVersion && sharedVersion[1] !== version) {
            context.report(
              `Potential problem: custom shared library at ${filepath} in use conflicting with ${component}@${version}`
            );
          }
        });
    });
};
