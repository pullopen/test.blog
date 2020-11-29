---
title: 如何将Mastodon媒体上传至Scaleway云储存
layout: post
tags: [站点维护, Mastodon, 媒体储存]
image: scaleway.png
catalog: true 
category: 站点维护
#gif: mygif
description: "担心服务器被媒体撑爆？上了云储存，再也不用担心硬盘！"
customexcerpt: "如果你的服务器硬盘容量较小，那你可能需要注意媒体文件的增长可能会导致硬盘撑满、站点下线。但是，如果你将所有媒体文件都自动同步到云端硬盘，那你就永远不需要担心这个问题。本文就将教你如何将站点的媒体文件同步到Scaleway云端网盘，再也不用担心这种可能。另外对于小型实例而言，配合定期清理缓存，Scaleway的免费容量足够支撑很长时间，是很不错的选择。"
---

小型实例最担心的是什么？是每天增长的媒体文件会不会撑爆硬盘。虽然靠着清理外站缓存可以坚持很久，可万一有朝一日满了，难道只有服务器扩容一条路可以选择了吗？

不。你还有一个更便宜的方案：**将媒体文件上传到云储存。**

对于一个小型实例而言，你的整体系统和本站数据库所占用的空间其实是很少的，只要将媒体储存转移到云储存中，那你就永远不用担心服务器硬盘被塞满的问题。

那么，要怎么做呢？


**注意：如果你使用的是Docker系统，相应的文件夹需要根据你安装时的设定进行调整，重启命令也需要调整为`docker-compose up -d`。但总体而言差别不大。**

　　

## 选择云储存供应商


可以选择的云储存服务很多，比如Wasabi、Amazon AWS、DigitalOcean Space等等。对于小型实例而言，一个比较合适的方案就是使用Scaleway的云储存：没有最低月费，提供75G免费空间和每月75G流量，超出部分按0.01刀/G/月计算。如果你有Visa信用卡的话，这是小型实例非常优秀的选择。

让我们开始。

　　

## 创建储存库

