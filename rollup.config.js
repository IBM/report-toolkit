import path from 'path';
import {readdirSync} from 'readdir-withfiletypes';
import rollupExternalModules from 'rollup-external-modules';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import hashbang from 'rollup-plugin-hashbang';
import json from 'rollup-plugin-json';
import resolve from '@rollup/plugin-node-resolve';

const IGNORED_PACKAGES = ['docs'];
const packagesDir = path.join(__dirname, 'packages');

/**
 *
 * @param {string} pkgpath - Path to subpackage root
 */
const makeConfigs = pkgpath => {
  const pkg = require(`${pkgpath}/package.json`);
  const cjsConfig = {
    external: rollupExternalModules,
    input: require.resolve(`${pkgpath}/${pkg.module}`),
    output: {
      file: path.join(pkgpath, pkg.main),
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs({
        include: [
          /node_modules/,
          /packages\/common\/src\/configs\/recommended\.js/
        ]
      }),
      json(),
      babel({
        exclude: [path.join(pkgpath, 'node_modules', '**')],
        babelHelpers: 'bundled'
      })
    ]
  };
  /**
   * @type {typeof cjsConfig[]}
   */
  const configs = [];
  if (pkgpath.endsWith('cli') || pkgpath.endsWith('report-toolkit')) {
    cjsConfig.plugins.unshift(hashbang());
  }
  return [...configs, cjsConfig];
};

export default readdirSync(packagesDir, {
  withFileTypes: true
})
  .filter(dirent => dirent.isDirectory())
  // this should be a flatmap
  .reduce(
    (acc, {name}) =>
      !IGNORED_PACKAGES.includes(name)
        ? [...acc, ...makeConfigs(path.join(packagesDir, name))]
        : acc,
    []
  );
