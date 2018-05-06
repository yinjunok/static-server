# NODE 实现静态资源服务器

之前在掘金上看到有人写了一篇用 NODE 实现静态资源服务器的文章，
这引起了我的兴趣， 本来以为应该挺难的， 但是自己实践后， 觉得
也就这么会回事儿， 只要把里面的知识点， 逻辑流程理清， 后面就是
调用 API 的事情了。

## 程序流程
1. 使用 `http.createServer` 启动一个 http 服务器
2. 当接收到请求的时候， 从中解析出请求文件的路径。
3. 在设置的根目录里查询文件是否存在，如果存在， 则返回， 不存在， 则返回 404.

## 当中涉及到的细节
1. `http.createServer()` 参数是一个函数，会被自动添加到 `request` 事件， 这意味着， 每次收到请求， 都会调用这个函数。
2. 从 url 里解析文件路径， req 对象中有一个 url 的属性， 里面存放着请求的路径，但是我们不能直接使用这个路径，因为它返回的是完整的请求路径，包含 `searchQuery` 和 `hash` 这两部分。而这两部分不是文件路径的的成分, 而在实际开发中, 我们也经常会用 `pathname?v=123` 这种方式来标识版本或解决一些缓存的问题. 所以我们需要调用 `url.parse` 方法解析出 `pathname` 出来。 用解析出的 `pathname` 当请求文件的路径。
3. 读取文件的时候， 最后是用 Stream 来读取并返回， 因为如果直接读取文件的话， 需要把文件全都读到内存中， 然后再返回。 如果文件过大， 或者并发量太多， 内存可能会不足。
4. 返回文件的时候注意要设置好 MIME ， 好让浏览器正确解析文件。

## 接下来目标

目前只是实现了一个能返回图片的静态服务器。
接下来的目标：
1. 完整实现能正常返回文件的静态服务器。
2. 非法路径的防止。非法路径分两种情况， 1. 访问的是文件夹， 而不是文件。 2. 对目录层级操作(比如 `../app.js`可以跳出我们所设置的根目录，从而外部可以访问到不该访问到的文件)。
3. 缓存处理
4. 对文本文件压缩后返回。 gzip 对文本类文件有很好的压缩效果，一般能压缩到原来的 1/3， 但是对其他， 比如图片， 视频。并不能得到很好的效果， 反而白白浪费服务器资源。

## 遇到的一点小坑
1. 正则 g 模式会记录上次匹配到的字符串位置， 下次匹配的时候会从上次停下来的位置开始， 而不是从头开始匹配。