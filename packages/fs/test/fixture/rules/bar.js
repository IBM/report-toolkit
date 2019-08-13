const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-001.json'
);

export const inspect = () => context => {
  if (context.filepath !== REPORT_001_FILEPATH) {
    return 'bar';
  }
};

export const meta = {};

export const id = 'bar';
