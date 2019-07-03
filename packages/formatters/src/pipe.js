import {_} from '@gnostic/common';
import {map, pipeIf} from '@gnostic/common/src/observable.js';

export const toPipe = ({headers = false} = {}) => observable =>
  observable.pipe(pipeIf(!headers, map(_.get('value'))));
