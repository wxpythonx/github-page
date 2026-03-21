module.exports = {
  // 基本路径 - 设置成相对路径，这样所有的资源都会被链接为相对路径
  publicPath: process.env.NODE_ENV === 'production' ? '/github-page/' : './',
  // 打包时生成的生产环境构建文件的目录
  outputDir: 'dist',
  // 放置生成的静态资源的目录
  assetsDir: 'assets',
}
