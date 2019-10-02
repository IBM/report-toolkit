const {ProjectReflection} = require('typedoc');
const Handlebars = require('handlebars');
const {default: MarkdownTheme} = require('typedoc-plugin-markdown/dist/theme');
const {
  FrontMatterComponent
} = require('typedoc-plugin-markdown/dist/components/front-matter.component');

class GatsbyFrontMatter extends FrontMatterComponent {
  /**
   * @param {import('typedoc/dist/lib/output/events').PageEvent} page
   */
  getYamlString(page) {
    const yaml = `---
title: "${this.escapeYAMLString(this.getTitle(page))}"
---`;
    return yaml;
  }
}

const relativeURL = Handlebars.helpers.relativeURL;
Handlebars.helpers.relativeURL = /** @param {string} url */ url =>
  relativeURL(url).replace('.md', '');

module.exports = class GatsbyMarkdownTheme extends MarkdownTheme {
  /**
   * @param {import('typedoc').Renderer} renderer
   * @param {string} basePath
   */
  constructor(renderer, basePath) {
    super(renderer, basePath);

    this.indexName = 'index';

    renderer.addComponent('frontmatter', new GatsbyFrontMatter(renderer));
  }

  /**
   * @param {import('typedoc').Reflection} reflection
   * @param {import('typedoc').Reflection?} relative
   * @param {string} separator
   */
  getUrl(reflection, relative, separator = '.') {
    let url = reflection.getAlias();
    // gatsby-source-filesystem doesn't like files beginning with underscore
    url = url.replace(/^_/, '');
    if (
      reflection.parent &&
      reflection.parent !== relative &&
      !(reflection.parent instanceof ProjectReflection)
    ) {
      url =
        this.getUrl(reflection.parent, relative, separator) + separator + url;
    }
    return url;
  }
};
