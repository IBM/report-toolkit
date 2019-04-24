import {Rule} from '../src/rule';

describe('module:rule', function() {
  describe('Rule', function() {
    describe('constructor', function() {
      it('should apply defaults', function() {
        expect(new Rule().meta, 'to have property', 'mode', 'simple');
      });
    });

    describe('property', function() {
      describe('id', function() {
        it('should return the Rule id', function() {
          expect(new Rule({id: 'foo'}), 'to have property', 'id', 'foo');
        });
      });

      describe('description', function() {
        it('should return the description', function() {
          expect(
            new Rule({meta: {docs: {description: 'foo'}}}),
            'to have property',
            'description',
            'foo'
          );
        });
      });

      describe('url', function() {
        it('should return the url', function() {
          expect(
            new Rule({meta: {docs: {url: 'https://something'}}}),
            'to have property',
            'url',
            'https://something'
          );
        });
      });

      describe('filepath', function() {
        it('should return the filepath', function() {
          expect(
            new Rule({filepath: __filename}),
            'to have property',
            'filepath',
            __filename
          );
        });
      });

      describe('meta', function() {
        it('should return the metadata', function() {
          expect(new Rule(), 'to have property', 'meta');
        });
      });
    });
  });
});
