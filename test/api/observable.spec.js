import {from, of} from 'rxjs';

import {Report} from '../../src/report';
import {Rule} from '../../src/rule';
import {createSandbox} from 'sinon';
import {mergeMap} from 'rxjs/operators';
import rewiremock from '../mock-helper';

const REPORT_1_FILEPATH = require.resolve('../fixture/report-001.json');
const REPORT_2_FILEPATH = require.resolve(
  '../fixture/report-002-library-mismatch.json'
);

describe('module:api/observable', function() {
  let sandbox;
  let inspect;

  beforeEach(function() {
    sandbox = createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('inspect()', function() {
      beforeEach(async function() {
        const ruleDefs = [
          {id: 'foo', filepath: '/some/path/foo.js'},
          {id: 'bar', filepath: '/some/path/bar.js'}
        ];
        const rules = {
          foo: {
            inspect: context => {
              if (context.filepath === REPORT_1_FILEPATH) {
                context.report('foo');
              }
            },
            meta: {}
          },
          bar: {
            inspect: context => {
              if (context.filepath !== REPORT_1_FILEPATH) {
                context.report('bar');
              }
            },
            meta: {}
          }
        };
        const configStubs = {
          filterEnabledRules: sandbox.stub().returnsArg(0),
          loadConfig: sandbox
            .stub()
            .returns(of({rules: {foo: true, bar: true}}))
        };
        const ruleLoaderStubs = {
          loadRules: sandbox.spy(() =>
            from(ruleDefs).pipe(
              mergeMap(({id, filepath}) =>
                of(Rule.create({id: id, filepath: filepath, ...rules[id]}))
              )
            )
          )
        };
        const reportReaderStubs = {
          readReport: sandbox.spy(filepath =>
            of(Report.create(require(filepath), filepath))
          )
        };
        inspect = (await rewiremock.module(
          () => import('../../src/api/observable'),
          {
            '../config': configStubs,
            '../rule-loader': ruleLoaderStubs,
            '../read-report': reportReaderStubs
          }
        )).inspect;
      });

      describe('when called without parameters', function() {
        it('should emit an error', function() {
          return expect(inspect(), 'to emit error');
        });
      });

      describe('when called with a single report file', function() {
        it('should only emit a single message', function() {
          return expect(
            inspect(REPORT_1_FILEPATH, {
              config: {rules: {foo: true, bar: true}}
            }),
            'to complete with value',
            {
              message: 'foo',
              filepath: REPORT_1_FILEPATH,
              id: 'foo'
            }
          ).and('to emit once');
        });
      });

      describe('when called with a two report files', function() {
        it('should emit two messages', function() {
          return expect(
            inspect([REPORT_1_FILEPATH, REPORT_2_FILEPATH], {
              config: {rules: {foo: true, bar: true}}
            }),
            'to complete with values satisfying',
            {
              message: 'foo',
              filepath: REPORT_1_FILEPATH,
              id: 'foo'
            },
            {
              message: 'bar',
              filepath: REPORT_2_FILEPATH,
              id: 'bar'
            }
          );
        });
      });
    });

    describe('diff()', function() {
      let diff;

      beforeEach(async function() {
        const reportReaderStubs = {
          readReport: sandbox.spy(filepath =>
            of(Report.create(require(filepath), filepath))
          )
        };

        diff = (await rewiremock.module(
          () => import('../../src/api/observable'),
          {
            '../../src/read-report': reportReaderStubs
          }
        )).diff;
      });

      it('should diff two reports by default properties', function() {
        return expect(
          diff(REPORT_1_FILEPATH, REPORT_2_FILEPATH),
          'to complete with values',

          {
            op: 'replace',
            path: '/header/processId',
            value: 4658,
            oldValue: 45164
          },
          {
            op: 'replace',
            path: '/header/cwd',
            value: '/Users/boneskull/projects/nodejs/node',
            oldValue: '/Users/boneskull/projects/christopher-hiller/gnostic'
          },
          {
            op: 'replace',
            path: '/header/commandLine/0',
            value: './node',
            oldValue: 'node'
          },
          {op: 'remove', path: '/header/commandLine/2', oldValue: '-e'},
          {
            op: 'remove',
            path: '/header/commandLine/3',
            oldValue: 'process.report.writeReport()'
          },
          {
            op: 'replace',
            path: '/header/nodejsVersion',
            value: 'v12.0.0-pre',
            oldValue: 'v12.1.0'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/node',
            value: '12.0.0-pre',
            oldValue: '12.1.0'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/v8',
            value: '7.4.288.13-node.16',
            oldValue: '7.4.288.21-node.16'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/uv',
            value: '1.27.0',
            oldValue: '1.28.0'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/nghttp2',
            value: '1.37.0',
            oldValue: '1.38.0'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/cldr',
            value: '34.0',
            oldValue: '35.1'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/icu',
            value: '63.1',
            oldValue: '64.2'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/tz',
            value: '2018e',
            oldValue: '2019a'
          },
          {
            op: 'replace',
            path: '/header/componentVersions/unicode',
            value: '11.0',
            oldValue: '12.1'
          },
          {
            op: 'remove',
            path: '/header/release/headersUrl',
            oldValue:
              'https://nodejs.org/download/release/v12.1.0/node-v12.1.0-headers.tar.gz'
          },
          {
            op: 'remove',
            path: '/header/release/sourceUrl',
            oldValue:
              'https://nodejs.org/download/release/v12.1.0/node-v12.1.0.tar.gz'
          },
          {
            op: 'remove',
            path: '/environmentVariables/BAT_STYLE',
            oldValue: 'changes,header'
          },
          {
            op: 'remove',
            path: '/environmentVariables/NVM_BIN',
            oldValue: '/Users/boneskull/.nvm/versions/node/v12.1.0/bin'
          },
          {
            op: 'add',
            path: '/environmentVariables/COMMAND_MODE',
            value: 'unix2003'
          },
          {
            op: 'replace',
            path: '/environmentVariables/PWD',
            value: '/Users/boneskull/projects/nodejs/node',
            oldValue: '/Users/boneskull/projects/christopher-hiller/gnostic'
          },
          {
            op: 'replace',
            path: '/environmentVariables/PATH',
            value:
              '/usr/local/opt/ruby/bin:/usr/local/opt/ccache/libexec:/opt/X11/bin:./node_modules/.bin:/Users/boneskull/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin:/usr/local/MacGPG2/bin:/usr/local/share/dotnet:/Library/Frameworks/Mono.framework/Versions/Current/Commands:/Applications/Wireshark.app/Contents/MacOS:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/lib:/Users/boneskull/.antigen/bundles/zsh-users/zsh-syntax-highlighting:/Users/boneskull/.antigen/bundles/zsh-users/zsh-history-substring-search:/Users/boneskull/.antigen/bundles/zsh-users/zsh-completions:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/git:/Users/boneskull/.antigen/bundles/smallhadroncollider/antigen-git-rebase:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/git-extras:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/gitignore:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/github:/Users/boneskull/.antigen/bundles/denolfe/zsh-travis:/Users/boneskull/.antigen/bundles/mollifier/cd-gitroot:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/node:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/nvm:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/npm:/Users/boneskull/.antigen/bundles/tomsquest/nvm-auto-use.zsh:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/pip:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/python:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/vagrant:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/history:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/bundler:/Users/boneskull/.antigen/bundles/Tarrasch/zsh-mcd:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/osx:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/brew',
            oldValue:
              '/Users/boneskull/.nvm/versions/node/v12.1.0/bin:/usr/local/opt/ruby/bin:/usr/local/opt/ccache/libexec:/opt/X11/bin:./node_modules/.bin:/Users/boneskull/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin:/usr/local/MacGPG2/bin:/usr/local/share/dotnet:/Library/Frameworks/Mono.framework/Versions/Current/Commands:/Applications/Wireshark.app/Contents/MacOS:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/lib:/Users/boneskull/.antigen/bundles/zsh-users/zsh-syntax-highlighting:/Users/boneskull/.antigen/bundles/zsh-users/zsh-history-substring-search:/Users/boneskull/.antigen/bundles/zsh-users/zsh-completions:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/git:/Users/boneskull/.antigen/bundles/smallhadroncollider/antigen-git-rebase:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/git-extras:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/gitignore:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/github:/Users/boneskull/.antigen/bundles/denolfe/zsh-travis:/Users/boneskull/.antigen/bundles/mollifier/cd-gitroot:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/node:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/nvm:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/npm:/Users/boneskull/.antigen/bundles/tomsquest/nvm-auto-use.zsh:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/pip:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/python:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/vagrant:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/history:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/bundler:/Users/boneskull/.antigen/bundles/Tarrasch/zsh-mcd:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/osx:/Users/boneskull/.antigen/bundles/robbyrussell/oh-my-zsh/plugins/brew'
          },
          {
            op: 'replace',
            path: '/environmentVariables/OLDPWD',
            value: '/usr/local/opt/openssl',
            oldValue:
              '/Users/boneskull/projects/christopher-hiller/gnostic/test'
          },
          {
            op: 'replace',
            path: '/environmentVariables/_',
            value: '/Users/boneskull/projects/nodejs/node/./node',
            oldValue: '/Users/boneskull/.nvm/versions/node/v12.1.0/bin/node'
          },
          {
            op: 'replace',
            path: '/sharedObjects/0',
            value: '/Users/boneskull/projects/nodejs/node/./node',
            oldValue: '/Users/boneskull/.nvm/versions/node/v12.1.0/bin/node'
          },
          {
            op: 'add',
            path: '/sharedObjects/1',
            value: '/usr/local/opt/openssl@1.1/lib/libcrypto.1.1.dylib'
          },
          {
            op: 'add',
            path: '/sharedObjects/2',
            value: '/usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib'
          },
          {
            op: 'remove',
            path: '/sharedObjects/6',
            oldValue: '/usr/lib/libicucore.A.dylib'
          },
          {
            op: 'remove',
            path: '/sharedObjects/7',
            oldValue: '/usr/lib/libz.1.dylib'
          },
          {
            op: 'remove',
            path: '/sharedObjects/8',
            oldValue: '/usr/lib/libc++abi.dylib'
          },
          {
            op: 'remove',
            path: '/sharedObjects/9',
            oldValue: '/usr/lib/system/libcache.dylib'
          },
          {
            op: 'remove',
            path: '/sharedObjects/10',
            oldValue: '/usr/lib/system/libcommonCrypto.dylib'
          },
          {
            op: 'add',
            path: '/sharedObjects/39',
            value: '/usr/lib/libobjc.A.dylib'
          },
          {
            op: 'add',
            path: '/sharedObjects/40',
            value: '/usr/lib/libc++abi.dylib'
          },
          {
            op: 'add',
            path: '/sharedObjects/41',
            value: '/usr/lib/libDiagnosticMessagesClient.dylib'
          },
          {
            op: 'add',
            path: '/sharedObjects/42',
            value: '/usr/lib/libicucore.A.dylib'
          },
          {
            op: 'add',
            path: '/sharedObjects/43',
            value: '/usr/lib/libz.1.dylib'
          }
        );
      });
    });
  });
});
