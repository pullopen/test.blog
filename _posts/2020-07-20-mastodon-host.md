---
title: 关于Mastodon托管服务的简介
layout: post
tags: [托管服务, Mastodon]
image: elephant_throwing_cs.png
catalog: true 
category: 基础搭建
#gif: mygif
subtitle: "如果我实在不想碰程序方面的内容，只想出钱，怎么办？"
customexcerpt: "Mastodon托管服务：我掏钱，你帮管。<br>优点：省事，不用费心维护，只需要掏钱即可。<br>缺点：完全受制于托管商，需要反复邮件沟通，完全无法魔改。<br>个人建议还是尽量自己建站，但如果实在需要选择托管服务，需要注意些什么呢？"
---

**[前一篇博文](https://pullopen.github.io/2020/07/19/How-to-build-a-mastodon-instance.html){:target="_blank"}**从头到尾详细地和各位描述了如何搭建自己的Mastodon实例。但是人各有所长，如果有朋友一看到代码头就爆炸，又非常想拥有自己的实例，又该怎么办呢？

第一个方法：你可以求助你的朋友，让ta帮忙一起搭建实例。

第二个方法：你可以选择Mastodon托管站服务。

## 什么是Mastodon托管站服务？它有什么优缺点？

自己搭建实例就像亲手盖房子，而托管站服务就像从开发商手里购买房子。托管站服务提供商负责网站的日常维护，你只要每个月出钱即可。

优点显而易见：**省事，**不怕麻烦，不用担心自己不小心把站搞炸了。

但是缺点也非常明显：完全**不能魔改**，完全受制于托管商，任何问题都要反复进行邮件沟通。如果你要增加“全文搜索”功能，绝大多数要加钱。而一旦托管商跑路，你数据的安全性并不能保证。

从我个人而言，我还是更建议大家通过自己建站的方法，将自己的数据和服务器牢牢地掌握在自己手里。但是各人总有各人的难处，如果实在想选择托管，那应该如何选择，有哪些注意事项呢？

## 选择托管服务的注意事项

**首先最重要的事情：你需要购买自己的域名。**

有很多人会问：这些托管服务商不是会提供免费的子域名吗？为什么需要自己的域名？

假设你看中了一个托管商，一切都很好，可有一天它突然通知你，它要涨价了，你感觉不能接受。或者更糟糕的事情发生了，它要跑路了。

这时，如果你有自己的域名，那你所要做的只是迁移服务器而已。只要将服务器内的数据迁移到另外一家，那你的网站依然可以继续运行。

但是如果你采用了他的免费域名，那要换托管商就不是那么容易的事情了。**域名一旦启用，就很难更改**，到时候你就只能接受托管商提出的一切要求——这不就还是被人控制了吗？

所以即便你选择了托管服务，你也最好到域名购买商那里购买自己的域名。具体事项可以参照 **[前一篇博文](https://pullopen.github.io/2020/07/19/How-to-build-a-mastodon-instance.html){:target="_blank"}**的第一部分。

## 有哪些托管商？

在[官方文档](https://docs.joinmastodon.org/zh-cn/user/run-your-own/){:target="_blank"}中列举了一些托管商。

### Masto.host

[Masto.host](https://masto.host/){:target="_blank"}的价格如下：

![masto-host-1](https://s1.ax1x.com/2020/07/19/UfpaDA.png)

![masto-host-2](https://s1.ax1x.com/2020/07/19/UfpUud.png)

服务器位于法国，速度可能会有点慢。最大优势是无上限的媒体储存（而Database本身不会占据太多空间）。如果需要开启全文搜索，则每月需要增加5欧（前三种）或10欧（后两种）。

### Hostdon

[Hostodon](https://hostdon.jp/){:target="_blank"}提供Mastodon和Pleroma的托管服务，其中Mastodon的价格如下：

![Hostodon](https://s1.ax1x.com/2020/07/19/Uf90sJ.png)

服务器位于日本，大陆访问较快，价格可能稍微贵一点点。本站的媒体储存有限制，外站无。如果需要开启全文搜索，每月需增加162日元（相对Masto.host便宜）。可以联系托管商进行字数修改、添加主题等改动。

### Spacebear

[Spacebear](https://app.spacebear.ee/mastodon){:target="_blank"}提供Fediverse内多种托管服务，包括Mastodon、Pixelfed、Peertube等。其中Mastodon的价格如下：

![Spacebear](https://s1.ax1x.com/2020/07/19/UfC4pT.png)

服务器位于美国DigitalOcean，速度也比较慢。比较便宜，但是Sidekiq线程数远小于Hostodon，可能处理速度会比较慢。没找到开全文搜索的价格说明，可能需要联系托管商。其中的Media Uploads Limit并没有说清楚是本站媒体储存还是所有媒体储存（包括外站的缓存），需要发邮件去问。如果是后者，那可能需要托管商定时清理，否则很容易超。



官方文档提及的最后一个托管商Nablahost我打不开它的网站，可能已经跑路。

以上就是官方文档提及的各托管站的一个简要价格说明，希望能给大家一些帮助！但是依然是那句话：将一切交给托管商，也就将你的权利交给了它。如果想要真正掌握自己的社交网络，还是请参考[第一篇博文](https://pullopen.github.io/2020/07/19/How-to-build-a-mastodon-instance.html){:target="_blank"}自己搭建——真的不难！更重要的是，当亲手搭建的站点开始运营，这其中的快乐是难以想象的，谁试谁知道！

*顺便，如果看到殆知阁开启了以mastodonhub.com域名为基础的托管站服务，请不要去。服务器位于大陆同时域名没有备案，无论是审查还是跑路的风险都很高。*

---
本文以[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh){:target="_blank"} 协议发布。您可以在任何媒介以任何形式复制、发行本作品，也可以修改、转换或以本作品为基础进行创作，并用于任意用途。但是，您必须以适当的形式署名原作者并以相同的协议发布。






