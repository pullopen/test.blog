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

*注：Scaleway自2022年1月起将Paris地区改为Multi-AZ储存桶，不再有75G免费储存和流量，但对文件数多的情况（即Mastodon媒体储存）支持较好。*

让我们开始。

　　

## 创建储存库

- 首先，注册[Scaleway](https://www.scaleway.com/){:target="_blank"}。

- 注册完毕后，在控制面板右上角点击**Create**，选择**Create an OS Bucket**，开始创建。

- 命名，选择地区（巴黎/阿姆斯特丹），公开性选择Private，创建。

　　

## 生成API Key

- 点击右上角头像 - Cridentials，下拉到API Tokens栏，点击**Generate New Token**。

- 目的可以自行填写，然后会自动生成一个Access Key和Secret Key。**注意，这里的Secret Key只会出现这一次，请务必复制保存！！！**

　　

## 安装并调试Aws-Cli

- 打开服务器，进入root用户。输入：

     ```bash
     apt install python3-pip
     pip install awscli
     ```

     安装aws-cli。

- 进入mastodon用户并调试aws-cli

     ```bash
     su - mastodon        #进入mastodon用户，docker用户不需要
     aws configure        #调试
     ```

     按指示依次输入Access Key和Secret Key。Region部分，如果你创建时选择的是巴黎则填写`fr-par`，阿姆斯特丹则填写`nl-ams`。Default output format直接回车即可。

　　

## 魔法步骤：同步已有媒体！（2023-07-18修改）

- 进入mastodon用户的live文件夹，运行同步命令：

     ```bash
     cd live      #进入live文件夹，docker用户进入你docker-compose.yml所在文件夹
     RAILS_ENV=production bin/tootctl media remove
     RAILS_ENV=production bin/tootctl media remove-orphans       #清理外站缓存和无嘟文媒体，为一会儿的迁移减少工作量，docker用户请用docker专用tootctl命令
     aws s3 sync ./public/system s3://【你的bucket名】 --endpoint-url=https://s3.fr-par.scw.cloud --acl public-read        
     ```

     请注意最后一步命令，如果你选择的是巴黎则url为https://s3.fr-par.scw.cloud ，阿姆斯特丹则需更换为https://s3.nl-ams.scw.cloud 。

     迁移需要等待一段时间，开着窗口即可。

     如果你遗漏了`--acl public-read`问题也不大，现在Scaleway支持设置Bucket Policy，可以在Policy中设置为文件公开可读。可使用aws-cli工具设置policy：

     先建立一个`media-policy.json`文件：

     ```bash
     nano media-policy.json
     ```

     内容为：

     ```
     {
        "Version":"2012-10-17",
        "Statement":[
          {
            "Sid":"AddPerm",
            "Effect":"Allow",
            "Principal":
              {
                "AWS":"*"
              },
            "Action":"s3:GetObject",
            "Resource":"arn:aws:s3:::你的bucket名/*"
          }
        ]
     }
     ```

     随后上传policy：

     ```bash
     aws s3api put-bucket-policy --bucket 你的bucket名 --policy file://media-policy.json
     ```

     可以用get-bucket-policy验证：

     ```bash
     aws s3api get-bucket-policy --bucket 你的bucket名
     ```

     看policy是否生效。

　　

## 设置Nginx（可选，2023-07-18修改）

这一步是可选步骤，但是设置Nginx一方面可以使你媒体打开的速度和打开你网址的速度变得一样（亦即同样可以使用Cloudflare加速），另一方面，也可以大大节省媒体库流量部分的费用，所以推荐大家可以一起设置。


- 首先，到域名商网站，在DNS添加一个A记录，设置你想用的媒体子域名（我设置的是media.我的域名），指向你的服务器地址。（如果你添加了Cloudflare，则在Cloudflare中设置。）

     ![DNS设置](https://s1.ax1x.com/2020/07/22/UHSzUe.png)


- 找到自己的nginx配置文件，该文件一般位于root用户的/etc/nginx文件夹里。


  ```bash
  exit                            #进入root用户
  nano /etc/nginx/sites-available/media      #修改nginx文件
  ```

  官方文档为大家提供了 **[Nginx设置模板](https://docs.joinmastodon.org/admin/optional/object-storage-proxy/){:target="_blank"}**，可以参考官方文档进行设置，修改其中的“files.example.com”为你的媒体域名，“YOUR_BUCKET_NAME.YOUR_S3_HOSTNAME”为“【你的bucket名】.s3.nl-ams.scw.cloud或者s3.fr-par.scw.cloud”。


- 安装证书
  ```bash
  sudo certbot certonly --nginx -d 你的媒体域名
  ```

- 修改nginx文件

  ```bash
  nano /etc/nginx/sites-available/media
  ```

  在nginx文件的最后半个`}`上方添加证书：

  ```
  ssl_certificate /etc/letsencrypt/live/你的媒体域名/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/你的媒体域名/privkey.pem;
  ```

  `Ctrl+X`保存。

- 建立镜像文件：

  ```bash
  ln -s /etc/nginx/sites-available/media /etc/nginx/sites-enabled/media
  ```


- 重启Nginx

  ```bash
  nginx -t   #检查是否有报错
  systemctl reload nginx
  ```
　　

## 修改.env.production

```bash
su - mastodon     #再次进入mastodon用户，docker用户不需要
cd live            #docker用户进入docker-compose.yml所在文件夹
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
S3_ALIAS_HOST=MEDIA.YOUR.DOMAIN【如果使用nginx代理，则需加上这一行】
```

现在，再运行一次魔法步骤，确保你操作期间所有的媒体已经上传：

```bash
aws s3 sync ./public/system s3://【你的bucket名】 --endpoint-url=https://s3.fr-par.scw.cloud --acl public-read    #根据地址修改
```

重启Mastodon

```bash
exit
systemctl restart mastodon-sidekiq
systemctl reload mastodon-web   #docker用户使用docker-compose down && docker-compose up -d
```



## 清理本地文件

打开你自己的站点，随便点开一个媒体看看地址，是不是已经变成了你设置的媒体地址呢？

如果是的话，那么恭喜你，成功啦！你现在可以安全地删除储存在本地public/system文件夹的媒体文件：

```bash
su - mastodon
cd live      #docker用户打开docker-compose.yml所在文件夹
rm -rf public/system
```

成功！从此再也不用担心硬盘爆炸啦！



　　

以上是将媒体文件转移到Scaleway云储存的方法。 **[O3O搭站指南](https://guide.mastodon.im/media){:target="_blank"}**对这一步也有详尽的描述，步骤稍有不同，没有通过nginx而是通过设置CHAME跳转的方式。另外本篇主要参考 **[这个教程](https://stanislas.blog/2018/05/moving-mastodon-media-files-to-wasabi-object-storage/){:target="_blank"}**进行了修改。












     





