import {name as pkgName} from '../../package.json';

const configs = ['./recommended.js'];

export const BUILTIN_CONFIGS = new Map(
  configs.map(filepath => {
    const {config} = require(filepath);
    return [`${pkgName}:${config.name}`, config];
  })
);
