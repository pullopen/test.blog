---
title: 如何装饰你的站点：自定义CSS、中继站和自定义表情
layout: post
tags: [站点维护, Mastodon, CSS, 中继]
image: mastodon-3.png
catalog: true 
category: 站点维护
#gif: mygif
description: "自定义CSS、中继站和自定义表情"
customexcerpt: "自定义CSS、中继站和自定义表情都是管理员可以在网页端进行的操作，无需在服务器端魔改代码就可以完成，操作简单，却能大大提升你的使用感受，带来更多快乐！"
---

自己搞站为了啥——一大动力不就是能够自己折腾嘛！在不想折腾代码的情况下，还有什么方法能够提高舒适度呢？别怕，Mastodon本身就为管理员提供了丰富的选项！

　　

## 自定义CSS

**哪里设置：**点开首选项-管理-网站设置，下拉到底，看到“自定义CSS”的输入框。输入CSS后保存，回到首页，`Ctrl+R`刷新缓存，你就能看到你刚刚设置的CSS生效啦。

几个常用好用CSS：

**长图补丁，让鼠标悬浮时自动放大长图并可上下滚动浏览，电脑手机均有效，推荐！！！）**

```css
/*mastodon长图补丁 v2.1 by Shioko*/
.image-loader {
    align-items:center;
}
.zoomable-image {
    display: flex;
    height:auto;
    max-height: 100%;
    width: auto;
    max-width: 98%;
    overflow: auto !important;
    align-items:center;
}
.zoomable-image:hover {
    align-items: flex-start;
}

.zoomable-image img {
    max-height: 100%;
    max-width:100%;
}
.zoomable-image img:hover {
    max-height: 2000%;
    max-width:100%;
}
```

注意：在3.2.2版本之后，官方加入了放大图片的按钮，可能会显得冗余，故可选择仅保留这一部分：

```css
.image-loader {
    align-items: center;
}
.zoomable-image {
    display: flex;
    max-height: 100%;
    max-width: 98%;
    overflow: auto !important;
}

.zoomable-image img {
	max-height: 100%;
    max-width:100%;
}
```

**让高级Web模式铺满整个页面（推荐！）**

```css
/*variable width*/
div.column {
 -webkit-box-flex:1;
 -ms-flex-positive:1;
 flex-grow:1
}
```

**Tag高亮显示（蓝色）**

```css
/*hashtag style blue by slashine 071320*/
.mention.hashtag{
background-color: #93AEFD36;
padding: 0px 4px;
text-align: center;
text-decoration: none;
display: inline-block;
border-style: dashed;
border-color: #93AEFD;
border-width: 0.5px;
border-radius: 2px;
margin-top: 2px;
margin-bottom: 2px;
}
```

颜色可以通过修改background-color和border-color修改。

**放大Emoji（固定放大）**

```css
/*emoji enlarge written by bgme*/
.reply-indicator__content .emojione, 
.status__content .emojione {
    width: 50px !important;
    height: 50px !important;
}

.emoji-mart-category .emoji-mart-emoji:hover span {
    width: 45px !important;
    height: 45px !important;
}

.emoji-mart-category .emoji-mart-emoji:hover {
    margin: 0 -12px;
}
```

大小可以通过修改50px这个参数调整。

**放大Emoji（鼠标悬停放大）**

```css
/* START mastodon emoji scaling by @eh5@eh5.me */
.account__header__content,
.reply-indicator__content,
.status__content:not(.status__content--collapsed) {
overflow: unset;
}
.account__header__content .emojione,
.reply-indicator__content .emojione,
.status__content:not(.status__content--collapsed) .emojione {
position: relative;
z-index: 10;
transform-origin: center;
/* Animation duration */
transition: 200ms ease-in-out;
}
.account__header__content .emojione:hover,
.reply-indicator__content .emojione:hover,
.status__content:not(.status__content--collapsed) .emojione:hover {
z-index: 11;
/* Scale up 2.3 times */
transform: scale(2.3);
/* shadows around image edges */
filter: drop-shadow(0 0 1px #282c37);
}
.directory__card .account__header__content .emojione:hover {
transform: unset;
}
/* END mastodon emoji scaling by @eh5@eh5.me */
```

