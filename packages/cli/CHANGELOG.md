# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.4.0](https://github.com/ibm/report-toolkit/compare/v0.3.0...v0.4.0) (2020-01-30)

### Bug Fixes

- **cli:** Indicate that diff --all is mutually exclusive from -i and -x ([#72](https://github.com/ibm/report-toolkit/issues/72)) ([a5b5470](https://github.com/ibm/report-toolkit/commit/a5b54702340f5cf07d18f44ca775eb4d4b39cb99)), closes [#71](https://github.com/ibm/report-toolkit/issues/71)
- **cli:** more timeout fixes ([57f9017](https://github.com/ibm/report-toolkit/commit/57f901707357797b945bbe49b5635d2c15e8d6cf))
- **diff:** rename 'path' to 'field' for consistency ([834ab9f](https://github.com/ibm/report-toolkit/commit/834ab9f7d8f4d4ea771e99b9d7eb1f3773c7e96f))
- **transformers:** fix filter transformer when used with diff ([077ce49](https://github.com/ibm/report-toolkit/commit/077ce49c90f978b9e53ee60599baca0102ff60e6))

# [0.3.0](https://github.com/ibm/report-toolkit/compare/v0.2.3...v0.3.0) (2019-11-15)

**Note:** Version bump only for package @report-toolkit/cli

## [0.2.3](https://github.com/ibm/report-toolkit/compare/v0.2.2...v0.2.3) (2019-11-13)

**Note:** Version bump only for package @report-toolkit/cli

## [0.2.2](https://github.com/ibm/report-toolkit/compare/v0.2.1...v0.2.2) (2019-11-13)

### Bug Fixes

- corrects exception on diff command and removes redundant share operator ([#63](https://github.com/ibm/report-toolkit/issues/63)) ([fe0d799](https://github.com/ibm/report-toolkit/commit/fe0d79949c19234fa3c9ba75c19b149713929b50)), closes [#61](https://github.com/ibm/report-toolkit/issues/61)

## [0.2.1](https://github.com/ibm/report-toolkit/compare/v0.2.0...v0.2.1) (2019-11-07)

### Bug Fixes

- **inspect:** reduce default severity to WARNING; closes [#60](https://github.com/ibm/report-toolkit/issues/60) ([1d85bd5](https://github.com/ibm/report-toolkit/commit/1d85bd5b311d694f1724489054ddd30e342d9eac))

# [0.2.0](https://github.com/ibm/report-toolkit/compare/v0.1.3...v0.2.0) (2019-10-25)

### Bug Fixes

- do not use array-type cli options; closes [#59](https://github.com/ibm/report-toolkit/issues/59) ([e86ee5c](https://github.com/ibm/report-toolkit/commit/e86ee5cf73e97ce052be23d771c3a5e20a1ed911))

## [0.1.3](https://github.com/ibm/report-toolkit/compare/v0.1.2...v0.1.3) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/cli

## [0.1.2](https://github.com/ibm/report-toolkit/compare/v0.1.1...v0.1.2) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/cli

## [0.1.1](https://github.com/ibm/report-toolkit/compare/v0.1.0...v0.1.1) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/cli

# 0.1.0 (2019-10-17)

### Bug Fixes

- export RC_FILENAME, RC_NAMESPACE ([9710c0e](https://github.com/ibm/report-toolkit/commit/9710c0e923b1c29ad8ca052307abc40650c214ca))
- fix config loading pipeline; closes [#27](https://github.com/ibm/report-toolkit/issues/27) ([2bca4a2](https://github.com/ibm/report-toolkit/commit/2bca4a21eef9d2343bee1c7eb3e28ddc7f44603a))
- **cli:** ensure stack-hash transformer works on CLI ([6f950ef](https://github.com/ibm/report-toolkit/commit/6f950efed160e67b32a01e77f9dc529b0739e656))
- **cli:** remove errant chars in table formatter; closes [#1](https://github.com/ibm/report-toolkit/issues/1) ([26919ea](https://github.com/ibm/report-toolkit/commit/26919ea9d289b1b55af114a58b64fb174563ba1a))
- **cli:** use proper exports from transform ([6c1fcaf](https://github.com/ibm/report-toolkit/commit/6c1fcafd90c1def74f38d586671f7bc13793d5b6))
- **common:** fix bug introduced by cab080aa9377d4e86e3076a627f413eb18f4499e ([7301ed5](https://github.com/ibm/report-toolkit/commit/7301ed58a22a9ebe2053a3b911ba82526dccc29a))
- **common:** rename GnosticError to RTkError; closes [#20](https://github.com/ibm/report-toolkit/issues/20) ([6d7b952](https://github.com/ibm/report-toolkit/commit/6d7b95292aece55bd6cc4ace4e0a34f167db6d47))
- **inspector:** correct filepath cross-references in aggregate messages; closes [#18](https://github.com/ibm/report-toolkit/issues/18) ([dd81537](https://github.com/ibm/report-toolkit/commit/dd815375b2b4b7062039401caed4f124249fbcb5)), closes [#19](https://github.com/ibm/report-toolkit/issues/19)
- **pkg:** linting/tests were broken ([9dc9ec6](https://github.com/ibm/report-toolkit/commit/9dc9ec662f4c688cf4eb7fb53839a3267f037539))

### Features

- **redact:** add --replace. needs tests bad ([0618fae](https://github.com/ibm/report-toolkit/commit/0618fae9bd2338ca9651315b91b4f70c7497bf9f))
- external plugin and rule-loading (WIP) ([d47df0a](https://github.com/ibm/report-toolkit/commit/d47df0a8dfef1419b5e019d74ec4019dca53e4ac)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
- **transformer:** add filter transformer ([458b585](https://github.com/ibm/report-toolkit/commit/458b5859cd065cd0859d0b89f49dcae7432c29ce))
