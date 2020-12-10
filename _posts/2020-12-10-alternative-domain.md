---
title: 如何为本站添加备用域名
layout: post
tags: [域名, Mastodon, nginx]
image: berlin-wall.jpg
catalog: true 
category: 站点维护
#gif: mygif
description: "如何为本站添加备用域名"
customexcerpt: "由于众所周知的原因，中文站总容易出现大陆访问速度减慢甚至不能访问的情况。那么作为站长，如何保证本站在大陆依然可以使用呢？本文就将给大家介绍添加备用域名的方法。"
---

由于众所周知的原因，中文站总容易出现大陆访问速度减慢甚至不能访问的情况。那么作为站长，如何保证本站在大陆依然可以使用呢？本文就将给大家介绍添加备用域名的方法。

本文重点参考bgme大佬的博文，感谢大佬。

另外，由于本人对nginx并不十分掌握，中间肯定会有诸多错漏，请大家多多指出，感谢！

　　

## 被墙方式

首先关于被墙方式的判断，可以参考bgme大佬的博文[《如何检测网站是否被防火墙屏蔽》](https://blog.bgme.me/index-2.html){:target:="_blank"}，而对于墙的机制，[维基百科](https://zh.wikipedia.org/wiki/%E9%98%B2%E7%81%AB%E9%95%BF%E5%9F%8E){:target:="_blank"}亦有详细描述。还可以通过[Analyzer](https://zh.greatfire.org/analyzer){:target:="_blank"}测试某网站被墙的方式。当然，上述都需要一定的计算机基础（aka我也看不太懂）。对于小白如我，大致考虑**两个层面**被墙：域名层面和IP层面。

　　

## 域名层面被墙

目前绝大多数的站点被墙方式均为DNS投毒，即域名层面被墙。对于这种情况，只需要在同一个服务器添加备用域名即可。步骤如下：

　　

### 1. 购买另一个域名

   不再赘述。

### 2. 将新域名指向服务器

   在域名服务商的DNS控制面板，设定一个指向服务器地址的**A记录**，Host填写子域名或者@，Value填写你服务器的IP地址。

### 3. 配置nginx

   在服务器root用户下：

   ```bash
   cd /etc/nginx/sites-available     #转到相应文件夹
   ls -a                #看看自己这个文件夹里有什么文件，一般是以站点地址命名
   cp 原配置文件 备用域名配置文件       #将自己原来的配置文件复制一份并以新名字粘贴在原地，通常也以域名命名
   nano 备用域名配置文件     #对新文件进行编辑
   ```

   编辑备用域名配置文件，进行下列改动：

   1. 将`server_name`后面所有的原站名改成备用域名。

   2. 将所有的`backend`改成`backend2`。

   3. 将所有的`streaming`改成`streaming2`。

   4. `proxy_cache_path`这一行，`/var/cache/nginx`换个文件夹（我直接在后面加了个/2），`keys_zone=CACHE`改成`keys_zone=CACHE2`。`proxy_cache`一行后面的`CACHE`改成`CACHE2`。

   5. 在`ssl_certificate`和`ssl_certificate_key`两行前各加一个#，先注释掉。

   保存。

   启用改动：

   ```bash
   ln  -s  /etc/nginx/sites-available/备用域名配置文件 /etc/nginx/sites-enabled       #在sites-enabled文件夹中建立软链接
   systemctl reload nginx      #重新加载nginx
   ```

   随后通过certbot申请证书：

   ```bash
   sudo certbot --nginx -d 备用域名
   systemctl reload nginx
   ```

### 4. 到.env.production添加备用域名

   完成上面一步之后，实际上通过新站址已经可以登录使用了。但为了让别站可以通过备用域名进行搜索和艾特，需要修改`.env.production`文件，添加备用域名。

   修改`.env.production`文件，在最后一行添上（如备用域名不止一个，可添加多行）：

   ```ruby
   ALTERNATE_DOMAINS=备用域名
   ```

   随后重启mastodon。

   非docker：

   ```
   systemctl restart mastodon-sidekiq
   systemctl reload mastodon-web
   systemctl restart mastodon-streaming
   ```

   或docker系统：

   ```
   docker-compose down
   docker-compose up -d
   ```

   即可。

　　

## IP层面被墙

如果是服务器IP层面被墙，或是觉得原先的服务器访问速度不够快，也可以通过服务器中转的方式进行反代。

### 1. 购买域名和服务器

   该服务器可能不需要很高的内存和CPU配置，但需要**较大的带宽和每月流量限制**。

   将域名dns通过A记录指向新服务器的IP地址。

### 2. 在新服务器安装nginx和certbot

   ```bash
   sudo apt install nginx -y     #安装nginx
   apt install snapd
   sudo snap install core; sudo snap refresh core
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot         #安装certbot
   ```

### 3. 在新服务器配置nginx文件

   具体参见bgme教程[《使用Nginx反代Mastodon》](https://blog.bgme.me/posts/nginx-reverser-proxy-for-mastodon/)，这篇博文讲述了详细原理。此处仅摘抄大佬提供的一键脚本：

   ```bash
   nano fandai.sh
   ```

   编辑fandai.sh，将下列脚本复制进去，修改最开始两行为你的原域名和新的备用域名：

   ```bash
   ORIGIN_DOMAIN=origin_site_domain
   ALTER_DOMAIN=alter_site_domain

   wget https://blog.bgme.me/listings/mstdn_proxy_common_setting.conf -O /etc/nginx/conf.d/mstdn_proxy_common_setting.conf

   cd /etc/nginx/sites-available
   [ -e ${ALTER_DOMAIN} ] && mv ${ALTER_DOMAIN} ${ALTER_DOMAIN}.bak
   wget https://blog.bgme.me/listings/mastodon_reverser_proxy.conf -O ${ALTER_DOMAIN}
   sed -i -e "s/bgme\.me/${ORIGIN_DOMAIN}/g" -e "s/mstdn\.0x77\.cf/${ALTER_DOMAIN}/g" -e "s/bgme_me/$(echo ${ORIGIN_DOMAIN} | tr . _)_${RANDOM}/g" ${ALTER_DOMAIN}
   # ssl_certificate
   [ -e ${ALTER_DOMAIN}.bak ] && \
   grep "managed by Certbot" ${ALTER_DOMAIN}.bak | grep ssl_certificate >> ${ALTER_DOMAIN} && \
   echo '}' >> ${ALTER_DOMAIN} && \
   sed -i -e "s/}    ssl_certificate/    ssl_certificate/g" ${ALTER_DOMAIN}
   # content-security-policy
   CSP=$(curl -Is https://${ORIGIN_DOMAIN} | grep "content-security-policy:" | sed -e "s/content-security-policy: //g" -e "s/; img/ https:\/\/${ALTER_DOMAIN}; img/g" -e "s/; style/ https:\/\/${ALTER_DOMAIN}; style/g" -e "s/; media/ https:\/\/${ALTER_DOMAIN}; media/g" -e "s/; connect/ https:\/\/${ALTER_DOMAIN}; connect/g" -e "s/; script\-src 'self'/ https:\/\/${ALTER_DOMAIN}; script\-src 'self' https:\/\/${ALTER_DOMAIN}/g" | sed 's/\r$//g') && \
   sed -i -e "s~CSP_rules~${CSP}~g" ${ALTER_DOMAIN}

   cd ../sites-enabled/
   [ -e ${ALTER_DOMAIN} ] || ln -s /etc/nginx/sites-available/${ALTER_DOMAIN} .

   nginx -s reload
   ```

   运行脚本：

   ```bash
   bash ./fandai.sh
   ```

   会自动配置nginx文件。

   随后申请证书：

   ```bash
   certbot --nginx -d 新的域名
   systemctl reload nginx
   ```

### 4. 到.env.production添加备用域名

   同上。

自此，你可以通过新的域名，经过新服务器的中转访问原先被墙的地址。

　　

## 如果你设置了上云和媒体域名……

如果你之前曾将媒体上传至云端并通过nginx设置了媒体域名，且你的媒体域名同时被墙，那么，你需要为你的媒体域名专门设置一个新的反代地址。

### 1. 设置nginx新媒体域名文件

   在之前设置了媒体域名之后，实际上用户是通过你的媒体域名→访问s3文件库。那么作为站点管理者，非常简单，只要再复制一份同样的nginx文件，略作修改即可。

   如果新的媒体域名配置文件依然放在**原有服务器**：

   1. 将`server_name`后面所有的原媒体域名改成新媒体域名。

   2. `proxy_cache_path`这一行换个文件夹（我直接在后面加了个/2），`keys_zone=`和`proxy_cache`一行后面换一个名字（比如后面加个2）。

   3. 在`ssl_certificate`和`ssl_certificate_key`两行前各加一个#，先注释掉。

   如果新的媒体域名配置文件放在**新服务器**：

   1. 将`server_name`后面所有的原媒体域名改成新媒体域名，其余可以不用改动。

   2. （如果是根据官方模板设置，则需在开头添加一行：

      ```ruby
      proxy_cache_path /tmp/mastodon_media levels=1:2 keys_zone=mastodon_media:100m max_size=1g inactive=24h;
      ```

      并将后面的`proxy_cache`一行后面的`CACHE`改成`mastodon_media`。）

   保存。

   启用改动：

   ```bash
   ln  -s  /etc/nginx/sites-available/新媒体域名文件 /etc/nginx/sites-enabled       #在sites-enabled文件夹中建立软链接
   systemctl reload nginx      #重新加载nginx
   ```

   随后通过certbot申请证书：

   ```bash
   sudo certbot --nginx -d 新媒体域名
   systemctl reload nginx
   ```

### 2. 修改备用域名的站点配置nginx文件，使所有媒体通过新媒体域名访问

   ```bash
   nano /etc/nginx/sites-available/站点的备用域名配置文件
   ```

   在一系列`sub_filter`的最后一行，添加：

   ```ruby
   sub_filter '旧媒体域名' '新媒体域名';
   ```

   保存。重启nginx：

   ```bash
   systemctl reload nginx
   ```

自此，通过备用域名访问，所有的媒体地址都会变为新的媒体域名。

　　

## 总结

通过nginx反代的方式，可以为自己的mastodon站点设置备用域名。

* 如果单纯域名被墙，可以直接在原有服务器中设置nginx。

* 如果域名和服务器IP均被墙，可以另买一台服务器进行nginx中转。

* 如果曾经设置了媒体域名，则需要对媒体也进行代理。

需要注意的是，bgme原文中提供的方法，即使不是站点拥有者也可以设置反代。因此，用户需要注意，仅通过自己搭建的、或者网站拥有者搭建的反代站名进行登录，否则可能有信息泄露的风险。






