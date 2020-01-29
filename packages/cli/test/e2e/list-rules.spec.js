import {runAsCSV, runAsJSON} from './cli-helper.js';

describe('@report-toolkit/cli:command:list-rules', function() {
  beforeEach(function() {
    this.timeout(5000);
  });

  it('should list available rules', function() {
    return expect(
      runAsJSON('list-rules'),
      'to be fulfilled with value satisfying',
      expect.it('to be an', Array).and('to have items satisfying', {
        id: expect.it('to be a', 'string'),
        description: expect.it('to be a', 'string')
      })
    );
  });

  describe('when used with transform', function() {
    describe('csv', function() {
      it('should list available rules', function() {
        return expect(
          runAsCSV('list-rules'),
          'to be fulfilled with value satisfying',
          expect.it('to be an', Array).and('to have items satisfying', {
            Rule: expect.it('to be a', 'string'),
            Description: expect.it('to be a', 'string')
          })
        );
      });
    });
  });
});
