# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.1](https://github.com/ibm/report-toolkit/compare/v0.6.0...v0.6.1) (2021-01-11)

### Bug Fixes

- **diff:** update json-ptr due to semver violation in v1.3.x ([05deae8](https://github.com/ibm/report-toolkit/commit/05deae8cf0eeaa51d96c66a6c926b724e6e3a0d7))

### Features

- **common:** support for diagnostic reports v2 ([d5a4739](https://github.com/ibm/report-toolkit/commit/d5a47397d5e875f75b27b23c80809038bbffc9c8))

# [0.6.0](https://github.com/ibm/report-toolkit/compare/v0.5.1...v0.6.0) (2020-02-25)

### Bug Fixes

- **common:** config overhaul; closes [#47](https://github.com/ibm/report-toolkit/issues/47) ([513966a](https://github.com/ibm/report-toolkit/commit/513966a052076909b2d28d0735b9da8761a9757a))
- **core:** default config loads correctly ([2984c7f](https://github.com/ibm/report-toolkit/commit/2984c7f82e3a1c8c7b9b20beebb0885a42993272))

## [0.5.1](https://github.com/ibm/report-toolkit/compare/v0.5.0...v0.5.1) (2020-02-03)

### Bug Fixes

- **cli:** ensure user-supplied args override default transformer config ([a3e3d6a](https://github.com/ibm/report-toolkit/commit/a3e3d6ab2a70729c42e9c3c84ac708a80937d034))

# [0.5.0](https://github.com/ibm/report-toolkit/compare/v0.4.1...v0.5.0) (2020-01-31)

**Note:** Version bump only for package @report-toolkit/common

# [0.4.0](https://github.com/ibm/report-toolkit/compare/v0.3.0...v0.4.0) (2020-01-30)

### Bug Fixes

- **common:** add missing \_.isNumber ([1edf4cc](https://github.com/ibm/report-toolkit/commit/1edf4ccca3879a24334fde5b84935eb95cea776d))
- **common:** re-add libuv to default diff ([1204418](https://github.com/ibm/report-toolkit/commit/12044180c115e1f823fdfa2cc863aa0ec66bd55a))
- **diff:** rename 'path' to 'field' for consistency ([834ab9f](https://github.com/ibm/report-toolkit/commit/834ab9f7d8f4d4ea771e99b9d7eb1f3773c7e96f))

### Features

- **common:** redact Google Cloud and MS Azure secrets ([d2e7579](https://github.com/ibm/report-toolkit/commit/d2e757989ba6d581e1c348d91850261dcda3d543))

# [0.3.0](https://github.com/ibm/report-toolkit/compare/v0.2.3...v0.3.0) (2019-11-15)

### Features

- **redact:** redact cloud foundry env vars ([259203e](https://github.com/ibm/report-toolkit/commit/259203ea6ca0f9760291732cc36abfea27832810))

## [0.2.3](https://github.com/ibm/report-toolkit/compare/v0.2.2...v0.2.3) (2019-11-13)

### Bug Fixes

- correctly parse reports generated on win32 boxes; closes [#62](https://github.com/ibm/report-toolkit/issues/62) ([eaed969](https://github.com/ibm/report-toolkit/commit/eaed969f562c84ce26fefa2d08f5a88fdca576ce))

## [0.2.2](https://github.com/ibm/report-toolkit/compare/v0.2.1...v0.2.2) (2019-11-13)

**Note:** Version bump only for package @report-toolkit/common

## [0.2.1](https://github.com/ibm/report-toolkit/compare/v0.2.0...v0.2.1) (2019-11-07)

### Bug Fixes

- **common:** ensure fromAny emits in order ([34d5a6a](https://github.com/ibm/report-toolkit/commit/34d5a6a2fbdcaed74a3c14a9e58eb90b67e68009))
- **inspect:** reduce default severity to WARNING; closes [#60](https://github.com/ibm/report-toolkit/issues/60) ([1d85bd5](https://github.com/ibm/report-toolkit/commit/1d85bd5b311d694f1724489054ddd30e342d9eac))

# [0.2.0](https://github.com/ibm/report-toolkit/compare/v0.1.3...v0.2.0) (2019-10-25)

**Note:** Version bump only for package @report-toolkit/common

## [0.1.2](https://github.com/ibm/report-toolkit/compare/v0.1.1...v0.1.2) (2019-10-17)

**Note:** Version bump only for package @report-toolkit/common

# 0.1.0 (2019-10-17)

### Bug Fixes

- fix config loading pipeline; closes [#27](https://github.com/ibm/report-toolkit/issues/27) ([2bca4a2](https://github.com/ibm/report-toolkit/commit/2bca4a21eef9d2343bee1c7eb3e28ddc7f44603a))
- support third-party rules ([2d68eaf](https://github.com/ibm/report-toolkit/commit/2d68eafb302eff8dd506d562bca3762bba4c91c3)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
- **common:** debug was memoizing too much ([b336561](https://github.com/ibm/report-toolkit/commit/b3365614e73e35db7229cf785c0de4b87cb0bf8d))
- **common:** fix bug introduced by cab080aa9377d4e86e3076a627f413eb18f4499e ([7301ed5](https://github.com/ibm/report-toolkit/commit/7301ed58a22a9ebe2053a3b911ba82526dccc29a))
- rename config files; refs [#20](https://github.com/ibm/report-toolkit/issues/20) ([ff67024](https://github.com/ibm/report-toolkit/commit/ff6702495bdae5a20b51ab48a9fa32dd5154e61a))
- **common:** rename GnosticError to RTkError; closes [#20](https://github.com/ibm/report-toolkit/issues/20) ([6d7b952](https://github.com/ibm/report-toolkit/commit/6d7b95292aece55bd6cc4ace4e0a34f167db6d47))
- **inspector:** correct filepath cross-references in aggregate messages; closes [#18](https://github.com/ibm/report-toolkit/issues/18) ([dd81537](https://github.com/ibm/report-toolkit/commit/dd815375b2b4b7062039401caed4f124249fbcb5)), closes [#19](https://github.com/ibm/report-toolkit/issues/19)
- **pkg:** linting/tests were broken ([9dc9ec6](https://github.com/ibm/report-toolkit/commit/9dc9ec662f4c688cf4eb7fb53839a3267f037539))
- **redact:** add 'whitelist' option to redact; closes [#15](https://github.com/ibm/report-toolkit/issues/15) ([40c7ee8](https://github.com/ibm/report-toolkit/commit/40c7ee8691c1ccff40be789e42d00fa867ec7744))

### Features

- external plugin and rule-loading (WIP) ([d47df0a](https://github.com/ibm/report-toolkit/commit/d47df0a8dfef1419b5e019d74ec4019dca53e4ac)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
- **transformer:** add filter transformer ([458b585](https://github.com/ibm/report-toolkit/commit/458b5859cd065cd0859d0b89f49dcae7432c29ce))
- **transformers:** add stack-hash transformer; closes [#2](https://github.com/ibm/report-toolkit/issues/2) ([82e7332](https://github.com/ibm/report-toolkit/commit/82e73328551a8408dbe2963a3bb6d55b21ecf8ce))
