import {bindNodeCallback} from 'rxjs';
import fs from 'fs';
import {map} from 'rxjs/operators';
import {redact} from './redact';

const readFile = bindNodeCallback(fs.readFile);

export const readReport = filepath =>
  readFile(filepath, 'utf8').pipe(
    map(JSON.parse),
    map(redact),
    map(Object.freeze)
  );
