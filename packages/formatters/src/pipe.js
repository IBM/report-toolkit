import {_, observable} from '@gnostic/common';
const {map, pipeIf} = observable;

export const toPipe = ({headers = false} = {}) => observable =>
  observable.pipe(pipeIf(!headers, map(_.get('value'))));
