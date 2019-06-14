import {ERROR, INFO} from '../../src/constants';
import {
  MODE_ALL,
  MODE_MAX,
  MODE_MEAN,
  MODE_MIN
} from '../../src/rules/cpu-usage';

import {createInspect} from './rules-helper';

const REPORT_001_FILEPATH = require.resolve(
  '../fixture/reports/report-001.json'
);

const REPORT_002_FILEPATH = require.resolve(
  '../fixture/reports/report-002-library-mismatch.json'
);
const REPORT_006_FILEPATH = require.resolve(
  '../fixture/reports/report-006-cpu-usage.json'
);

describe('rule:cpu-usage', function() {
  let inspect;

  describe(`mode: ${MODE_MEAN} (defaults)`, function() {
    beforeEach(function() {
      inspect = createInspect('../../src/rules/cpu-usage.js');
    });

    describe('when run against a single file', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect(REPORT_001_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_MEAN, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect(REPORT_006_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              data: {mode: MODE_MEAN, usage: 70.12, min: 0, max: 50},
              severity: ERROR,
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });

    describe('when run against multiple files', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH], {
              severity: INFO
            }),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (38.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_MEAN, usage: 38.12, min: 0, max: 50},
              severity: INFO,
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        beforeEach(function() {
          inspect = createInspect('../../src/rules/cpu-usage.js', {max: 30});
        });

        it('should report "error" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH]),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (38.12%) is outside the allowed range of 0-30%',
              data: {mode: MODE_MEAN, usage: 38.12, min: 0, max: 30},
              severity: ERROR,
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });
    });
  });

  describe(`mode: ${MODE_MIN}`, function() {
    beforeEach(function() {
      inspect = createInspect('../../src/rules/cpu-usage.js', {mode: MODE_MIN});
    });

    describe('when run against a single file', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect(REPORT_001_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Minimum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_MIN, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect(REPORT_006_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Minimum CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              data: {mode: MODE_MIN, usage: 70.12, min: 0, max: 50},
              severity: ERROR,
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });

    describe('when run against multiple files', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH], {
              severity: INFO
            }),
            'to complete with value satisfying',
            {
              message:
                'Minimum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_MIN, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        beforeEach(function() {
          inspect = createInspect('../../src/rules/cpu-usage.js', {
            mode: MODE_MIN,
            min: 10
          });
        });

        it('should report "error" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH]),
            'to complete with value satisfying',
            {
              message:
                'Minimum CPU consumption percent (6.12%) is outside the allowed range of 10-50%',
              data: {mode: MODE_MIN, usage: 6.12, min: 10, max: 50},
              severity: ERROR,
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });
    });
  });

  describe(`mode: ${MODE_MAX}`, function() {
    beforeEach(function() {
      inspect = createInspect('../../src/rules/cpu-usage.js', {mode: MODE_MAX});
    });

    describe('when run against a single file', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect(REPORT_001_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Maximum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_MAX, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect(REPORT_006_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Maximum CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              data: {mode: MODE_MAX, usage: 70.12, min: 0, max: 50},
              severity: ERROR,
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });

    describe('when run against multiple files', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_002_FILEPATH], {
              severity: INFO
            }),
            'to complete with value satisfying',
            {
              message:
                'Maximum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_MAX, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        beforeEach(function() {
          inspect = createInspect('../../src/rules/cpu-usage.js', {
            mode: MODE_MAX
          });
        });

        it('should report "error" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH]),
            'to complete with value satisfying',
            {
              message:
                'Maximum CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              data: {mode: MODE_MAX, usage: 70.12, min: 0, max: 50},
              severity: ERROR,
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });
    });
  });

  describe(`mode: ${MODE_ALL}`, function() {
    beforeEach(function() {
      inspect = createInspect('../../src/rules/cpu-usage.js', {mode: MODE_ALL});
    });

    describe('when run against a single file', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect(REPORT_001_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Report CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_ALL, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect(REPORT_006_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Report CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              data: {mode: MODE_ALL, usage: 70.12, min: 0, max: 50},
              severity: ERROR,
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });

    describe('when run against multiple files', function() {
      describe('when cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_002_FILEPATH], {
              severity: INFO
            }),
            'to complete with values satisfying',
            {
              message:
                'Report CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_ALL, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            },
            {
              message:
                'Report CPU consumption percent (0%) is within the allowed range of 0-50%',
              data: {mode: MODE_ALL, usage: 0, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-002-library-mismatch\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH], {
              severity: INFO
            }),
            'to complete with values satisfying',
            {
              message:
                'Report CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              data: {mode: MODE_ALL, usage: 6.12, min: 0, max: 50},
              severity: INFO,
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            },
            {
              message:
                'Report CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              data: {mode: MODE_ALL, usage: 70.12, min: 0, max: 50},
              severity: ERROR,
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });
  });
});
