---
title: 进阶魔改：修改字数上限、媒体上限、投票上限、添加自定义主题、界面用语、非登陆用户有限显示、优化中文搜索，附阻止本站嘟文流入某站点方法
layout: post
tags: [进阶魔改, Mastodon]
image: mastodon-2.png
catalog: true 
category: 进阶魔改
#gif: mygif
description: "一些轻量魔改的方法"
customexcerpt: "本文介绍了给自己的站点修改字数上限、媒体上限、投票上限、添加自定义主题、界面用语、非登陆用户有限显示的方法，并且对魔改之后如何升级进行了一点说明。另附阻止本站嘟文流入某特定站方法。最后，魔改一时爽，合并火葬场，各位在魔改时也要谨慎呀！"
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
exit                        #退出mastodon用户
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

　　

## 修改实例字数上限（2023-07-16修改）

官方嘟文上限为500字，如果需要增加，请修改相应文件：`app/javascript/mastodon/features/compose/components/compose_form.js`（2处）和`app/validators/status_length_validator.rb`（1处），将所有的500修改为你心仪的字数，随后进行precompile/重新编译和重启。

　　

## 修改媒体文件大小上限和分辨率上限

官方媒体大小上限：每张图片/动图/MP3为10M，每个视频40M。上传后长毛象会进行压图图片，压缩后最高分辨率为1638400像素（1280*1280）。

