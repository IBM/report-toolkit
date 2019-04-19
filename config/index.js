import pkg from '../package.json';

const configs = ['./recommended.js'];

export const BUILTIN_CONFIGS = new Map(
  configs.map(filepath => {
    const {config} = require(filepath);
    return [`${pkg.name}:${config.name}`, config];
  })
);
