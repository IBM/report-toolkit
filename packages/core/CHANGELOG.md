# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.1](https://github.com/ibm/report-toolkit/compare/v0.6.0...v0.6.1) (2021-01-11)

### Bug Fixes

- **core:** rules do not run when told not to run; closes [#102](https://github.com/ibm/report-toolkit/issues/102) ([61b3b62](https://github.com/ibm/report-toolkit/commit/61b3b6238b2c5a734dffae6359e567a6ca41b0db))
- **diff:** update json-ptr due to semver violation in v1.3.x ([05deae8](https://github.com/ibm/report-toolkit/commit/05deae8cf0eeaa51d96c66a6c926b724e6e3a0d7))

# [0.6.0](https://github.com/ibm/report-toolkit/compare/v0.5.1...v0.6.0) (2020-02-25)

### Bug Fixes

- **cli:** audit & normalize allowed transformers for each command ([a1f106a](https://github.com/ibm/report-toolkit/commit/a1f106a592bbf70f13b82308baa637920f1b559a))
- **common:** config overhaul; closes [#47](https://github.com/ibm/report-toolkit/issues/47) ([513966a](https://github.com/ibm/report-toolkit/commit/513966a052076909b2d28d0735b9da8761a9757a))
- **core:** default config loads correctly ([2984c7f](https://github.com/ibm/report-toolkit/commit/2984c7f82e3a1c8c7b9b20beebb0885a42993272))
- **core:** fixed transformer options going missing ([1218f03](https://github.com/ibm/report-toolkit/commit/1218f03261166e0ca5e5a6b096871f812076b70c))

## [0.5.1](https://github.com/ibm/report-toolkit/compare/v0.5.0...v0.5.1) (2020-02-03)

**Note:** Version bump only for package @report-toolkit/core

# [0.5.0](https://github.com/ibm/report-toolkit/compare/v0.4.1...v0.5.0) (2020-01-31)

**Note:** Version bump only for package @report-toolkit/core

## [0.4.1](https://github.com/ibm/report-toolkit/compare/v0.4.0...v0.4.1) (2020-01-31)

**Note:** Version bump only for package @report-toolkit/core

# [0.4.0](https://github.com/ibm/report-toolkit/compare/v0.3.0...v0.4.0) (2020-01-30)

### Bug Fixes

- **diff:** rename 'path' to 'field' for consistency ([834ab9f](https://github.com/ibm/report-toolkit/commit/834ab9f7d8f4d4ea771e99b9d7eb1f3773c7e96f))
- **transformers:** fix filter transformer when used with diff ([077ce49](https://github.com/ibm/report-toolkit/commit/077ce49c90f978b9e53ee60599baca0102ff60e6))

# [0.3.0](https://github.com/ibm/report-toolkit/compare/v0.2.3...v0.3.0) (2019-11-15)

**Note:** Version bump only for package @report-toolkit/core

## [0.2.3](https://github.com/ibm/report-toolkit/compare/v0.2.2...v0.2.3) (2019-11-13)

**Note:** Version bump only for package @report-toolkit/core

## [0.2.2](https://github.com/ibm/report-toolkit/compare/v0.2.1...v0.2.2) (2019-11-13)

**Note:** Version bump only for package @report-toolkit/core

## [0.2.1](https://github.com/ibm/report-toolkit/compare/v0.2.0...v0.2.1) (2019-11-07)

### Bug Fixes

- **inspect:** reduce default severity to WARNING; closes [#60](https://github.com/ibm/report-toolkit/issues/60) ([1d85bd5](https://github.com/ibm/report-toolkit/commit/1d85bd5b311d694f1724489054ddd30e342d9eac))

# [0.2.0](https://github.com/ibm/report-toolkit/compare/v0.1.3...v0.2.0) (2019-10-25)

**Note:** Version bump only for package @report-toolkit/core

## [0.1.3](https://github.com/ibm/report-toolkit/compare/v0.1.2...v0.1.3) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/core

## [0.1.2](https://github.com/ibm/report-toolkit/compare/v0.1.1...v0.1.2) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/core

## [0.1.1](https://github.com/ibm/report-toolkit/compare/v0.1.0...v0.1.1) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/core

# 0.1.0 (2019-10-17)

### Bug Fixes

- **core:** refactor some stuff into an 'internal' module; closes [#32](https://github.com/ibm/report-toolkit/issues/32) ([90d0dea](https://github.com/ibm/report-toolkit/commit/90d0deafe1cb2e5e1d70dcf2859a64f137d67474))
- fix config loading pipeline; closes [#27](https://github.com/ibm/report-toolkit/issues/27) ([2bca4a2](https://github.com/ibm/report-toolkit/commit/2bca4a21eef9d2343bee1c7eb3e28ddc7f44603a))
- support third-party rules ([2d68eaf](https://github.com/ibm/report-toolkit/commit/2d68eafb302eff8dd506d562bca3762bba4c91c3)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
- **common:** rename GnosticError to RTkError; closes [#20](https://github.com/ibm/report-toolkit/issues/20) ([6d7b952](https://github.com/ibm/report-toolkit/commit/6d7b95292aece55bd6cc4ace4e0a34f167db6d47))
- **inspector:** correct filepath cross-references in aggregate messages; closes [#18](https://github.com/ibm/report-toolkit/issues/18) ([dd81537](https://github.com/ibm/report-toolkit/commit/dd815375b2b4b7062039401caed4f124249fbcb5)), closes [#19](https://github.com/ibm/report-toolkit/issues/19)
- **pkg:** linting/tests were broken ([9dc9ec6](https://github.com/ibm/report-toolkit/commit/9dc9ec662f4c688cf4eb7fb53839a3267f037539))

### Features

- external plugin and rule-loading (WIP) ([d47df0a](https://github.com/ibm/report-toolkit/commit/d47df0a8dfef1419b5e019d74ec4019dca53e4ac)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
