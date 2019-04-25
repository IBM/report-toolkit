export const kReportFilepath = Symbol('reportFilepath');

export class Report {
  constructor(report, filepath) {
    Object.assign(this, report);

    this[kReportFilepath] = filepath;
  }

  get filepath() {
    return this[kReportFilepath];
  }

  static create(report, filepath) {
    return Object.freeze(new Report(report, filepath));
  }
}
