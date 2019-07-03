import {
  bindNodeCallback,
  filter,
  fromAny,
  map,
  mergeAll
} from '@gnostic/common/src/observable.js';
import fs from 'fs';
import path from 'path';

const readdir = bindNodeCallback(fs.readdir);

const toRuleDefinitionFromFilepath = (extension = '.js') => observable =>
  observable.pipe(
    map(filepath => ({
      ruleDef: require(filepath),
      filepath,
      id: path.basename(filepath, extension)
    }))
  );

/**
 * Returns a list of absolute paths to files in a directory
 * @param {string} dirpath - Directory to read
 * @returns {Observable<string>} Stream of filepaths
 */
export const fromDirpathToFilepaths = dirpath => {
  return readdir(dirpath).pipe(
    mergeAll(),
    filter(filepath => filepath !== 'index.js'),
    map(filepath => path.join(dirpath, filepath))
  );
};

export const fromSearchpathToRuleDefinition = searchPath =>
  fromDirpathToFilepaths(searchPath).pipe(toRuleDefinitionFromFilepath());

export const fromFilepathToRuleDefinition = filepath =>
  fromAny(filepath).pipe(toRuleDefinitionFromFilepath());
