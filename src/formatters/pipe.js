import _ from 'lodash/fp';
import {map} from 'rxjs/operators';
import {pipeIf} from '../operators';

export const toPipe = ({headers = false} = {}) => observable =>
  observable.pipe(pipeIf(!headers, map(_.get('value'))));
