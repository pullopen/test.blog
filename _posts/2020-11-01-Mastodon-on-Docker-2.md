---
title: 如何利用Docker搭建Mastodon实例（二）：进阶魔改篇
layout: post
tags: [进阶魔改, Mastodon, Docker]
image: docker-logo-3.png
catalog: true 
category: 进阶魔改
#gif: mygif
description: "如何在Docker系统上维持你的魔改"
customexcerpt: "Docker的缺点在于官方镜像灵活性较低。那么如果需要对Docker上搭建的站点进行轻量魔改，需要怎么做才能轻松应对：既不用在本地编译镜像导致服务器压力过高，又不用每次升级都重新魔改一次呢？"
---


## 谁有这样的需求


前一篇[教程](https://pullopen.github.io/%E5%9F%BA%E7%A1%80%E6%90%AD%E5%BB%BA/2020/10/19/Mastodon-on-Docker.html){:target="_blank"}中我曾提到Docker搭建长毛象的优缺点：


**优点：**

  1. 搭建、升级方便，命令简单，不用自行配置环境，比起用官方文档命令行搭建而言，更适合新手。

  2. 对内存较小的服务器，可以免除每次升级需要的编译（precompile）步骤给小机器带来的负担。

  3. Mastodon站点运行在一个隔离的小环境（容器）中，安全性较高，不怕新手操作把整个系统搞崩，出现问题之后只要重启即可，会按镜像自动复原。


**缺点：**

  1. 可用教程较少，许多命令需要重新学起。

  2. 魔改字数等相对而言不太方便，需要增加一个步骤，在下面会详细列出。

  3. 需要学习docker相关命令。


教程出来之后，大家都反馈安装十分方便，但对于需要魔改的同学来说就有点犯难了。因为官方给定了镜像文件，在容器里修改、融合改动（merge）又不如源码安装那样方便，难道每次升级都要从头魔改一次吗？

答案是不用。只要跟着本文进行设置，魔改之后每次升级都能安心、省心地度过。

注意：本文仅适合**既希望享受Docker的安全、稳定，又希望能照抄他人轻量稳定魔改的朋友**，不适合需要经常对本站进行魔改、调试、创新的技术大佬。

本教程依旧完全依赖兔子（@star@b612.me）大佬的手把手指导，绝大部分截图来自于当时ta的示范，万分感谢！

　　

　　

## 如何在Docker上保留你的魔改

这个问题兔子之前曾教我两种解决方案：

1. 升级后在docker容器中重新魔改。具体步骤为：

   ```bash
   docker exec -it mastodon_web_1 /bin/bash
   ```

   进入docker容器后，按照源代码方式进行修改和precompile。

   此种方法的优点是即时修改显示效果快，但不能持久，重启之后所有改动就会消失。为了保存此次修改，需要在precompile并`exit`退出后，执行

   ```bash
   docker ps | grep mastodon_web | awk '{print $1}'    #查看容器id
   docker commit -m "【改动内容摘要】" 【容器id】 tootsuite/mastodon:【当前mastodon版本号】
   ```

   但这个方法的缺点在于，在未来的升级中，所有改动都需要重新执行此步，非常麻烦，所以该方法更适用于临时调试和紧急升级，可与后文讲述的方法结合。


2. 先升级代码，然后在自己机器中用`docker-compose build`编译镜像。

   此方法的编译过程每次都要等待很久，对小机器也是一种考验，完全丢失了docker方法的优点。不推荐。
   

因此，在各位大佬的帮助和兔子手把手指导下，本文会重点介绍**第三种方法**：利用GitHub进行镜像编译，再将编译好的镜像拉到自己的服务器中直接使用。

　　

### 1. 在GitHub上创建自己站点的分支并进行代码魔改（2023-07-08修改）

   如果你已经通过前述教程用Docker安装了Mastodon，那么你的站点应当是尚未经过魔改的官方稳定版本。所以在注册GitHub账号后，推荐你到[官方GitHub页面](https://github.com/tootsuite/mastodon){:target="_blank"}，在右上角点击“Fork”按钮，将官方代码复制到你自己的库中。

   随后，在自己的个人电脑推荐安装三个软件：

   * **[Git](https://git-scm.com/downloads){:target="_blank"}**，基础代码软件，后文大量内容需要用到。
   
   * GitHub官方出的 **[GitHub Desktop](https://desktop.github.com/){:target="_blank"}**，可以进行很多可视化的git操作，非常实用。
     
   * **[Visual Studio Code](https://code.visualstudio.com/){:target="_blank"}**，可以用来编辑代码。虽然记事本也能对付，但是万一哪次魔改代码时merge失败出现冲突（conflict），VS可以直接定位到错误地点，并且提示你一键接受新改动/保留旧改动/两者都接受，不用再自己尝试修改代码。

   [![GitHubDesktop界面](https://s1.ax1x.com/2020/11/01/B0Woy6.png)](https://s1.ax1x.com/2020/11/01/B0Woy6.png){:target="_blank"}

   在安装完这3个软件之后，请按照[Git设置指南](https://docs.github.com/en/get-started/quickstart/set-up-git#setting-up-git){:target="_blank"}中**“Setting up Git”**部分设置好本地git的用户名（username）和邮箱（email address）。
   
   随后，你就可以通过GitHub Desktop将自己库中的代码下载下来，在VS中进行代码魔改后，再直接提交（commit）并推送（push）到GitHub网站你的远程库中，非常方便。

   按照mastodon采用的AGPL3.0协议，站长作为服务提供者，任何对源代码的改动都要开源，并在站内公开repo地址。可在`.env.production`文件里加一行配置：

   ```ruby
   GITHUB_REPOSITORY=你的GitHub名/mastodon
   ```

　　

### 2. 在DockerHub中建立属于自己的镜像（2023-07-08修改）

   * 在[DockerHub](https://hub.docker.com/){:target="_blank"}上注册账号，Account Setting - Security- Access Tokens创建密钥。
     
      [![DockerHub创建密钥](https://s1.ax1x.com/2020/11/01/B0fvEF.png)](https://s1.ax1x.com/2020/11/01/B0fvEF.png){:target="_blank"}

   * 回到GitHub，打开你自己的代码，Settings - Secrets and variables - Action - New repository secret，创建“DOCKERHUB_USERNAME”和“DOCKERHUB_TOKEN”字段，输入你的DockerHub用户名和密钥。
     
      [![GitHub创建NewSecrets](https://s1.ax1x.com/2023/07/08/pCgibDS.png)](https://s1.ax1x.com/2023/07/08/pCgibDS.png){:target="_blank"}

      [![DOCKERHUB_USERNAME&DOCKERHUB_TOKEN](https://s1.ax1x.com/2023/07/08/pCgiHu8.png)](https://s1.ax1x.com/2023/07/08/pCgiHu8.png){:target="_blank"}

   * 在你自己的mastodon库中，打开`.github/workflows/build-image.yml`，修改如下5处部位：

      [![修改build-image.yml](https://s1.ax1x.com/2023/07/08/pCgFwqS.png)](https://s1.ax1x.com/2023/07/08/pCgFwqS.png){:target="_blank"}

      随后提交修改。

      此时点开上方的“Action”面板，应该就能看到workflow已经开始运作。其中耗时最长的就是build-image的workflow，一般每次重新编译需要3个多小时。

      如果你后续魔改的代码中出现错误，编译失败，则可以点开具体的编译过程，搜索“ERROR”，一般能够找到错误的原因——不要慌，反正不是在你自己的机器上折腾，弄不坏。

　　

### 3. 将编译完成的镜像拉到你自己的服务器上

   到服务器中：
   
   ```bash
   cd /home/mastodon/mastodon        #进入所在文件夹
   docker pull 你的DOCKERHUB用户名/mastodon:edge        #edge为最新编码的tag，如果需要创建特定版本的tag，在后文中有说明如何推送
   nano docker-compose.yml
   ```

   修改`docker-compose.yml`文件，将下列三处（web、streaming和sidekiq）修改为“你的DOCKERHUB用户名/mastodon:你设置的TAG名”：

   [![](https://s1.ax1x.com/2020/11/01/B0IhMn.png)](https://s1.ax1x.com/2020/11/01/B0IhMn.png){:target="_blank"}


   ```bash
   docker-compose up -d
   ```


   启动，你的魔改版站点就上线啦！

　　

　　

## 未来如果想要魔改……

   未来如果魔改，只需要在电脑中修改好代码，一口气push到GitHub中，GitHub会自动编译并且推送到DockerHub中去。
   
   如果你设置的tag一直都是edge，那么每次只要等待编译完成后：

   ```bash
   cd /home/mastodon/mastodon
   docker pull 你的DOCKERHUB用户名/mastodon:edge
   docker-compose up -d
   ```

   即可。

   
　　

　　

## 升级（2023-07-08修改）

   升级其实也就是另一种意义的魔改。在本地电脑中，Github软件 - 相应repository - 右键 - Open in Command Prompt：
  
   [![](https://s1.ax1x.com/2020/11/01/B0oUoT.png)](https://s1.ax1x.com/2020/11/01/B0oUoT.png){:target="_blank"}

   在命令行中：

   ```bash
   git remote -v
   ```

   查看远程库版本是否包含了官方“tootsuite/mastodon”和“你自己/mastodon”，以及它们分别叫什么名字（一般为origin和upstream）。如果没有，需要用“`git remote add 自己起个名 GitHub地址`”命令进行添加，比如：

   ```bash
   git remote add upstream https://github.com/tootsuite/mastodon.git
   ```

   然后拉取官方版本的进展（假设你这里官方版本的名字是upstream）：

   ```bash
   git fetch --tags upstream
   git merge v4.1.4   #要升级的tag名
   ```

   进行融合操作。

   如果新代码与你的魔改出现冲突，GitHub Desktop会显示出所有你冲突的文件，会提示你依次转到Visual Studio Code中解决。只要选择接受哪一方的改动即可。

   注：GitHub在有些地方被墙或者速度很慢，可以使用代理（[cmd代理设置教程](https://blog.csdn.net/BXD1314/article/details/78486992?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.edu_weight&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.edu_weight){:target="_blank"}）。如有必要，可以将这一步完全转到服务器上使用git命令行进行。这里可以参考[廖雪峰Git入门教程](https://www.liaoxuefeng.com/wiki/896043488029600){:target="_blank"}和[命令详解](https://git-scm.com/book/zh/v2/){:target="_blank"}，本文不再赘述。

   这样推送后编译（build）的结果是更新“edge”这个tag。但是，如果你希望每个版本都创建标注相应tag的容器，方便未来回退，那么在完成上述步骤的推送后还需要增加几步：

   ```bash
   git tag -f v4.1.4   #将相应tag标注在你最新提交的修改上
   git push origin v4.1.4    #将这个tag推送到远程github库中
   ```

   这之后，你点开自己在github上的库，可以看到相应的tag，在Action栏目中可以看到正在对该tag进行编译。

   [![](https://s1.ax1x.com/2023/07/08/pCgk6Te.png)](https://s1.ax1x.com/2023/07/08/pCgk6Te.png){:target="_blank"}

   推送到远程库后，后续操作则和上一部分一样：待编译完成后，在你的服务器中

   ```bash
   cd /home/mastodon/mastodon
   docker pull 你的DOCKERHUB用户名/mastodon:edge      #edge为最新改动的tag，也可以设置为相应版本号如v4.1.4      
   docker-compose up -d
   ```

   然后根据官方升级指示，看是否需要执行其他步骤如`docker-compose run --rm web rails db:migrate`等。
　　

　　

## 总结

总而言之，通过这种方法，每次升级的步骤只需要：merge改动-推送到GitHub-等待20分钟待编译完成-将镜像拉到服务器-重启-根据官方指示看是否需要其他步骤，相对而言简单许多。因为编译使用的是GitHub的资源，所以不会对本地服务器造成负担，也不用担心编译错误/内存不足等问题会导致全站崩溃。但缺点在于每次编译都需要等待20分钟，如果需要调试修改，则会耗费大量时间。因此，使用Docker安装Mastodon，更适合仅需照抄已成熟魔改、小机器、同时希望保证站点安全的朋友，并不适合热衷于试验的开发者。

在后续的文章中，本博客也将列举一些常见的魔改，希望能给大家提供帮助。





    