如果需要修改，请参考[这个commit](https://github.com/pullopen/mastodon/commit/674f07ec6fb3e8433674cd5d5c73d3ef6937a881){:target="_blank"}修改相应文件并进行precompile和重启。这一步将压缩后像素上限提升至3686400（1920*1920）像素，图片上限提升至24M，视频为80M。

**注意（2022-03-18更新）：如果先修改后再升级至v3.5.0版本，在merge之后，需要仔细检查`app/models/media_attachment.rb`，重新修改`IMAGE_LIMIT`和`VIDEO_LIMIT`两个参数，因为升级之后这两个参数更换了位置。**

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

本站所用主题中，To the Moon、Stardew Valley、Black Cat、Café、Flora主题为rhabarberbarbara站站长[@barbara@rhabarberbarbara.bar](https://rhabarberbarbara.bar/@barbara){:target="_blank"}原创，请向ta申请授权。其余主题可在开源的前提下使用和修改。

1. 进入`app/javascript`文件夹，将[本站](https://github.com/pullopen/mastodon/tree/master/app/javascript){:target="_blank"}的`fonts``images`和`styles`文件夹多出来的文件复制入你的代码库。

   * 注意：`Win95`主题还需要在`config/webpacker.yml`中加一行`- .gif`才可编译。

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

在v3.3.0版后，请根据[这个commit](https://github.com/orani-admin/mastodon/commit/e06d04b7acf42137efe5b8de9c4b83839537d723){:target="_blank"}修改相应文件后precompile并重启。

　　

## Docker安装优化中文搜索（2022-04-25新增）

官方文档曾给出[优化中文搜索的方法](https://docs.joinmastodon.org/admin/optional/elasticsearch/#search-optimization-for-other-languages){:target="_blank"}，但需要修改相应步骤后才能应用于docker上。

1. 按照[官方文档的优化方法](https://docs.joinmastodon.org/admin/optional/elasticsearch/#search-optimization-for-other-languages){:target="_blank"}修改mastodon源代码（即修改`app/chewy/accounts_index.rb`、`/app/chewy/statuses_index.rb`和`/app/chewy/tags_index.rb`三个文件。用本教程之前所说的[docker魔改方法](https://pullopen.github.io/%E8%BF%9B%E9%98%B6%E9%AD%94%E6%94%B9/2020/11/01/Mastodon-on-Docker-2.html){:target="_blank"}推送。

2. 下载`elasticsearch-analysis-ik`及`elasticsearch-analysis-stconvert`插件，注意插件版本号与你`docker-compose.yml`中`elasticsearch`的版本号保持一致：

   ```bash
   cd /home/mastodon/mastodon/elasticsearch
   export ES_VERSION=7.10.2     #版本号与elasticsearch版本号一致
   wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v${ES_VERSION}/elasticsearch-analysis-ik-${ES_VERSION}.zip
   wget https://github.com/medcl/elasticsearch-analysis-stconvert/releases/download/v${ES_VERSION}/elasticsearch-analysis-stconvert-${ES_VERSION}.zip
   ```

3. `nano docker-entrypoint-es-plugins.sh` 新建插件安装脚本，输入内容：

   ```bash
   #!/bin/bash
   # setting up prerequisites

   export ES_VERSION=7.10.2     #版本号与elasticsearch版本号一致

   yes | elasticsearch-plugin install file:/usr/share/elasticsearch/data/elasticsearch-analysis-ik-${ES_VERSION}.zip
   elasticsearch-plugin install file:/usr/share/elasticsearch/data/elasticsearch-analysis-stconvert-${ES_VERSION}.zip

   exec /usr/local/bin/docker-entrypoint.sh
   ```

   `Ctrl + X`保存并退出。运行：

   ```bash
   chmod u+x docker-entrypoint-es-plugins.sh
   ```

   赋予脚本运行权限。

4. `cd ..` 返回上一级菜单，`nano docker-compose.yml`编辑该文件，在`es`部分的最后一行（即`        hard: -1`下一行）添加：

   ```yaml
       entrypoint: /usr/share/elasticsearch/data/docker-entrypoint-es-plugins.sh
   ```

   `Ctrl + X`保存并退出。


5. 如果此时新的镜像已经准备好：

   `docker-compose down`关闭Mastodon所有服务。

   `cd elasticsearch`进入elasticsearch文件夹。
    
   `rm -rf nodes`删除nodes文件夹。

   `docker pull xxxxxx/mastodon:latest`重新拉取修改后新的镜像（版本号随你推送的版本号调整）。

   `docker-compose up -d` 重启Mastodon。

   此时可运行`docker logs mastodon_es_1 -f -t`查看日志，看两个插件是否安装成功，有无“Fail”/“Error”等报错。正常情况下，应该能在开头部分找到`Installed analysis-ik`和`Installed analysis-stconvert`两行。

   检查无误后`Ctrl + C`退出日志。

6. 运行

   ```bash
   docker-compose run --rm web bin/tootctl search deploy
   ```

   重新部署搜索，一般需要几个小时到几天时间不等。（如果有兴趣了解screen的话可以放在screen中运行，请自行搜索screen安装及使用教程。）

   待部署完毕后，可尝试搜索，看是否较之前优化。

　　


附注：如果你是通过源代码安装或者一键安装，则需根据[官方文档](https://docs.joinmastodon.org/admin/optional/elasticsearch/){:target="_blank"}安装Elsasticsearch后，运行：

```bash
cd /usr/share/elasticsearch
bin/elasticsearch --version     #查看Elasticsearch版本号
export ES_VERSION=7.10.2     #版本号与elasticsearch版本号一致
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v${ES_VERSION}/elasticsearch-analysis-ik-${ES_VERSION}.zip
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v${ES_VERSION}/elasticsearch-analysis-ik-${ES_VERSION}.zip
```

安装两个插件后，再按照[官方文档](https://docs.joinmastodon.org/admin/optional/elasticsearch/#search-optimization-for-other-languages){:target="_blank"}进行魔改、precompile、重启、重新部署Elasticsearch索引。

　　

## 在魔改之后进行升级

Docker系统请参见前一篇文章。非Docker的话，你不能再按照官方指南升级，而是应该：

在你的服务器端：

```bash
git remote -v    #查看远程库名字
git fetch --tags 官方远程库名字（如origin）
git merge 版本号    #如v3.2.1
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
nano /etc/nginx/sites-available/你的站点配置文件（一般以域名命名）
```

在

```nginx
server {
  listen 443 ssl http2;
  server_name 你域名;
```

后面，添加：

```nginx
  if ($http_user_agent ~* "对方域名不带前后缀") {
        return 403;
   }
```

如果知道对方服务器IP地址，还可以在这一部分添加：

```nginx
deny 对方ip;
```

退出保存，`systemctl reload nginx`重启nginx。

并且使用iptable封禁对方ip（root用户）：

```bash
iptables -I INPUT -s 对方ip -j DROP
```

即可阻止对方站点对本站发出请求嘟文、搜索账号等操作，可与封禁联合使用。注意：如果你站和对方站点同时加入了同一个中继站，那么这个规则设置是无效的，因为对方将从中继站拉取你站的嘟文。另外，这些方法也并不能防止从第三方的中转，只能尽量减少嘟文的读取。


## 附：屏蔽国内浏览器及搜索爬虫（2022-04-25更新）

**注意：此方法有一定机率误伤使用国内手机的用户，请务必全面通知后再使用！**

两种方法：

如果使用Cloudflare：可在“防火墙规则”中添加：如果

```
(http.host eq "【站点地址】" and not lower(http.user_agent) contains "feedly" and not lower(http.user_agent) contains "pleroma") and ((lower(http.user_agent) contains "2345") or (lower(http.user_agent) contains "360") or (lower(http.user_agent) contains "ali-") or (lower(http.user_agent) contains "alipay") or (lower(http.user_agent) contains "baidu") or (lower(http.user_agent) contains "bingbot") or (lower(http.user_agent) contains "bytespider") or (lower(http.user_agent) contains "coolnovo") or (lower(http.user_agent) contains "duckduckgo") or (lower(http.user_agent) contains "easou") or (lower(http.user_agent) contains "facebook") or (lower(http.user_agent) contains "google") or (lower(http.user_agent) contains "huaweibrowser") or (lower(http.user_agent) contains "iaskspider") or (lower(http.user_agent) contains "iqiyi") or (lower(http.user_agent) contains "jike") or (lower(http.user_agent) contains "lbbrowser") or (lower(http.user_agent) contains "liebao") or (lower(http.user_agent) contains "maxthon") or (lower(http.user_agent) contains "meizu") or (lower(http.user_agent) contains "metasr") or (lower(http.user_agent) contains "micromessenger") or (lower(http.user_agent) contains "miui") or (lower(http.user_agent) contains "miuibrowser") or (lower(http.user_agent) contains "msnbot") or (lower(http.user_agent) contains "oneplus") or (lower(http.user_agent) contains "oppo") or (lower(http.user_agent) contains "qihoo") or (lower(http.user_agent) contains "qiyu") or (lower(http.user_agent) contains "qq") or (lower(http.user_agent) contains "saayaa") or (lower(http.user_agent) contains "se 1.x") or (lower(http.user_agent) contains "se 2.x") or (lower(http.user_agent) contains "sina") or (lower(http.user_agent) contains "sogou") or (lower(http.user_agent) contains "soso") or (lower(http.user_agent) contains "taobao") or (lower(http.user_agent) contains "taobrowser") or (lower(http.user_agent) contains "tencent") or (lower(http.user_agent) contains "teoma") or (lower(http.user_agent) contains "the world") or (lower(http.user_agent) contains "twitter") or (lower(http.user_agent) contains "ucweb") or (lower(http.user_agent) contains "vivo") or (lower(http.user_agent) contains "wechat") or (lower(http.user_agent) contains "weibo") or (lower(http.user_agent) contains "xiaomi") or (lower(http.user_agent) contains "yahoo") or (lower(http.user_agent) contains "yandexbot") or (lower(http.user_agent) contains "yisou") or (lower(http.user_agent) contains "yodao") or (lower(http.user_agent) contains "youdao") or (lower(http.user_agent) contains "zte"))
```

则阻止。

如果不使用cloudflare，则可在nginx的配置文件的`server { }`括号中添加：

```
  if ($http_user_agent ~* (2345|360|ali-|alipay|archive|baidu|bingbot|bytespider|coolnovo|duckduckgo|easou|facebook|google|huaweibrowser|iaskspider|iqiyi|jike|lbbrowser|liebao|maxthon|meizu|metasr|micromessenger|miui|miuibrowser|msnbot|oneplus|oppo|qihoo|qiyu|qq|saayaa|se\ 1.x|se\ 2.x|sina|sogou|soso|taobao|taobrowser|tencent|teoma|the\ world|twitter|ucweb|vivo|wechat|weibo|xiaomi|yahoo|yandexbot|yisou|yodao|youdao|zte)) {
      return 403;
  }
```





