const {
  ProjectReflection,
  DeclarationReflection,
  UrlMapping
} = require('typedoc');
const {PageEvent} = require('typedoc/dist/lib/output/events');
const {ReflectionKind} = require('typedoc/dist/lib/models/reflections');
const Handlebars = require('handlebars');
const {default: MarkdownTheme} = require('typedoc-plugin-markdown/dist/theme');
const {
  FrontMatterComponent
} = require('typedoc-plugin-markdown/dist/components/front-matter.component');
const {CarbonBreadcrumbsComponent} = require('./components/breadcrumbs');

const FILE_EXT = '.mdx';

class GatsbyFrontMatter extends FrontMatterComponent {
  /**
   * @param {PageEvent} pageEvent
   */
  getYamlString(pageEvent) {
    const yaml = `---
title: "${this.escapeYAMLString(this.getTitle(pageEvent))}"
---`;
    return yaml;
  }
}

const relativeURL = Handlebars.helpers.relativeURL;
const {handlebars} = MarkdownTheme;

module.exports = class GatsbyMarkdownTheme extends MarkdownTheme {
  /**
   * @param {import('typedoc').Renderer} renderer
   * @param {string} basePath
   */
  constructor(renderer, basePath) {
    super(renderer, basePath);

    this.indexName = 'index';
    this.fileExt = FILE_EXT;

    handlebars.unregisterHelper('relativeURL');
    handlebars.registerHelper(
      'relativeURL',
      /** @param {string} url */ url =>
        relativeURL(url)
          .replace(FILE_EXT, '')
          .replace('/index', '')
    );

    renderer.removeComponent('breadcrumbs');
    handlebars.unregisterHelper('breadcrumbs');
    renderer.addComponent(
      'breadcrumbs',
      new CarbonBreadcrumbsComponent(renderer)
    );

    renderer.addComponent('frontmatter', new GatsbyFrontMatter(renderer));

    this.listenToOnce(renderer, PageEvent.BEGIN, this.onPageBeginOnce);
  }

  /**
   * @todo Is there a more appropriate place to hack this?
   * @param {PageEvent} pageEvent
   */
  onPageBeginOnce(pageEvent) {
    const externalModuleGroup = pageEvent.project.groups.find(
      group => group.kind === ReflectionKind.ExternalModule
    );
    externalModuleGroup.title = 'Packages';
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

  /**
   *
   * @param {ProjectReflection} project
   */
  getUrls(project) {
    const urls = [];
    const entryPoint = this.getEntryPoint(project);
    const url = this.indexName + this.fileExt;
    entryPoint.url = url;
    urls.push(
      this.application.options.getValue('readme') === 'none'
        ? new UrlMapping(url, entryPoint, 'reflection.hbs')
        : new UrlMapping(url, project, 'index.hbs')
    );
    if (entryPoint.children) {
      entryPoint.children.forEach(child => {
        if (child instanceof DeclarationReflection) {
          this.buildUrls(child, urls);
        }
      });
    }
    return urls;
  }

  applyAnchorUrl(reflection, container) {
    if (!reflection.url || !MarkdownTheme.URL_PREFIX.test(reflection.url)) {
      const anchor = this.toAnchorRef(reflection);
      reflection.url = container.url.replace(FILE_EXT, '') + '#' + anchor;
      reflection.anchor = anchor;
      reflection.hasOwnDocument = false;
    }
    reflection.traverse(child => {
      if (child instanceof DeclarationReflection) {
        this.applyAnchorUrl(child, container);
      }
    });
  }
};
