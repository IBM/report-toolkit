import {REDACTED_TOKEN, redact} from '../src/redact';
describe('module:redact', function() {
  describe('function', function() {});
  describe('redact()', function() {
    describe('when provided an object with secret keys', function() {
      let obj;

      beforeEach(function() {
        obj = {
          FOO_SESSION_ID: 'aklsdjhflskfjdf',
          PASSWD: 'alsjkdfkl',
          OK: 'ok',
          environmentVariables: {
            SECRET: 'kjdfgshfkdsjfh',
            API_KEY: 'kldjfghn,vcx',
            'ACCESS-KEY': 'gkasdjhfksd',
            things: ['THING_TOKEN']
          }
        };
      });

      it('should redact the values in the "interesting" props', function() {
        expect(redact(obj), 'to equal', {
          FOO_SESSION_ID: 'aklsdjhflskfjdf',
          PASSWD: 'alsjkdfkl',
          OK: 'ok',
          environmentVariables: {
            SECRET: REDACTED_TOKEN,
            API_KEY: REDACTED_TOKEN,
            'ACCESS-KEY': REDACTED_TOKEN,
            things: REDACTED_TOKEN
          }
        });
      });
    });
  });
});
