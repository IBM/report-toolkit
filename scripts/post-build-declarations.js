/**
 * This script prepends a banner for `typedoc-plugin-external-module-name`
 * to the generated `.d.ts` files, which are used to build documentation
 * (instead of the source `.js` files).
 *
 * When generating declaration files, `tsc` will not copy module-level comments,
 * which is why this is necessary.
 *
 * Mapping of filename to module name is found in `modules.json`.
 *
 * `modules.json` should be of format:
 * `{{name: string, source: string, description: string, preferred?: boolean}}[]`
 */

const path = require('path');
const replace = require('replace-in-files-cli/api');

const EXTENSION = '.d.ts';
// @ts-ignore
const moduleMap = require('./modules.json');

moduleMap.forEach(async ({source, name, description, preferred}) => {
  const banner = `/**
 * ${description}
 * @module ${name}
 ${preferred ? '* @preferred' : '*'}
 */
/**
 */
`;

  const filePath = path.resolve(__dirname, '..', `${source}${EXTENSION}`);
  try {
    // @ts-ignore
    await replace(filePath, {
      find: [/^/],
      replacement: banner,
      ignoreCase: false
    });
    console.error(`wrote banner to ${filePath}`);
  } catch (err) {
    console.error(`failed to write banner to ${filePath}`, err);
  }
});
