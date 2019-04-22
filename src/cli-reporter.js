import _ from 'lodash/fp';
import yurnalist from 'yurnalist';

export const reporter = yurnalist.createReporter();

export const tableHeader = _.map(header => reporter.format.dim(header));
