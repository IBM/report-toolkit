const VERSION_REGEXP = /(\d+(?:\.\d+)+[a-z]?)/;

/**
 * @type {import('../rule').RuleDefinitionInspectFunction}
 */
export const inspect = (config = {}) => {
  const ignoredComponents = new Set(config.ignore || []);
  return context => {
    const {header, sharedObjects} = context;
    return (
      (Object.keys(header.componentVersions)
        .filter(component => !ignoredComponents.has(component))
        // this should be a flatMap()
        .reduce((acc, component) => {
          const version = header.componentVersions[component];
          return [
            ...acc,
            sharedObjects
              .filter(
                /** @param {string} filepath */
                filepath => {
                  const sharedVersion = VERSION_REGEXP.exec(filepath);
                  return (
                    filepath.includes(component) &&
                    sharedVersion &&
                    sharedVersion[1] !== version
                  );
                }
              )
              .map(
                /** @param {string} filepath */
                filepath =>
                  `Custom shared library at ${filepath} in use conflicting with ${component}@${version}`
              )
          ];
        }, []))
    );
  };
};
export const id = 'library-mismatch';
export const meta = {
  docs: {
    category: 'runtime',
    description: 'Identify potential shared library version mismatches',
    url: 'https://more-information-for-this-rule'
  },
  schema: {
    additionalProperties: false,
    properties: {
      ignore: {
        items: {
          type: 'string'
        },
        minItems: 1,
        type: 'array'
      }
    },
    type: 'object'
  }
};
