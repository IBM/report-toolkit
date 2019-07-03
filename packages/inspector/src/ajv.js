import {_} from '@gnostic/common';
import Ajv from 'ajv';

export const AJV = _.once(
  () =>
    new Ajv({
      meta: false,
      validateSchema: false,
      missingRefs: 'ignore',
      verbose: true,
      useDefaults: true
    })
);
