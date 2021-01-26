

import { Compiler, EntryOptionPlugin } from 'webpack';
import EntryDependency from 'webpack/lib/dependencies/EntryDependency.js';
import { webpackMultiHtmlV2 } from 'xtools.node';
import { MultiHtmlOptionsV2 } from 'xtools.node/lib/webpack/multi-html/types';

class MultiHtmlPlugiEntryDependency extends EntryDependency {
  constructor(entry: string) {
    super(entry);
  }
}

/**
 * webpack 多页面打包
 */
module.exports = class WebpackMultiHtmlPlugin {

  constructor(options: MultiHtmlOptionsV2) {
    (this as any).options = options || {};
  }

  getEntriesAndOptions(context: string) {
    const [entries, options] = webpackMultiHtmlV2({
      context,
      entries: [
        { globPattern: 'src/**/*.js', entryRemovedPrefix: 'src/' },
        { globPattern: 'src/**/*.ts', entryRemovedPrefix: 'src/', globIgnore: '**/*.d.ts' },
      ],
      baseTemplate: 'public/index.html',
      debug: true,
      htmlExtra: {}
    });
    return [entries, options];
  }

  setDepFactory(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      "WebpackMultiHtmlPlugin",
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          MultiHtmlPlugiEntryDependency as any,
          normalModuleFactory
        );
      }
    );
  }


  apply(compiler: Compiler) {
    // webpack >= 4
    if (compiler.hooks) {
      this.setDepFactory(compiler);

      const [entries, options] = this.getEntriesAndOptions(compiler.context);

      const HtmlPlugin = (this as any).options.HtmlPlugin || require('html-webpack-plugin');
      let plugins = (options as Array<any>).map((opts) => (new HtmlPlugin(opts)));
      compiler.options.plugins.push(...plugins);

      compiler.hooks.make.tapAsync('WebpackMultiHtmlPlugin', (compilation, callback) => {
        const promiseList = [];
        for (const key in entries as any) {
          promiseList.push(new Promise((resolve, reject) => {
            const options = EntryOptionPlugin.entryDescriptionToOptions(compiler, key, '' as any)
            const dep: any = new MultiHtmlPlugiEntryDependency((entries as any)[key]);
            dep.loc = { name: typeof options === "object" ? options.name : options };
            compilation.addEntry(compiler.context, dep, options, (err) => err ? reject(err) : resolve(void 0));
          }));
        }

        Promise.all(promiseList).then(() => {
          callback();
        }).catch(err => callback(err))
      });
      
    }
  }

}
