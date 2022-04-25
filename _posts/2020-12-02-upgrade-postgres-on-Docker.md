---
title: Docker系统如何升级Postgres数据库（已过时，仅作为存档）
layout: post
tags: [Postgres, Mastodon, Docker]
image: postgres.png
catalog: true 
category: 站点维护
#gif: mygif
description: "如何升级Postgres数据库"
customexcerpt: "本文已作废。官方自3.5.0版本后将`docker-compose.yml`的postgres版本号升级成了14，升级步骤见这份教程(https://github.com/mastodon/mastodon/pull/16947)，本文仅作为存档保存。"
---


**注意（2022-03-18更新）：官方自3.5.0版本后将`docker-compose.yml`的postgres版本号升级成了14，升级步骤见[这份教程](https://github.com/mastodon/mastodon/pull/16947)，本文仅作为存档！**

**如果依然需要参考本教程，则需注意在v3.5.0后：1. postgres版本升级为14。2. postgres文件夹地址发生改变，改为了postgres14。**


本升级教程依旧是@star@b612.me兔子老师的手把手指导记录。

## 为何需要

在v3.3.0版本之后，迁移数据时会出现可能发生错误的提示。这是由于系统自带的`glibc`在2.28版本之后，处理数据的方式发生巨大变化，如果曾经使用过该版本之前的系统，系统升级后依然使用原有数据库，可能导致数据库索引发生问题。

查看自身gblic版本方法：

```bash
ldd --version
```

会显示是GLIBC的哪个版本。

官方给出了[检查和解决方案](https://docs.joinmastodon.org/admin/troubleshooting/index-corruption/){:target="_blank"}，但如果你之前使用了[本站教程](https://pullopen.github.io/%E5%9F%BA%E7%A1%80%E6%90%AD%E5%BB%BA/2020/10/19/Mastodon-on-Docker.html){:target="_blank"}最早的版本采用Docker安装，由于官方给出的`docker-compose.yml`文件中数据库版本还是Postgres 9.6，无法运行官方检查使用的插件。

因此，可以直接选择对Postgres数据库进行升级并重新编码数据库。思路是：将数据库文件从二进制导出变为文本，将数据库升级后再导回数据库重新编码为二进制。重新编码之后数据库的索引版本将与系统保持一致，不会再出现不适配的问题，用官方的检查方案进行检查也不会有任何问题。


　　

## 步骤

　　

#### 1. 拉取12.5的pg镜像

   ```bash
   docker pull postgres:12.5-alpine
   ```

 　　

#### 2. 关闭mastodon服务

   ```bash
   cd /home/mastodon/mastodon     #mastodon docker所在文件夹
   systemctl stop nginx           #关闭nginx，禁止入口流量，使数据库不再发生变化
   docker stop mastodon_web_1
   docker stop mastodon_sidekiq_1
   docker stop mastodon_streaming_1
   docker stop mastodon_redis_1        #关闭mastodon其他服务
   ```

   此时使用`docker ps`查看，mastodon相关服务应该仅剩`mastodon_db_1`和`mastodon_es_1`（如果开启了全文搜索）。

　　

#### 3. 执行全局备份

   ```bash
   docker exec mastodon_db_1 pg_dumpall -c -U postgres > ./fullbackup.sql
   ```

   与此同时，如果你按照[之前教程](https://pullopen.github.io/%E5%9F%BA%E7%A1%80%E6%90%AD%E5%BB%BA/2020/10/19/Mastodon-on-Docker.html){:target="_blank"}设置了自动备份，安全起见也可以另外在此时运行一下备份脚本，以免后续操作出现问题。

   停止所有服务：

   ```bash
   docker-compose down
   ```

   重命名旧的postgres库
   ```bash
   mv ./postgres ./postgres9-old
   ```

　　

#### 4. 在新版本postgres库中恢复数据

   新建一个postgres12的容器：

   如果你设置了数据库的密码：

   ```bash
   docker run --name postgres12 -v /当前文件夹绝对路径/postgres:/var/lib/postgresql/data -e POSTGRES_PASSWORD=旧库密码 -d postgres:12.5-alpine
   ```

   如果你没有设置数据库的密码：

   ```bash
   docker run --name postgres12 -v /当前文件夹绝对路径/postgres:/var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.5-alpine
   ```

   然后，`docker ps | grep postgres12 | awk '{print $1}'`查看`postgres12`一行最前面的代码，通过`docker cp`命令将刚才生成的备份拷贝入docker容器：

   ```bash
   docker cp ./fullbackup.sql 刚查到的代码:/tmp/fullbackup.sql
   ```

   随后进入容器：

   ```bash
   docker exec -it postgres12 /bin/bash
   su - postgres
   ```

   导入备份：

   ```bash
   psql -f  /tmp/fullbackup.sql
   ```

   随后两次`exit`退出容器。

　　

#### 5. 将数据库挂载到mastodon上

   停止postgres12：

   ```bash
   docker stop postgres12
   docker rm postgres12
   ```

   `nano docker-compose.yml`修改docker-compose.yml，将`db`部分的`image`一行改成：

   ```ruby
   image: postgres:12.5-alpine
   ```

   重启mastodon和nginx：

   ```bash
   docker-compose up -d
   systemctl start nginx
   ```

   升级就完成啦！数据库版本可以打开网页，在“首选项-管理”中查看。

　　

　　
## 检查

   按照官方[检查方案](https://docs.joinmastodon.org/admin/troubleshooting/index-corruption/){:target="_blank"}检查即可。注意官方给出的代码均要在数据库中输入，具体需要：

   ```
   docker exec -it mastodon_db_1 /bin/bash
   su - postgres
   psql
   ```

   之后再进行输入，不要忘记分号。

   检查之后，需要再次重启：

   ```
   docker-compose down
   docker-compose up -d
   ```
