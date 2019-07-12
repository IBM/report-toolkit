import builtins from '@stream-io/rollup-plugin-node-builtins';
import path from 'path';
import {readdirSync} from 'readdir-withfiletypes';
import rollupExternalModules from 'rollup-external-modules';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import visualizer from 'rollup-plugin-visualizer';

const makeConfigs = pkgpath => {
  const pkg = require(`${pkgpath}/package.json`);
  const configs = [];
  if (pkg.browser) {
    configs.push({
      input: require.resolve(`${pkgpath}/${pkg.module}`),
      output: {
        name: pkg.name.replace(/^@/, '').replace('/', '.'),
        file: path.join(pkgpath, pkg.browser),
        format: 'umd'
      },
      onwarn(warning, warn) {
        // this circular dependency warning is known and is not something
        // we can do anything about.
        // see https://npm.im/@stream-io/rollup-plugin-node-builtins README
        if (
          !(
            warning.code === 'CIRCULAR_DEPENDENCY' &&
            warning.importer.includes(
              'rollup-plugin-node-builtins/src/es6/readable-stream/duplex.js'
            )
          )
        ) {
          warn(warning);
        }
      },
      plugins: [
        builtins(),
        resolve({
          mainFields: ['module', 'unpkg', 'browser', 'main'],
          preferBuiltins: false
        }),
        commonjs({
          include: /node_modules/
        }),
        json(),
        babel({
          exclude: [path.join(pkgpath, 'node_modules', '**')]
        }),
        visualizer({filename: `.rollup/${path.basename(pkg.browser)}.html`})
      ]
    });
  }
  return [
    ...configs,
    {
      input: require.resolve(`${pkgpath}/${pkg.module}`),
      output: {file: path.join(pkgpath, pkg.main), format: 'cjs'},
      external: rollupExternalModules,
      plugins: [
        resolve({
          preferBuiltins: true
        }),
        commonjs({
          include: /node_modules/
        }),
        json(),
        babel({
          exclude: [path.join(pkgpath, 'node_modules', '**')]
        }),
        visualizer({filename: `.rollup/${path.basename(pkg.main)}.html`})
      ]
    }
  ];
};

export default readdirSync(path.join(__dirname, 'packages'), {
  withFileTypes: true
})
  .filter(dirent => dirent.isDirectory())
  // this should be a flatmap
  .reduce(
    (acc, {name}) => [
      ...acc,
      ...makeConfigs(path.join(__dirname, 'packages', name))
    ],
    []
  );
