module.exports = {
  '*.js': ['eslint --fix', 'git add'],
  '*.{yml,md,mdx}': ['prettier --write', 'git add'],
  'packages/*/package.json':
    /**
     * syncpack works against all package manifests, so this will be one command
     * and then a `git add` for each file
     * @param {string[]} filepaths
     */
    filepaths => [
      'syncpack format',
      ...filepaths.map(filepath => `git add "${filepath}"`)
    ]
};
