import {map, pipeIf} from '../observable';

import _ from 'lodash/fp';

export const toPipe = ({headers = false} = {}) => observable =>
  observable.pipe(pipeIf(!headers, map(_.get('value'))));
