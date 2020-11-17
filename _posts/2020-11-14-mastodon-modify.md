---
title: 进阶魔改：修改字数上限、媒体上限、投票上限、添加自定义主题、界面用语、非登陆用户有限显示，附阻止本站嘟文流入某站点方法
layout: post
tags: [进阶魔改, Mastodon]
image: mastodon-2.png
catalog: true 
category: 进阶魔改
#gif: mygif
description: "一些轻量魔改的方法"
customexcerpt: "本文介绍了给自己的站点修改字数上限、媒体上限、投票上限、添加自定义主题、界面用语、非登陆用户有限显示的方法，并且对魔改之后如何升级进行了一点说明。另附阻止本站嘟文流入某特定站方法。"
---

## 通用步骤

根据官方要求，如果你需要对代码进行魔改，请**在GitHub上将官方分支fork到自己的库中创建自己站点的分支**，并且在`.env.production`中添加

```ruby
GITHUB_REPOSITORY=你的GitHub名/mastodon
```

另外，为方便起见，建议大家在个人电脑中**下载GitHub Desktop和Visual Code Studio**。具体请参考[Docker魔改指南](https://pullopen.github.io/%E8%BF%9B%E9%98%B6%E9%AD%94%E6%94%B9/2020/11/01/Mastodon-on-Docker-2.html){:target="_blank"}第一步。

**如果你使用的是Docker系统安装，那请继续参考上述教程进行接下来的步骤。**

如果你是通过源代码安装，或者DigitalOcean一键镜像，那你需要在你服务器上，建立服务器上代码和你自己魔改代码库的联系：

进入你Mastodon所在文件夹后：

```bash
git remote add XXX【给你的魔改远程分支名起个名】 https://github.com/你的GitHub名/mastodon.git         #添加自己的库为远程库并命名为XXX。
git remote -v    #查看自己的远程分支。正常情况下应该会显示origin（官方分支）和XXX各两个。
```

之后，当你在自己的个人电脑上进行魔改并推送到GitHub中后，你只要在你的服务器上：

```bash
git fetch XXX
git merge XXX/master
```

然后进行编译和重启。**请务必保证内存充足，内存+SWAP至少4G以上。**可通过`free -h`查看。如果没有开启SWAP，请参考 **[设置SWAP教程](https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-16-04){:target="_blank"}**设置。

在你内存足够的情况下：

```bash
RAILS_ENV=production bundle exec rails assets:precompile
exit
systemctl restart mastodon-sidekiq
systemctl reload mastodon-web
systemctl restart mastodon-streaming
```

如果precompile出现失败，请拉到最上面查看失败原因，通常可能是你代码修改有误或者内存不足。如果是后者，你需要在清理缓存：

```bash
RAILS_ENV=production bundle exec rake tmp:cache:clear
```

之后，开足SWAP，重新编译。

上文仅简单地使用了git命令。这个命令非常有用，有兴趣的朋友可以参考[廖雪峰Git教程](https://www.liaoxuefeng.com/wiki/896043488029600){:target="_blank"}、[Git官方手册的中文翻译](https://git-scm.com/book/zh/v2){:target="_blank"}和这份[英文教程](https://www.atlassian.com/git/tutorials/setting-up-a-repository){:target="_blank"}。

　　

## 修改实例字数上限

官方嘟文上限为500字，如果需要增加，请按照[这个Commit](https://github.com/pullopen/mastodon/commit/2bf275ba3b81e4c28d817511407680b0b7abc7fe){:target="_blank"}修改相应文件：`app/javascript/mastodon/features/compose/components/compose_form.js`（3处）、`app/serializers/rest/instance_serializer.rb`（2处）和`app/validators/status_length_validator.rb`（1处），将字数修改为你心仪的字数，随后进行precompile和重启。

　　

## 修改媒体文件大小上限和分辨率上限

官方媒体大小上限：每张图片/动图/MP3为10M，每个视频40M。上传后长毛象会进行压图图片，压缩后最高分辨率为1638400像素（1280*1280）。

如果需要修改，请参考[这个commit](https://github.com/pullopen/mastodon/commit/674f07ec6fb3e8433674cd5d5c73d3ef6937a881){:target="_blank"}修改相应文件并进行precompile和重启。这一步将压缩后像素上限提升至3686400（1920*1920）像素，图片上限提升至24M，视频为80M。

另外，如果服务器的CPU较小，在提高上限后，上传大型动图或者视频时你可能会遇到`504 Bad Gateway`的错误，这是因为转换格式所需要的时间太长，而nginx自动会在1分钟没有响应后断开连接。想要改善这种情况，除了升级服务器之外，你还可以修改nginx文件：

```bash
nano /etc/nginx/sites-available/你的域名
```

在`location @proxy {`部分，`proxy_pass http://backend;`前一行添加：

```nginx
proxy_read_timeout 500;
```

将相应超时时间延长至500秒。然后重启nginx：

```bash
systemctl reload nginx
```

这样一般能解决大多数问题。

　　

## 修改投票上限

官方投票选项上限为4个，如果要修改，请参照[这个commit](https://github.com/pullopen/mastodon/commit/537c4fe6eb9a484546dda4776d765114fbb7c50a){:target="_blank"}修改后precompile并重启。

　　

## 添加自定义主题

可以考虑直接从本人站点拿主题来使用：

1. 进入`app/javascript`文件夹，将[本站](https://github.com/pullopen/mastodon/tree/master/app/javascript){:target="_blank"}的`fonts``images`和`styles`文件夹多出来的文件复制入你的代码库。

2. 参照本站的`config/themes.yml`[文件](https://github.com/pullopen/mastodon/blob/master/config/themes.yml){:target="_blank"}添加。

3. （可选）修改`config/locales/en.yml`和`config/locale/zh-CN.yml`的`themes`部分，给你的主题起英文名和中文名。注意这里需要按照原名的字母顺序排列。参考本站文件[en](https://github.com/pullopen/mastodon/blob/master/config/locales/en.yml){:target="_blank"}和[zh-CN](https://github.com/pullopen/mastodon/blob/master/config/locales/zh-CN.yml){:target="_blank"}。

4. Precompile和重启。

如果你有一定css基础，想自己从头编写主题，可以在`app/javascript/styles`下新建一个scss文件，开头写上：

```scss
@import 'application';
```

如果你修改的主题基于亮色主题，则在开头写上：
```scss
@import 'mastodon-light/variables';
@import 'application';
@import 'mastodon-light/diff';
```

然后在下面加上css代码后进行上述2、3、4步骤。

如果你只是想修改配色，可以采用`neon-city`模板（有图片背景）、`sakura`模板（浅色）和`forest`模板（深色），对颜色进行修改。

　　

## 修改界面用语

1. 修改中文json文件内容：

   ```bash
   nano app/javascript/mastodon/locales/zh-CN.json
   ```

2. 到服务器删除编译好的js文件夹：

   ```bash
   rm -rf public/packs
   ```

3. precompile和重启。

　　

## 主页对非登陆用户只显示10条嘟文

根据[1234站长建议](https://1234.as/@a/104201233498936058){:target="_blank"}修改相应文件后precompile并重启。

[![](https://s1.ax1x.com/2020/07/13/Utefds.png)](https://s1.ax1x.com/2020/07/13/Utefds.png){:target="_blank"}
　　
　　

## 在魔改之后进行升级

Docker系统请参见前一篇文章。非Docker的话，你不能再按照官方指南升级，而是应该：

在你的服务器端：

```bash
git remote -v    #查看远程库名字
git fetch --tags 官方远程库名字（如origin）
git merge 官方库名/版本号    #如origin/v3.2.1
git push XXX（你的库） master    #将融合好的代码推到你自己的远程库
```

然后按照官方步骤进行升级和重启。

或者，你可以在电脑端进行相应操作，在Github Desktop右键-Open in Command Prompt：

 [![](https://s1.ax1x.com/2020/11/01/B0oUoT.png)](https://s1.ax1x.com/2020/11/01/B0oUoT.png){:target="_blank"}

 同样进行上述操作后，再到你服务器端：

 ```bash
 git fetch XXX
 git merge XXX/master
 ```

 这样做的好处是，万一在merge的过程中发现你自己的魔改和官方的改动发生冲突，在电脑端通过Visual Studio Code修改更加方便，可以一键选择保留哪一个来源的修改，而服务器端改动稍微困难一些。

　　
## 附：添加站点屏蔽

这一步不需要修改代码，只需要修改nginx设置。

在管理层面封禁一个站点，只能阻止对方的内容流入你自己的站点，并不能完全阻止本站内容流入对方站。如果有这样的需要，可以：

```bash
nano /etc/nginx/sites-available/你的域名
```

添加：

```nginx
  if ($http_user_agent ~* "对方域名不带前后缀") {
        return 403;
   }
```

即可阻止对方站点对本站发出请求嘟文、搜索账号等操作，可与封禁联合使用。注意：如果你站和对方站点同时加入了同一个中继站，那么这个规则设置是无效的，因为对方将从中继站拉取你站的嘟文。

