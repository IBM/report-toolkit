const REPORT_001_FILEPATH = require.resolve('../reports/report-001.json');

exports.inspect = context => {
  if (context.filepath !== REPORT_001_FILEPATH) {
    context.report('bar');
  }
};

exports.meta = {};
