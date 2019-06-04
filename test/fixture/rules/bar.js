const REPORT_001_FILEPATH = require.resolve('../reports/report-001.json');

exports.inspect = ({context}) => {
  if (context.filepath !== REPORT_001_FILEPATH) {
    return 'bar';
  }
};

exports.meta = {};
