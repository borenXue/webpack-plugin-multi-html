# webpack-plugin-multi-html

webpack 多页面打包插件, 支持 `webpack5+`

## 快速集成

安装依赖

```shell
npm i -D webpack-cli webpack
npm i -D webpack-plugin-multi-html html-webpack-plugin
```


webpack 配置


```js
const WebpackPluginMultiHtml = require('webpack-plugin-multi-html');

// 不用配置 entry 项, 插件会自动读取 src/pages 目录下的文件来确定生成哪些页面
module.exports = {
  mode: 'development',
  output: {
    publicPath: '/',
    path: __dirname + '/dist',
    filename: '[name]-[contenthash].js'
  },
  plugins: [
    new WebpackPluginMultiHtml()
  ]
}
```


### 配置项、及页面生成规则说明

待补充
