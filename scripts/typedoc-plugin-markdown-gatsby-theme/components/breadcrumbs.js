const {
  ContextAwareRendererComponent
} = require('typedoc/dist/lib/output/components');
const Handlebars = require('handlebars');

class CarbonBreadcrumbsComponent extends ContextAwareRendererComponent {
  initialize() {
    super.initialize();
    const component = this;
    this.componentName = 'breadcrumbs';
    Handlebars.registerHelper('breadcrumbs', function() {
      return component.breadcrumb(
        /**
         * @type {import('typedoc/dist/lib/output/events').PageEvent} */ (this)
      );
    });
  }

  /**
   *
   * @param {string} url
   * @param {string} text
   */
  static makeBreadcrumbItem(url, text) {
    return `<BreadcrumbItem><a href="${url}">${text}</a></BreadcrumbItem>`;
  }

  /**
   *
   * @param {Partial<import('typedoc/dist/lib/output/events').PageEvent>} param0
   * @param {string[]} md
   */
  breadcrumb({model, project, url}, md = []) {
    const theme = /**
     * @type {import('typedoc-plugin-markdown/dist/theme').default}
     */ (this.application.renderer.theme);
    const relativeURL = Handlebars.helpers.relativeURL.bind(this);
    if (model && model.parent) {
      this.breadcrumb({model: model.parent, project, url}, md);
      if (model.url) {
        md.push(
          CarbonBreadcrumbsComponent.makeBreadcrumbItem(
            relativeURL(model.url),
            model.name
          )
        );
      }
    } else if (project.readme) {
      md.push(
        CarbonBreadcrumbsComponent.makeBreadcrumbItem(
          relativeURL(theme.indexName + theme.fileExt),
          project.name
        )
      );
    }

    return `<Breadcrumb noTrailingSlash>
${md.join('\n')}
</Breadcrumb>`;
  }
}

exports.CarbonBreadcrumbsComponent = CarbonBreadcrumbsComponent;
