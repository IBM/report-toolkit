import Ajv from 'ajv';

export const ajv = new Ajv({
  meta: false,
  validateSchema: false,
  missingRefs: 'ignore',
  verbose: true
});
