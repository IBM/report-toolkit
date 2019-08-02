import {commandConfig} from '../src/commands/common.js';

describe('@report-toolkit/cli:commands:common', function() {
  describe('commandConfig()', function() {
    describe('when no parameters supplied', function() {
      it('should not throw', function() {
        expect(commandConfig, 'not to throw');
      });
    });

    describe('when parameters supplied', function() {
      it('should prefer user config over default config', function() {
        const argv = {config: {foo: {bar: 'baz'}}};
        const defaultConfig = {foo: {bar: 'quux'}};
        expect(
          commandConfig('commandName', argv, defaultConfig),
          'to equal',
          argv.config
        );
      });

      it('should prefer user config over default command-specific config', function() {
        const argv = {config: {foo: {bar: 'baz'}}};
        const defaultConfig = {
          foo: {bar: 'quux'},
          commandName: {foo: {bar: 'spam'}}
        };
        expect(
          commandConfig('commandName', argv, defaultConfig),
          'to equal',
          argv.config
        );
      });

      it('should prefer user command-specific config over user config and default command-specific config', function() {
        const argv = {
          config: {
            foo: {bar: 'baz'},
            commandName: {foo: {bar: 'butts'}}
          }
        };
        const defaultConfig = {
          foo: {bar: 'quux'},
          commandName: {foo: {bar: 'spam'}}
        };
        expect(
          commandConfig('commandName', argv, defaultConfig),
          'to equal',
          argv.config.commandName
        );
      });

      it('should remove command-specific config from result', function() {
        const argv = {config: {foo: {bar: 'baz'}}};
        const defaultConfig = {
          foo: {bar: 'quux'},
          commandName: {foo: {bar: 'spam'}}
        };
        expect(
          commandConfig('commandName', argv, defaultConfig),
          'not to have key',
          'commandName'
        );
      });

      it('should prefer default command-specific config over default config', function() {
        const defaultConfig = {
          foo: {bar: 'quux'},
          commandName: {foo: {bar: 'spam'}}
        };
        expect(
          commandConfig('commandName', {}, defaultConfig),
          'to equal',
          defaultConfig.commandName
        );
      });

      it('should prefer argv over anything', function() {
        const argv = {
          config: {foo: 'baz', commandName: {foo: 'butts'}},
          foo: 'rubberduck'
        };
        const defaultConfig = {
          foo: 'quux',
          commandName: {foo: 'spam'}
        };
        expect(commandConfig('commandName', argv, defaultConfig), 'to equal', {
          foo: 'rubberduck'
        });
      });

      it('should omit "_" and "$0" from argv', function() {
        const argv = {
          config: {
            foo: 'baz',
            commandName: {foo: 'butts'}
          },
          _: ['some', 'positional', 'args'],
          $0: 'report-toolkit',
          foo: 'rubberduck'
        };
        const defaultConfig = {
          foo: 'quux',
          commandName: {foo: 'spam'}
        };
        expect(commandConfig('commandName', argv, defaultConfig), 'to equal', {
          foo: 'rubberduck'
        });
      });
    });
  });
});