- 首先，注册[Scaleway](https://www.scaleway.com/){:target="_blank"}。

- 注册完毕后，在控制面板右上角点击**Create**，选择**Create an OS Bucket**，开始创建。

- 命名，选择地区（巴黎/阿姆斯特丹），公开性选择Public，创建。

　　

## 生成API Key

- 点击右上角头像 - Cridentials，下拉到API Tokens栏，点击**Generate New Token**。

- 目的可以自行填写，然后会自动生成一个Access Key和Secret Key。**注意，这里的Secret Key只会出现这一次，请务必复制保存！！！**

　　

## 安装并调试Aws-Cli

- 打开服务器，进入root用户。输入：

     ```bash
     apt install python-pip
     pip install awscli
     ```

     安装aws-cli。

- 进入mastodon用户并调试aws-cli

     ```bash
     su - mastodon        #进入mastodon用户
     aws configure        #调试
     ```

     按指示依次输入Access Key和Secret Key。Region部分，如果你创建时选择的是巴黎则填写`fr-par`，阿姆斯特丹则填写`nl-ams`。Default output format直接回车即可。

　　

## 魔法步骤：同步已有媒体！

- 进入mastodon用户的live文件夹，运行同步命令：

     ```bash
     cd live      #进入live文件夹
     RAILS_ENV=production bin/tootctl media remove
     RAILS_ENV=production bin/tootctl media remove-orphans       #清理外站缓存和无嘟文媒体，为一会儿的迁移减少工作量
     aws s3 sync public/system s3://【你的bucket名】/ --endpoint-url=https://s3.fr-par.scw.cloud --acl public-read        
     ```

     请注意最后一步命令，如果你选择的是巴黎则url为https://s3.fr-par.scw.cloud ，阿姆斯特丹则需更换为https://s3.nl-ams.scw.cloud 。另外**请务必不要遗漏最后的`--acl public-read`，**因为如果不加这一句，上传的所有文件都会设置为私有，无法显示。

     （万一你遗漏了最后这个，让所有媒体文件都变成私有了怎么办呢？一种方法是像我当时那样把原来的媒体库删掉从头再来，另一种方法可以试试[这里](https://stackoverflow.com/questions/53726701/how-to-update-acl-for-all-s3-objects-in-a-folder-with-aws-cli){:target="_blank"}提到的方法，但是我没试过，不保证有效。）

     迁移需要等待一段时间，开着窗口即可。

　　

## 设置Nginx（可选）

这一步是可选步骤，但是设置Nginx一方面可以使你媒体打开的速度和打开你网址的速度变得一样（亦即同样可以使用Cloudflare加速），另一方面，也可以大大节省媒体库流量部分的费用，所以推荐大家可以一起设置。


- 首先，到域名商网站，在DNS添加一个A记录，设置你想用的媒体子域名（我设置的是media.我的域名），指向你的服务器地址。（如果你添加了Cloudflare，则在Cloudflare中设置。）

     ![DNS设置](https://s1.ax1x.com/2020/07/22/UHSzUe.png)


- 找到自己的nginx配置文件，如果你和我一样都是在Digital Ocean上直接用的一键安装包，那么该文件应该位于root用户的/etc/nginx文件夹里。


     ```bash
     exit                            #进入root用户
     nano /etc/nginx/sites-available/media      #修改nginx文件
     ```

     * *2020-07-28 附注：官方文档在最近一次升级后也为大家提供了 **[Nginx设置模板](https://docs.joinmastodon.org/admin/optional/object-storage-proxy/){:target="_blank"}**，可以参考官方文档进行设置，本文仅作补充和存档。*

     * *2020-11-14 补充：官方文档后来经过一次修改，我本人使用修改前的nginx设置可以顺利生效，但是改成修改以后的就无法显示图片，暂时没有排查出原因。因此如果按照官方文档设置不能生效，那么作为备选方案，请找到`set $s3_backend`一行将后面设置为 `'https://s3.fr-par.scw.cloud';`（根据你自己bucket地区不同改变），找到后面的`proxy_pass`一行，将官方的`$s3_backend$uri`改成`$s3_backend/YOUR-MEDIA-BUCKET$uri`（填入自己的bucket名）。*

     - 添加以下部分。注意
         - 修改其中所有的MEDIA.YOUR.DOMAIN为**自己的实例媒体域名**（一共三处）。
         
         - 在location一行后面，修改YOUR-MEDIA-BUCKET修改为**自己的bucket名**。
         
         - 最后一行 https://s3.fr-par.scw.cloud/YOUR-MEDIA-BUCKET/ 按照**自己的bucket地区和bucket名**进行修改。
         
     如果你修改正确，一共应该有**5个地方**需要修改。


     ```nginx
     proxy_cache_path /tmp/nginx_mstdn_media levels=1:2 keys_zone=mastodon_media:100m max_size=1g inactive=24h;
 
     server {
         listen 80;
         listen [::]:80;
         server_name MEDIA.YOUR.DOMAIN;
         return 301 https://MEDIA.YOUR.DOMAIN$request_uri;
 
         access_log /dev/null;
         error_log /dev/null;
     }
 
     server {
         listen 443 ssl http2;
         listen [::]:443 ssl http2;
         server_name MEDIA.YOUR.DOMAIN;
 
         access_log /var/log/nginx/mstdn-media-access.log;
         error_log /var/log/nginx/mstdn-media-error.log;
 
         location /YOUR-MEDIA-BUCKET/ {
                proxy_cache mastodon_media;
                proxy_cache_revalidate on;
                proxy_buffering on;
                proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
                proxy_cache_background_update on;
                proxy_cache_lock on;
                proxy_cache_valid 1d;
                proxy_cache_valid 404 1h;
                proxy_ignore_headers Cache-Control;
                add_header X-Cached $upstream_cache_status;
                add_header 'Access-Control-Allow-Origin' '*';
                proxy_pass https://s3.fr-par.scw.cloud/YOUR-MEDIA-BUCKET/;
         }
 
     }

     ```

     * 注意：Mastodon3.2.0版本后，需要在location部分加上一行`add_header 'Access-Control-Allow-Origin' '*';`，上面的模板已经加入，在这之前设置的朋友请自行检查。

     建立镜像文件：

     ```bash
     ln -s /etc/nginx/sites-available/media /etc/nginx/sites-enabled/media
     ```


- 重启Nginx

     ```bash
     sudo nginx -s reload
     ```

- 安装证书
     ```bash
     sudo certbot --nginx -d 你的媒体域名
     systemctl reload nginx
     ```

　　

## 修改.env.production

```bash
su - mastodon     #再次进入mastodon用户
cd live
nano .env.production     #编辑.env.production
```

在文件最后添加下面几行，fr-par同样按照你的地区决定是否需要修改成nl-ams。如果上一步没有设置nginx，则S3_HOSTNAME设置为s3.fr-par.scw.cloud或s3.nl-ams.scw.cloud（**前面后面什么都不用加**）。

```ruby
S3_ENABLED=true
S3_BUCKET=【你的bucket名】
AWS_ACCESS_KEY_ID=【你的Access key】
AWS_SECRET_ACCESS_KEY=【你的Secret key】
S3_PROTOCOL=https
S3_HOSTNAME=MEDIA.YOUR.DOMAIN  【你的媒体域名】
S3_ENDPOINT=https://s3.fr-par.scw.cloud/  【根据你的地址进行相应改变】
S3_REGION=fr-par  【根据你的地址进行相应改变】
```

现在，再运行一次魔法步骤，确保你操作期间所有的媒体已经上传：

```bash
aws s3 sync public/system s3://【你的bucket名】/ --endpoint-url=https://s3.fr-par.scw.cloud --acl public-read  
```

重启Mastodon

```bash
exit
systemctl restart mastodon-sidekiq
systemctl reload mastodon-web
```



## 清理本地文件

打开你自己的站点，随便点开一个媒体看看地址，是不是已经变成了你设置的媒体地址呢？

如果是的话，那么恭喜你，成功啦！你现在可以安全地删除储存在本地public/system文件夹的媒体文件：

```bash
su - mastodon
cd live
rm -rf public/system
```

成功！从此再也不用担心硬盘爆炸啦！



　　

以上是将媒体文件转移到Scaleway云储存的方法。 **[O3O搭站指南](https://guide.mastodon.im/media){:target="_blank"}**对这一步也有详尽的描述，步骤稍有不同，没有通过nginx而是通过设置CHAME跳转的方式。如果你需要转移到其他的储存如Wasabi，请具体参考 **[这个教程](https://stanislas.blog/2018/05/moving-mastodon-media-files-to-wasabi-object-storage/){:target="_blank"}**，前面需要增加设置Policy的过程。












     





