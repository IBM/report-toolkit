import {ERROR, INFO, WARNING} from '@report-toolkit/common/src/constants.js';

import {meta} from '../../src/rules/cpu-usage.js';
import {createInspect} from './rules-helper.js';

const {MODE_ALL, MODE_MAX, MODE_MEAN, MODE_MIN} = meta.constants;

const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-001.json'
);
const REPORT_002_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json'
);
const REPORT_006_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-006-cpu-usage.json'
);
const REPORT_008_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-008-cpu-usage-no-cpus.json'
);
const REPORT_009_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-009-cpu-usage-multicore.json'
);

describe('@report-toolkit/rules:cpu-usage', function() {
  let inspect;

  describe('when "header.cpus" prop missing', function() {
    beforeEach(function() {
      inspect = createInspect('../../src/rules/cpu-usage.js');
    });

    describe('when run against a single file', function() {
      it('should report "warning" message', function() {
        return expect(
          inspect(REPORT_008_FILEPATH),
          'to complete with value satisfying',
          {
            filepath: /fixture\/reports\/report-008-cpu-usage-no-cpus\.json/,
            id: 'cpu-usage',
            message: /Property "header.cpus" missing in report at .+\/fixture\/reports\/report-008-cpu-usage-no-cpus\.json; cannot compute CPU usage\./,
            originalError: {
              message: /Property "header.cpus" missing in report at .+\/fixture\/reports\/report-008-cpu-usage-no-cpus\.json; cannot compute CPU usage\./
            },
            severity: WARNING
          }
        );
      });
    });

    describe('when run against multiple files', function() {
      it('should report a "warning" message and an "info" message', function() {
        return expect(
          inspect([REPORT_008_FILEPATH, REPORT_001_FILEPATH]),
          'to complete with values satisfying',
          {
            filepath: /fixture\/reports\/report-008-cpu-usage-no-cpus\.json/,
            id: 'cpu-usage',
            message: /Property "header.cpus" missing in report at .+\/fixture\/reports\/report-008-cpu-usage-no-cpus\.json; cannot compute CPU usage\./,
            originalError: {
              message: /Property "header.cpus" missing in report at .+\/fixture\/reports\/report-008-cpu-usage-no-cpus\.json; cannot compute CPU usage\./
            },
            severity: WARNING
          },
          {
            data: {max: 50, min: 0, mode: MODE_MEAN, usage: 6.12},
            filepath: /fixture\/reports\/report-001\.json/,
            id: 'cpu-usage',
            message:
              'Mean CPU consumption percent (6.12%) is within the allowed range of 0-50%',
            severity: INFO
          }
        );
      });
    });
  });

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
              data: {max: 50, min: 0, mode: MODE_MEAN, usage: 6.12},
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage',
              message:
                'Mean CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 50, min: 0, mode: MODE_MEAN, usage: 70.12},
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage',
              message:
                'Mean CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              severity: ERROR
            }
          );
        });

        describe('when multiple CPU cores are present', function() {
          it('should adjust the limit accordingly', function() {
            return expect(
              inspect(REPORT_009_FILEPATH),
              'to complete with value satisfying',
              {
                data: {max: 50, min: 0, mode: MODE_MEAN, usage: 35.06},
                filepath: /fixture\/reports\/report-009-cpu-usage-multicore\.json/,
                id: 'cpu-usage',
                message:
                  'Mean CPU consumption percent (35.06%) is within the allowed range of 0-50%',
                severity: INFO
              }
            );
          });
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
              data: {max: 50, min: 0, mode: MODE_MEAN, usage: 38.12},
              filepath: '(multiple files)',
              id: 'cpu-usage',
              message:
                'Mean CPU consumption percent (38.12%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 30, min: 0, mode: MODE_MEAN, usage: 38.12},
              filepath: '(multiple files)',
              id: 'cpu-usage',
              message:
                'Mean CPU consumption percent (38.12%) is outside the allowed range of 0-30%',
              severity: ERROR
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
              data: {max: 50, min: 0, mode: MODE_MIN, usage: 6.12},
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage',
              message:
                'Minimum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 50, min: 0, mode: MODE_MIN, usage: 70.12},
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage',
              message:
                'Minimum CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              severity: ERROR
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
              data: {max: 50, min: 0, mode: MODE_MIN, usage: 6.12},
              filepath: '(multiple files)',
              id: 'cpu-usage',
              message:
                'Minimum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
            }
          );
        });
      });

      describe('when cpu usage not within allowed limits', function() {
        beforeEach(function() {
          inspect = createInspect('../../src/rules/cpu-usage.js', {
            min: 10,
            mode: MODE_MIN
          });
        });

        it('should report "error" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH]),
            'to complete with value satisfying',
            {
              data: {max: 50, min: 10, mode: MODE_MIN, usage: 6.12},
              filepath: '(multiple files)',
              id: 'cpu-usage',
              message:
                'Minimum CPU consumption percent (6.12%) is outside the allowed range of 10-50%',
              severity: ERROR
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
              data: {max: 50, min: 0, mode: MODE_MAX, usage: 6.12},
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage',
              message:
                'Maximum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 50, min: 0, mode: MODE_MAX, usage: 70.12},
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage',
              message:
                'Maximum CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              severity: ERROR
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
              data: {max: 50, min: 0, mode: MODE_MAX, usage: 6.12},
              filepath: '(multiple files)',
              id: 'cpu-usage',
              message:
                'Maximum CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 50, min: 0, mode: MODE_MAX, usage: 70.12},
              filepath: '(multiple files)',
              id: 'cpu-usage',
              message:
                'Maximum CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              severity: ERROR
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
              data: {max: 50, min: 0, mode: MODE_ALL, usage: 6.12},
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage',
              message:
                'Report CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 50, min: 0, mode: MODE_ALL, usage: 70.12},
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage',
              message:
                'Report CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              severity: ERROR
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
              data: {max: 50, min: 0, mode: MODE_ALL, usage: 6.12},
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage',
              message:
                'Report CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
            },
            {
              data: {max: 50, min: 0, mode: MODE_ALL, usage: 0},
              filepath: /fixture\/reports\/report-002-library-mismatch\.json/,
              id: 'cpu-usage',
              message:
                'Report CPU consumption percent (0%) is within the allowed range of 0-50%',
              severity: INFO
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
              data: {max: 50, min: 0, mode: MODE_ALL, usage: 6.12},
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage',
              message:
                'Report CPU consumption percent (6.12%) is within the allowed range of 0-50%',
              severity: INFO
            },
            {
              data: {max: 50, min: 0, mode: MODE_ALL, usage: 70.12},
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage',
              message:
                'Report CPU consumption percent (70.12%) is outside the allowed range of 0-50%',
              severity: ERROR
            }
          );
        });
      });
    });
  });
});
