# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