**为所有头像加上猫耳**
```css
/*cat ears written by dmonad & neb*/
.notification .status__avatar::before,
.notification .status__avatar::after {
  display: none !important;
}

.status__wrapper .status:first-child .status__avatar::before,
.status__wrapper .status:first-child .status__avatar::after,
.entry.h-entry .status__avatar div::before,
.entry.h-entry .status__avatar div::after {
  content: "";
  display: inline-block;
  border: 2.5px solid;
  box-sizing: border-box;
  width: 50%;
  height: 50%;
  background-color: #F0F8D2;
  border-color: #D50886;
  position: absolute;
  z-index: 0;
}

.status__avatar::before,
.entry.h-entry .status__avatar div::before {
  border-radius: 75% 0 75% 75%;
  transform: rotate(-37.6deg) skew(-30deg);
  right: 0;
}

.status__avatar::after,
.entry.h-entry .status__avatar div::after {
  border-radius: 0 75% 75%;
  transform: rotate(37.6deg) skew(30deg);
  top: 0;
}

.detailed-status__display-name {
  overflow: visible !important;
}

.detailed-status__display-avatar {
  position: relative;
}

.detailed-status__display-avatar::before,
.detailed-status__display-avatar::after {
  content: "";
  display: inline-block;
  border: 2.5px solid;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  background-color: #F0F8D2;
  border-color: #D50886;
  position: absolute;
  z-index: 0;
}

.detailed-status__display-avatar::before {
  border-radius: 75% 0 75% 75%;
  transform: rotate(-37.6deg) skew(-30deg);
  right: 0px;
}

.detailed-status__display-avatar::after {
  border-radius: 0 75% 75%;
  transform: rotate(37.6deg) skew(30deg);
  top: 0;
}

.account__avatar {
  border-radius: 100%;
  z-index: 1;
}

.status__avatar:hover::before,
.detailed-status__display-avatar:hover::before,
.entry.h-entry .status__avatar div:hover::before {
  animation: earwiggleright 1s infinite;
}

.status__avatar:hover::after,
.detailed-status__display-avatar:hover::after,
.entry.h-entry .status__avatar div:hover::after {
  animation: earwiggleleft 1s infinite;
}

@keyframes earwiggleleft {
  from { transform: rotate(37.6deg) skew(30deg); }
  25% { transform: rotate(10deg) skew(30deg); }
  50% { transform: rotate(20deg) skew(30deg); }
  75% { transform: rotate(0deg) skew(30deg); }
  to { transform: rotate(37.6deg) skew(30deg); }
}

@keyframes earwiggleright {
  from { transform: rotate(-37.6deg) skew(-30deg); }
  30% { transform: rotate(-10deg) skew(-30deg); }
  55% { transform: rotate(-20deg) skew(-30deg); }
  75% { transform: rotate(-0deg) skew(-30deg); }
  to { transform: rotate(-37.6deg) skew(-30deg); }
}
```

通过修改background-color和border-color修改颜色。

　　

## 中继站

中继站是什么？它就像一个广播台，向所有订阅它的站点发送这些站点用户发送的公开嘟文。

未订阅中继时：你站的跨站时间轴=你站所有用户关注的用户发表的公开嘟文+你站用户回复、转发的公开嘟文

订阅中继后：你站的跨站时间轴还会加上所有订阅该中继的站点所发表的公开嘟文。

由此可以看出，中继站可以为小型站点提供丰富的信息流，让大家可以看到更多其他站的内容。但在开启中继前，自己的CPU、内存和储存需要有一定的余量，否则大量信息流很有可能导致其崩溃。

如何加入中继？很简单，点开**首选项-管理-中继站**，添加中继地址即可。

目前中文世界一个比较大型的中继站地址为：https://mastodon-relay.moew.science/inbox ，因为比较大也比较活跃，对服务器要求较高。服务器较小的朋友可以考虑“开一阵关一阵”的方法：开中继打捞有趣的关注对象之后再关闭中继。更多中继地址还有待各位在长毛象宇宙慢慢发掘。

　　

## 自定义表情

**首选项-管理-自定义表情：**

自制表情请右上角**上传新表情**，格式为png，最大50kb。

看到别站表情想拿过来：点击“远程”，勾选你想要的表情，点击右侧“复制”，即可复制至你站，可以在“本站”中见到。在“本站”一栏可以进行表情分类。

但是这样一个个复制表情实在太累了，怎么系统地一下子偷表情呢？这里就要用上兔子老师制造的[偷表情神器](https://github.com/Starainrt/emojidownloader/){:target="_blank"}！

首先，如何预览一个站点的所有表情和代码？打开https://emojos.in/{:target="_blank"}，可进行表情包预览（对未开启authorized_fetch的站点有效）。

然后，使用偷表情神器：

1. 到[release界面](https://github.com/Starainrt/emojidownloader/releases){:target="_blank"}，找到最新发布版的“emoji_linux_amd64”文件，右键复制下载地址。

2. 在服务器端：

    ```bash
    wget 上述文件地址
    chmod +x ./emoji_linux_amd64
    ./emoji_linux_amd64
    ```

    运行偷表情程序，根据提示一步步下载。可以自行选择需要下载对方站哪一种表情包分类，对表情包命名有无批量改动。

    注意：如果对方站开启了authorized_fetch模式，则需要拥有对方站账号。

    最后会下载下一个格式为`.tar.gz`的压缩包，里面包括你下载的所有表情。

3. 根据提示导入表情：

    ```bash
    su - mastodon
    cd live
    RAILS_ENV=production bin/tootctl emoji import 文件地址/文件名 --category 你设定的分类
    ```

    docker系统还需增加一步通过`docker cp`命令将`.tar.gz`文件复制入docker系统的过程，这些步骤都会给出提示。

最后`Ctrl+R`刷新界面，你就能看到你导入的所有表情啦！

