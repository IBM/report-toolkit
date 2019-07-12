import {_} from '@gnostic/common';
import Ajv from 'ajv';

export const AJV = _.once(
  () =>
    new Ajv({
      meta: false,
      missingRefs: 'ignore',
      useDefaults: true,
      validateSchema: false,
      verbose: true
    })
);
