import {run} from './cli-helper.js';

describe('@report-toolkit/cli', function() {
  beforeEach(function() {
    this.timeout(5000);
  });

  describe('when run without parameters', function() {
    it('should exit with code 1', function() {
      return expect(run(), 'to be rejected with error satisfying', {
        exitCode: 1
      });
    });

    it('should complain about non-option arguments', function() {
      return expect(run(), 'to be rejected with error satisfying', {
        stderr: /Not enough non-option arguments: got 0, need at least 1/
      });
    });
  });
});
