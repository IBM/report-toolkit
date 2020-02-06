# What's What

> Hi, you've found the source code.

`report-toolkit` is a monorepo, powered by [Lerna](https://lerna.js.org).

The package located in [the project root](https://github.com/IBM/report-toolkit) is in fact _not_ published to npm, and is only used for development.

_This_ directory (`packages/`) contains all of the "workspaces" which `report-toolkit` project is built from.

### Directory-to-npm-Package Map

> _Current as of 2020-02-05_

- `cli/` ([@report-toolkit/cli](https://npm.im/@report-toolkit/cli)): CLI for `report-toolkit`
- `common/` ([@report-toolkit/common](https://npm.im/@report-toolkit/common)): Common modules & utils
- `config/` ([@report-toolkit/config](https://npm.im/@report-toolkit/config)): Low-level configuration handling
- `core/` ([@report-toolkit/core](https://npm.im/@report-toolkit/core)): Main, high-level API
- `diff/` ([@report-toolkit/diff](https://npm.im/@report-toolkit/diff)): Low-level "diff" API
- `docs/` (_not published_): Gatsby site; sources for [https://ibm.github.io/report-toolkit](https://ibm.github.io/report-toolkit)
- `fs/` ([@report-toolkit/fs](https://npm.im/@report-toolkit/fs)): Filesystem interactions
- `inspector/` ([@report-toolkit/inspector](https://npm.im/@report-toolkit/inspector)): Low-level "inspector" API
- `report-toolkit/` ([report-toolkit](https://npm.im/report-toolkit)): Metapackage; pulls in all other published packages
- `transformers/` ([@report-toolkit/transformers](https://npm.im/@report-toolkit/transformers)): Low-level "transformer" API

## OK THX. WHERE ARE THE DOCS

Depends.

The API docs are automatically generated from sources, and can be viewed at [https://ibm.github.io/report-toolkit/api](https://ibm.github.io/report-toolkit/api).

"Everything else" can be found, along with the API, at [https://ibm.github.io/report-toolkit](https://ibm.github.io/report-toolkit); use the sidebar or double-cheeseburger menu to navigate.

The _sources_ for "everything else" can be found in [`docs/src/pages/`](https://github.com/IBM/report-toolkit/tree/master/packages/docs/src/pages); look for `.mdx` files (sorry about the `.mdx` files).
