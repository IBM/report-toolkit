import {observable} from '@report-toolkit/common';
import {readdir as readdirNodeback} from 'fs';
import {basename, join} from 'path';

const {bindNodeCallback, filter, fromAny, map, mergeAll} = observable;

const readdir = bindNodeCallback(readdirNodeback);

const toRuleDefinitionFromFilepath = (extension = '.js') => observable =>
  observable.pipe(
    map(filepath => ({
      filepath,
      id: basename(filepath, extension),
      ruleDef: require(filepath)
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
    map(filepath => join(dirpath, filepath))
  );
};

export const fromSearchpathToRuleDefinition = searchPath =>
  fromDirpathToFilepaths(searchPath).pipe(toRuleDefinitionFromFilepath());

export const fromFilepathToRuleDefinition = filepath =>
  fromAny(filepath).pipe(toRuleDefinitionFromFilepath());
