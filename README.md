# gnostic

> A toolkit for consumers of Node.js Diagnostic Reports

## Features

### Main Features

- Run heuristics ("Rules") against diagnostic reports to uncover issues needing attention
  - Comes with a set of built-in Rules and a "recommended" configuration
  - Custom, extendable, and shareable Rules
- Purpose-built, "smart" diagnostic report diffing
  - "What has changed from last report?"
  - Ignores fields that don't matter
- Automatically redacts sensitive information from report output
  - Redacts cloud provider tokens, session IDs, etc., from environment variables
  - Redaction available as a single operation--use this before sending the report somewhere else!
- A friendly, colorful command-line interface
- Two public APIs: `Promise`-based and [`Observable`](https://rxjs.dev)-based

### Not-Main Features (But Worth Mentioning)

- A choice of output formats:
  - Tabular, human-readable output
  - JSON
  - CSV
- Handles multiple report files
- Written using ES modules to faciliate bundling as library for the web

## Installation & Usage

### For CLI Usage

```shell
$ npx gnostic --help
```

or just install globally:

```shell
$ npm install -g gnostic
$ gnostic --help
```

### For Usage as a Library

```shell
$ npm install gnostic
```

and:

```js
// my-app.js
const {inspect} = require('gnostic');

async function main() {
  const report = JSON.parse(process.report.getReport());
  // configuration automatically loaded from `.gnosticrc.js` in CWD
  const results = await inspect(report);
  if (results.length) {
    results.forEach(result => {
      // log problem and associated rule ID
      console.log(`${result.message} (${result.id})`);
    });
  } else {
    console.log('no problems!');
  }
}

main();
```

## About Diagnostic Reports

Diagnostic Reports landed as an experimental feature in Node.js v11.8.0.

[The Node.js documentation](https://nodejs.org/api/report.html#report_diagnostic_report) describes reports:

> "The report is intended for development, test and production use, to capture and preserve information for problem determination. It includes JavaScript and native stack traces, heap statistics, platform information, resource usage etc. With the report option enabled, diagnostic reports can be triggered on unhandled exceptions, fatal errors and user signals, in addition to triggering programmatically through API calls."

## Roadmap

- More built-in Rules
- Actual documentation:
  - API docs
  - Tutorials & examples
  - Contribution guidelines, CoC
  - Design docs & developer documentation

## Future Ideas & Extension

- gnostic-as-a-service: send reports to a service which returns inspection or diff results
- Client-side ("in your app") wrapper for report transmission or direct invocation of gnostic
- Use CLI or API to trigger report generation from a running `node` process & interpret results; could be real-time
- Easy cloud deployment & integration
- "Connectors" for logging, tracing & observability tools
- Web or Electron-based GUI
- Adapters for frameworks
- IDE/editor integration: generate a report from running process, view results

## Maintainer(s)

- [boneskull](https://github.com/boneskull)

## License

© 2019, IBM. Licensed Apache-2.0
