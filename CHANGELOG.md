# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.6.0](https://github.com/ibm/report-toolkit/compare/v0.5.1...v0.6.0) (2020-02-25)

### Bug Fixes

- **cli:** audit & normalize allowed transformers for each command ([a1f106a](https://github.com/ibm/report-toolkit/commit/a1f106a592bbf70f13b82308baa637920f1b559a))
- **cli:** disable all transformers on redact cmd for simplicity ([b8c9c6d](https://github.com/ibm/report-toolkit/commit/b8c9c6dd4161b8d70bd402f391995b40830b79bd))
- **cli:** fix default width of "Op" field; closes [#38](https://github.com/ibm/report-toolkit/issues/38) ([e804be0](https://github.com/ibm/report-toolkit/commit/e804be0e24952f40420bbb167b96f83a13af9192))
- **cli:** fix wonky column calculation issues ([89f07d8](https://github.com/ibm/report-toolkit/commit/89f07d8394a9c29be2dd0e2c9d6b26ea4b068d7a))
- **cli:** half-fix req'd command ([23334c0](https://github.com/ibm/report-toolkit/commit/23334c0ad21b2bdb16673446ea9b05dddad50d07))
- **common:** config overhaul; closes [#47](https://github.com/ibm/report-toolkit/issues/47) ([513966a](https://github.com/ibm/report-toolkit/commit/513966a052076909b2d28d0735b9da8761a9757a))
- **core:** default config loads correctly ([2984c7f](https://github.com/ibm/report-toolkit/commit/2984c7f82e3a1c8c7b9b20beebb0885a42993272))
- **core:** fixed transformer options going missing ([1218f03](https://github.com/ibm/report-toolkit/commit/1218f03261166e0ca5e5a6b096871f812076b70c))
- **transformers:** filter only works with reports; closes [#79](https://github.com/ibm/report-toolkit/issues/79) ([8eccf9e](https://github.com/ibm/report-toolkit/commit/8eccf9e9950b9a67ea8964696be70ac07e9541e1))

### Features

- **fs:** search for config in usual places; closes [#83](https://github.com/ibm/report-toolkit/issues/83) ([b11a329](https://github.com/ibm/report-toolkit/commit/b11a3290296d16c51523d3cad13ebde8f353172f))

## [0.5.1](https://github.com/ibm/report-toolkit/compare/v0.5.0...v0.5.1) (2020-02-03)

### Bug Fixes

- **cli:** ensure user-supplied args override default transformer config ([a3e3d6a](https://github.com/ibm/report-toolkit/commit/a3e3d6ab2a70729c42e9c3c84ac708a80937d034))

# [0.5.0](https://github.com/ibm/report-toolkit/compare/v0.4.1...v0.5.0) (2020-01-31)

### Features

- **transformers:** numeric transformer dropped ([c81b6b0](https://github.com/ibm/report-toolkit/commit/c81b6b0c9c330fbe98991249769a93e96b559235)), closes [#74](https://github.com/ibm/report-toolkit/issues/74) [#75](https://github.com/ibm/report-toolkit/issues/75) [#75](https://github.com/ibm/report-toolkit/issues/75)

## [0.4.1](https://github.com/ibm/report-toolkit/compare/v0.4.0...v0.4.1) (2020-01-31)

**Note:** Version bump only for package report-toolkit-monorepo

# [0.4.0](https://github.com/ibm/report-toolkit/compare/v0.3.0...v0.4.0) (2020-01-30)

### Bug Fixes

- **cli:** Indicate that diff --all is mutually exclusive from -i and -x ([#72](https://github.com/ibm/report-toolkit/issues/72)) ([a5b5470](https://github.com/ibm/report-toolkit/commit/a5b54702340f5cf07d18f44ca775eb4d4b39cb99)), closes [#71](https://github.com/ibm/report-toolkit/issues/71)
- **cli:** more timeout fixes ([57f9017](https://github.com/ibm/report-toolkit/commit/57f901707357797b945bbe49b5635d2c15e8d6cf))
- **common:** add missing \_.isNumber ([1edf4cc](https://github.com/ibm/report-toolkit/commit/1edf4ccca3879a24334fde5b84935eb95cea776d))
- **common:** re-add libuv to default diff ([1204418](https://github.com/ibm/report-toolkit/commit/12044180c115e1f823fdfa2cc863aa0ec66bd55a))
- **diff:** rename 'path' to 'field' for consistency ([834ab9f](https://github.com/ibm/report-toolkit/commit/834ab9f7d8f4d4ea771e99b9d7eb1f3773c7e96f))
- **transformers:** fix bad newline unit test ([0ef74ae](https://github.com/ibm/report-toolkit/commit/0ef74aecfb7534fcbde44fa7dc9e77edb84c0639))
- **transformers:** fix filter transformer when used with diff ([077ce49](https://github.com/ibm/report-toolkit/commit/077ce49c90f978b9e53ee60599baca0102ff60e6))
- **transformers:** fix newline-delimited output ([8fcd836](https://github.com/ibm/report-toolkit/commit/8fcd836838ea4ca97dbdb1bfb4a95ae3c92ec6ef))
- **transformers:** type fixes for numeric transformer ([bbc9ceb](https://github.com/ibm/report-toolkit/commit/bbc9ceb624586fe1ee6b4e07ff20be5b80f9f1b1))

### Features

- **common:** redact Google Cloud and MS Azure secrets ([d2e7579](https://github.com/ibm/report-toolkit/commit/d2e757989ba6d581e1c348d91850261dcda3d543))

# [0.3.0](https://github.com/ibm/report-toolkit/compare/v0.2.3...v0.3.0) (2019-11-15)

### Features

- **redact:** redact cloud foundry env vars ([259203e](https://github.com/ibm/report-toolkit/commit/259203ea6ca0f9760291732cc36abfea27832810))

## [0.2.3](https://github.com/ibm/report-toolkit/compare/v0.2.2...v0.2.3) (2019-11-13)

### Bug Fixes

- correctly parse reports generated on win32 boxes; closes [#62](https://github.com/ibm/report-toolkit/issues/62) ([eaed969](https://github.com/ibm/report-toolkit/commit/eaed969f562c84ce26fefa2d08f5a88fdca576ce))

## [0.2.2](https://github.com/ibm/report-toolkit/compare/v0.2.1...v0.2.2) (2019-11-13)

### Bug Fixes

- corrects exception on diff command and removes redundant share operator ([#63](https://github.com/ibm/report-toolkit/issues/63)) ([fe0d799](https://github.com/ibm/report-toolkit/commit/fe0d79949c19234fa3c9ba75c19b149713929b50)), closes [#61](https://github.com/ibm/report-toolkit/issues/61)

## [0.2.1](https://github.com/ibm/report-toolkit/compare/v0.2.0...v0.2.1) (2019-11-07)

### Bug Fixes

- **common:** ensure fromAny emits in order ([34d5a6a](https://github.com/ibm/report-toolkit/commit/34d5a6a2fbdcaed74a3c14a9e58eb90b67e68009))
- **inspect:** reduce default severity to WARNING; closes [#60](https://github.com/ibm/report-toolkit/issues/60) ([1d85bd5](https://github.com/ibm/report-toolkit/commit/1d85bd5b311d694f1724489054ddd30e342d9eac))

# [0.2.0](https://github.com/ibm/report-toolkit/compare/v0.1.3...v0.2.0) (2019-10-25)

### Bug Fixes

- do not use array-type cli options; closes [#59](https://github.com/ibm/report-toolkit/issues/59) ([e86ee5c](https://github.com/ibm/report-toolkit/commit/e86ee5cf73e97ce052be23d771c3a5e20a1ed911))

### Features

- **inspect:** add "memory-usage" rule to recommended config ([c11a2ff](https://github.com/ibm/report-toolkit/commit/c11a2ff83552025d8493bd7ad6d163a941f15c30))

## [0.1.3](https://github.com/ibm/report-toolkit/compare/v0.1.2...v0.1.3) (2019-10-17)

### Bug Fixes

- add missing publishConfig to transformers ([353a04f](https://github.com/ibm/report-toolkit/commit/353a04f3e64f62a308fbede756fc40efa4a39a8e))
- missing shebang ([77f8c1f](https://github.com/ibm/report-toolkit/commit/77f8c1f2287ec8b4d4cbfefe446305592f6e7fde))

## [0.1.2](https://github.com/ibm/report-toolkit/compare/v0.1.1...v0.1.2) (2019-10-17)

**Note:** Version bump only for package report-toolkit-monorepo

## [0.1.1](https://github.com/ibm/report-toolkit/compare/v0.1.0...v0.1.1) (2019-10-17)

**Note:** Version bump only for package report-toolkit-monorepo

# 0.1.0 (2019-10-17)

### Bug Fixes

- **dev:** fix broken jsconfig.json ([390e568](https://github.com/ibm/report-toolkit/commit/390e5687e87674522ed57e7064a3938d8bc3e6f3))
- use nightly typescript ([6f1ff2e](https://github.com/ibm/report-toolkit/commit/6f1ff2ec07550954dcc919a19af532e99eb85478))
- **core:** refactor some stuff into an 'internal' module; closes [#32](https://github.com/ibm/report-toolkit/issues/32) ([90d0dea](https://github.com/ibm/report-toolkit/commit/90d0deafe1cb2e5e1d70dcf2859a64f137d67474))
- support third-party rules ([2d68eaf](https://github.com/ibm/report-toolkit/commit/2d68eafb302eff8dd506d562bca3762bba4c91c3)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
- **ci:** disable mirror for now ([43f6175](https://github.com/ibm/report-toolkit/commit/43f617522186e594fb0aafa53fb4b1710127b4c5))
- **ci:** fix another bad prop ([8a3e8bf](https://github.com/ibm/report-toolkit/commit/8a3e8bff38ca82dc5c16ba72fdf9de7564727a79))
- **ci:** fix another bad prop, again ([b835ee1](https://github.com/ibm/report-toolkit/commit/b835ee1743a90520b9920073f36dd6f12334b452))
- **ci:** fix bad prop ([fde8f4f](https://github.com/ibm/report-toolkit/commit/fde8f4f457fd057d789c7fa29b057217e06257af))
- **ci:** fix yet another bad prop ([895f7d5](https://github.com/ibm/report-toolkit/commit/895f7d58f32eb185158d6b79eacd37ec62d186ce))
- **ci:** try to run workflow mirror-action fork directly ([cb91414](https://github.com/ibm/report-toolkit/commit/cb91414cfa6af64e66c9617e874fe6e7c0008a66))
- fix config loading pipeline; closes [#27](https://github.com/ibm/report-toolkit/issues/27) ([2bca4a2](https://github.com/ibm/report-toolkit/commit/2bca4a21eef9d2343bee1c7eb3e28ddc7f44603a))
- **cli:** ensure stack-hash transformer works on CLI ([6f950ef](https://github.com/ibm/report-toolkit/commit/6f950efed160e67b32a01e77f9dc529b0739e656))
- **cli:** remove errant chars in table formatter; closes [#1](https://github.com/ibm/report-toolkit/issues/1) ([26919ea](https://github.com/ibm/report-toolkit/commit/26919ea9d289b1b55af114a58b64fb174563ba1a))
- **cli:** use proper exports from transform ([6c1fcaf](https://github.com/ibm/report-toolkit/commit/6c1fcafd90c1def74f38d586671f7bc13793d5b6))
- **common:** debug was memoizing too much ([b336561](https://github.com/ibm/report-toolkit/commit/b3365614e73e35db7229cf785c0de4b87cb0bf8d))
- **common:** fix bug introduced by cab080aa9377d4e86e3076a627f413eb18f4499e ([7301ed5](https://github.com/ibm/report-toolkit/commit/7301ed58a22a9ebe2053a3b911ba82526dccc29a))
- **common:** rename GnosticError to RTkError; closes [#20](https://github.com/ibm/report-toolkit/issues/20) ([6d7b952](https://github.com/ibm/report-toolkit/commit/6d7b95292aece55bd6cc4ace4e0a34f167db6d47))
- **inspector:** correct filepath cross-references in aggregate messages; closes [#18](https://github.com/ibm/report-toolkit/issues/18) ([dd81537](https://github.com/ibm/report-toolkit/commit/dd815375b2b4b7062039401caed4f124249fbcb5)), closes [#19](https://github.com/ibm/report-toolkit/issues/19)
- **pkg:** linting/tests were broken ([9dc9ec6](https://github.com/ibm/report-toolkit/commit/9dc9ec662f4c688cf4eb7fb53839a3267f037539))
- **pkg:** move resolve-pkg out of fs and into to devDeps of root ([abaea50](https://github.com/ibm/report-toolkit/commit/abaea506a7d3142eadb5319242a0883ba8bacf8f))
- **rules:** fix rules-helper ([ba5b3ec](https://github.com/ibm/report-toolkit/commit/ba5b3ecb08925a5bbd22dfdab3ec0763e5fa6ff6))
- **transformers:** fix cli test ([9510451](https://github.com/ibm/report-toolkit/commit/9510451de7dbe53cf151af209b061922e160b5b1))
- export RC_FILENAME, RC_NAMESPACE ([9710c0e](https://github.com/ibm/report-toolkit/commit/9710c0e923b1c29ad8ca052307abc40650c214ca))
- rename config files; refs [#20](https://github.com/ibm/report-toolkit/issues/20) ([ff67024](https://github.com/ibm/report-toolkit/commit/ff6702495bdae5a20b51ab48a9fa32dd5154e61a))
- rename packages/gnostic to packages/report-toolkit ([da6ec8a](https://github.com/ibm/report-toolkit/commit/da6ec8a31d520346b29b34ddd0c8da5512915b19))
- **redact:** add 'whitelist' option to redact; closes [#15](https://github.com/ibm/report-toolkit/issues/15) ([40c7ee8](https://github.com/ibm/report-toolkit/commit/40c7ee8691c1ccff40be789e42d00fa867ec7744))

### Features

- **docs:** add Breadcrumbs, Metadata & EmbedCode components for mdx ([a469109](https://github.com/ibm/report-toolkit/commit/a469109355105c341364295714c192c67fd0e173))
- **redact:** add --replace. needs tests bad ([0618fae](https://github.com/ibm/report-toolkit/commit/0618fae9bd2338ca9651315b91b4f70c7497bf9f))
- external plugin and rule-loading (WIP) ([d47df0a](https://github.com/ibm/report-toolkit/commit/d47df0a8dfef1419b5e019d74ec4019dca53e4ac)), closes [#32](https://github.com/ibm/report-toolkit/issues/32)
- **transformer:** add filter transformer ([458b585](https://github.com/ibm/report-toolkit/commit/458b5859cd065cd0859d0b89f49dcae7432c29ce))
- **transformers:** add stack-hash transformer; closes [#2](https://github.com/ibm/report-toolkit/issues/2) ([82e7332](https://github.com/ibm/report-toolkit/commit/82e73328551a8408dbe2963a3bb6d55b21ecf8ce))
