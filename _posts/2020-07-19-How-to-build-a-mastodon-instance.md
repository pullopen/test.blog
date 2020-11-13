---
title: 技术小白如何搭建Mastodon实例
layout: post
tags: [基础搭建, Mastodon]
image: mastodon-preview.jpg
catalog: true 
category: 基础搭建
#gif: mygif
subtitle: "没有IT背景的技术小白，如何搭建一个Mastodon实例？"
customexcerpt: "从购买域名和服务器，到使用Digital-Ocean镜像一键建站：手把手教零基础的你如何将社交网络掌握在自己手中。"
---

首先，如果你点开了这个博客，那我相信你已经对Mastodon及整个Fediverse的概念有了一定了解，并且在一定程度上理解了这种去中心化的社交模式为何能够最大程度地避免资本剥削，本文在此不再赘述。引用奈奈一句通俗的话来说就是：

 > 微博、推特：认平台为爹。

 > Mastodon：有几千个爹可以选，还能自己当爹。

而本文所要讲的内容就是：~~如何当自己的爹？~~ 如何做自己社交网络的主人？

——相信我，我在搭站之前接触过最“高级”的计算机程序是Excel而已。如果我都能成功，那你一定也能。

本文重点参考了**奈奈的[一键安装Mastodon](https://i.nebula.moe/posts/2019-09-13-mastodon/){:target="_blank"}**，和我自己搭站过程中的一些经验，希望能给大家带来一些帮助。

另外，O3O站长也详细撰写了一本 **[Mastodon搭建参考手册](https://guide.mastodon.im/){:target="_blank"}**，从购买域名开始进行了极为详尽的指导，建议大家参考。

　　

## 0. 准备

建站之前你需要：

 - 看得懂英文。

 - 最好能够拥有一张信用卡或者PayPal账号。（如果你只有支付宝账号也可以，但是选择会少很多。）

 - 最好能够拥有科学上网工具。（同样，没有也可以，但是很多网站打开会很慢。）

 - 最好能够拥有一个海外邮箱，如Gmail、Outlook、Yahoo、Protonmail.com、Mail.com等。请尽量不要使用126、qq或者sina等国内邮箱。

 - （如果您拥有Google Voice号码可能在接收验证码时更加方便，可以考虑一下万能的淘宝。这一步并非必要。）


如果没什么问题，那我们开始。

　　

## 1. 购买域名

第一步是购买域名。

**请注意，您一旦在某域名上搭建完毕，极难更改，请谨慎选择！**

关于域名选择，在O3O站长的[搭站指南](https://guide.mastodon.im/domain){:target="_blank"}中有更详细完善的步骤，请大家参考。

我个人比较推荐在[NameCheap](https://www.namecheap.com/){:target="_blank"}上进行购买，它会免费提供WHOIS个人信息保护服务，让你在购买域名时填写的个人信息不会被随意查询。另外它网站上域名的购买价格也相对比较便宜。支持PayPal和信用卡。

如果你没有PayPal或信用卡，那么[Godaddy](https://www.godaddy.com){:target="_blank"}支持支付宝。

无论你选择哪家域名购买机构、购买何种域名，请都**不要使用国内的域名注册商**，也**不要注册位于国内的域名**，如.cn、.ren、.xin、.wang等。具体避雷列表请参考[这篇博客](https://blog.bgme.me/posts/precautions-for-registering-domains/){:target="_blank"}。


下面以NameCheap为例：

- 打开网址，你会看到一个大大的搜索框：
   ![NameCheap开始界面](https://s1.ax1x.com/2020/07/19/UR1KJg.png)
   
   在搜索框中输入你心中想要购买的网址。

   如果您吃不准要使用哪个后缀，可以打开[这里](https://www.namecheap.com/domains/new-tlds/explore/){:target="_blank"}，拉到下面的Complete TLDs List，选择“show more”比较所有域名后缀的价格。


- 当你输入自己心仪的域名之后，可能会出现两种结果：

   1. 域名已经被占用。那你只好更换域名或者域名后缀，或者向域名拥有者提供你愿意购买的价格（不推荐）。

   2. 域名未被占用，恭喜你，可以进行下一步购买了！


- 进入购物车：
   ![NameCheap购买界面](https://s1.ax1x.com/2020/07/19/URU2z8.png)

   - Domain Registration选择注册年限。

   - WhoisGuard在NameCheap上免费，请勾选。

   - Comfirm Order


之后会让你进入注册界面，注册之后选择付款方式（信用卡或PayPal），填写个人信息，不再赘述。（这里我同意奈奈，填写个人信息时请不要当老实人。）


- 当你成功购买域名之后，进入[Dashboard](https://ap.www.namecheap.com/dashboard){:target="_blank"}可以看到您账号下的域名。点击Manage，然后在页面上方选择“Advanced DNS”。

   ![Advanced_DNS](https://s1.ax1x.com/2020/07/19/URBNuT.png)

   在HOST RECORDS一栏你会看到一些系统自动生成的内容，全部删掉。下拉会看见MAIL SETTINGS，选择Custom MX，待稍后填写。

　　

## 2. 邮件服务

可选的邮件服务有很多家，如Sendgrid、MailGun、Sparkpost等，各有缺点，如Sendgrid热爱锁账号，Sparkpost自动屏蔽.xyz域名、Mailgun可能收费（也有小伙伴说绑卡之后每月有一千多封免费额度）等。这里给大家推荐的是**Zoho Mail**。请注意，Zoho Mail免费方案可能无法应对短时大量的邮件请求，更适合小型站点，大型站点可以考虑Mailgun等其他邮件服务。

　　

##### 2.1 注册Zoho Mail

- 打开[ZohoMail](https://www.zoho.com/mail/){:target="_blank"}

   选择**Business Email**，点击注册。
   ![Zohomail注册](https://s1.ax1x.com/2020/07/19/URrPfA.png)

   点开之后它会显示一系列付费计划，**不要管，往下拉，**看到下图的“**Forever Free Plan**”，点击注册。
   ![ForeverFreePlan](https://s1.ax1x.com/2020/07/19/URr1lq.png)


- 进入后，填写你拥有的域名，注册，填写个人信息。设置你的邮箱名（如“admin@你的域名”），注册。

  注意：这里请不要用Google直接登录，否则你还需要自己设置密码，操作上会有些麻烦。

　　

##### 2.2 验证域名

注册完毕之后，会自动跳转让你验证你的域名，也可以在 **[这里](https://mailadmin.zoho.eu/cpanel/index.do#domains){:target="_blank"}**，点击你在Zoho中添加的域旁边的验证图标 (!)，进入验证设置向导。

- 验证域名时选择 **“TXT方法”**。

   回到NameCheap的Advanced DNS Setting，在HOST RECORDS那一栏点击Add New Record，选择TXT Record，“Host”如果你没有子域名的需求就填写“@”，“Value”填写Zoho提供的Value，TTL选择最小时间，确定。

   等待DNS生效，这可能要花费一些时间，你可以先把后面的**MX记录、SPF、DKIM**一起设置完毕。

- 在设置MX记录时，在Namecheap中需要下拉到MAIL SETTINGS这一栏，选择Custom MX进行填写。（如果你在其他地方如Godaddy购买域名，那么一般直接在DNS设置里添加MX记录即可。）当你填写完一条之后，可以点击“Add New Record”继续添加。一般Zoho会要求你设置3条MX记录。TTL同样也选择最小时间。

   ![MX记录](https://s1.ax1x.com/2020/07/19/URgis1.png)

- 同上述方法依次设置SPF和DKIM，这两个都会让你在HOST RECORDS添加TXT Record，请按照要求填写。注意DKIM会让你在host填写【xxx】._domainkey，有些其他网站的设置向导会在后缀将你的域名也带上，填写的时候需要删除。

   ![DKIM设置](https://s1.ax1x.com/2020/07/19/UR2LNT.png)

最后填写的结果，你应该有**3个TXT记录和3个MX记录**。

等待一段时间后在Zoho进行验证，生效，域名邮箱设置成功！


您可以直接用您这个管理员邮箱进行邮件发送，也可以到[用户详情](https://mailadmin.zoho.eu/cpanel/index.do#userdetails){:target="_blank"}中添加另一个专门用于发送注册邮件的邮箱并设置密码。

无论你用什么邮箱，请先测试一下，保证你本人能够通过这个邮箱发送邮件。

　　

## 3. 购买服务器

如果你有精力跟着[官方文档](https://docs.joinmastodon.org/zh-cn/admin/prerequisites/){:target="_blank"}的命令一步一步亲自设置，那可选的服务器商范围很多，比如Vultr等等。也可以参考[O3O站长搭站指南](https://guide.mastodon.im/server){:target="_blank"}或[猫老师的这篇日志](https://malaxiaolongmao.github.io/%E5%B7%A5%E5%85%B7/2020/07/17/mastodon-instance-1/){:target="_blank"}。

但如果你和我一样是零基础小白，那么请直接到[DigitalOcean](https://www.digitalocean.com){:target="_blank"}注册。

这里，在我注册时碰到了一个问题，就是注册后如果我选择使用PayPal，就会立刻锁定我的账号，但朋友并没有碰到这个问题，这可能与我PayPal账号地址与IP地址不统一有关。另外，可能会要求你通过第三方网站验证护照身份证信息，据说和使用Protonmail，同IP多账号，或者使用代理有关。

注册时，如果你不想填写真实的国家，请避开[这些国家](https://www.digitalocean.com/docs/billing/taxes/){:target="_blank"}，这些国家会对你征收税费。

注册完毕后会要求你选择付款方式然后扣取一定数额美元。这只是验证你可以付款，事后会退还给你。

一切完毕之后，打开[DO控制面板](https://cloud.digitalocean.com){:target="_blank"}，右上角Create - Droplet，横栏中选择Marketplace搜索Mastodon，选择。

![Droplet购买](https://s1.ax1x.com/2020/07/19/URhrPf.png)

下拉选择Plan。这里DO会默认把页面停在第二页（40刀/月），往前拉，就可以看到便宜的计划。对于个人实例，如果你不开全文搜索功能，那每月5刀足够。如果你要开启全文搜索或者有计划拉一些朋友，那推荐你选择每月10刀。
![DO_Plan](https://s1.ax1x.com/2020/07/19/URhzi6.png)

下拉，选择服务器地址，Authentication一栏你如果没有任何知识基础就选择Password，如果你已经知道SSH是什么也可以选择SSH（更安全）。点击Create。

　　

## 4. 配置Mastodon

点开你刚刚生成的Droplet，你会在左上角看到你服务器的IP地址。
![IP地址](https://s1.ax1x.com/2020/07/19/URTB36.png)

复制，回到Namecheap的Advanced DNS Setting，在HOST RECORDS添加一个**A Record**，Host填写@（如果没有子域名需求），Value填写你服务器的IP地址，点击确定。

**请注意：此时你的DNS Setting里除了你刚才亲自设置的内容之外，别的任何由Namecheap自动生成内容请都删光。**

回到DigitalOcean，左侧选择Access，点击Launch Console。第一次登陆会让你输入用户名和密码。用户名为root，密码是你刚刚设置的那个。（如果忘了也可以在面板选择Reset Root Passward，会自动生成密码发到你邮箱。）

请注意，这里输入密码什么都不会显示，所以大胆输就行了。第一次登陆会提醒你修改密码。

改完密码之后，按照提示依次输入：

Domain Name: 输入你的域名

要不要把文件储存到云端？先填No，这个我们可以以后再设置。

然后配置邮箱。以Zoho为例：

```bash
SMTP server: smtp.zoho.eu
port: 587
user: 你第二步设置的邮箱名
password: 你第二步对该邮箱设置的密码
authentication: plain
OpenSSL verify mode: none（这两步可以按两下回车）
from: 你第二步设置的邮箱名
```

之后它会让你发一封测试邮件测试一下这个配置能否发送邮件，如果不对，可以修改邮箱配置。


*其他邮件服务的SMTP设置可以参考[这篇文章](https://docs.gitlab.com/omnibus/settings/smtp.html){:target="_blank"}。*


之后是创建管理员用户（用户名和邮箱），创建证书（输入邮箱），完成。

至此，你的Mastodon实例已经建成啦！快打开看看吧！

　　

## 5. 当你拥有了一个实例……

当你拥有了第一个实例，你接下来还能做什么？

首先，了解一些基本命令：

```bash
su - mastodon    #进入Mastodon用户
exit             #从mastodon用户退出，回到root用户
cd 文件夹         #进入文件夹。你对mastodon的设置操作一般都在mastodon用户的live文件夹中。
nano 文件名       #编辑文件。Ctrl+X可退出保存。
ls -a            #列出所在文件夹中所有的文件名（包括隐藏文件）
```

此外，如果你遇到了一些问题，有时候能通过**重启**解决：

```bash
systemctl restart mastodon-sidekiq
systemctl reload mastodon-web
systemctl restart mastodon-streaming       #偶尔需要
```


在你了解了这些基本命令之后


- 首先我推荐的第一步，就是尽快**设置SSH**，彻底摆脱难用的Digital Console。在Windows上你可以使用Xshell，Mac上可以选择Termius等等，可以自行搜索，都比在DigitalOcean上方便很多。

   **[SSH具体配置方法](https://www.digitalocean.com/docs/droplets/how-to/add-ssh-keys/){:target="_blank"}**



- 第二步，则推荐大家立刻**设置SWAP**（在root用户内操作）

   **[设置SWAP教程](https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-16-04){:target="_blank"}**

   请让你的内存+SWAP至少达到4G以上。可以在root用户下通过`free -h`查看。



- 第三步，我个人建议大家如果未来有魔改打算（如提高字数上限等），则最好先升级到官方最新版本v3.2.1（具体版本号请参见官方文档）。现行操作过魔改的小白朋友在升级到这一版本时，都多多少少出现了一些问题。可能与官方作了较大改动有关。
 
   在升级之前，请先`su - mastodon`进入mastodon用户，`cd live`进入live文件夹，用`rm lib/tasks/digitalocean.rake`删除这个文件，这是刚才帮助你初始设置的文件，但在未来可能会影响你的升级。

   如果你没有进行过任何魔改，那么请在**开启了足够SWAP的基础上**，参考官方的 **[升级教程](https://docs.joinmastodon.org/zh-cn/admin/upgrading/){:target="_blank"}**进行升级。


- 无论如何，请仔细阅读 **[官方文档](https://docs.joinmastodon.org/zh-cn/admin/install/){:target="_blank"}**，里面的一切都很有用。

　　

在进行了这几步之后，我相信你对一些操作也逐渐熟悉，可以开始进行其他改动，比如使用Git在编辑器中提交和推送自己的改动、开启全文搜索、修改字数上限、媒体上限、投票上限、添加主题、媒体文件上云、添加备用域名等等。这些，如果你有兴趣，可以参考 **[这几篇日志](https://blog.pullopen.xyz/tag/%e9%95%bf%e6%af%9b%e8%b1%a1%e5%bb%ba%e7%ab%99/){:target="_blank"}**。


现在，将你原先账号的关注对象都转移到自己站内，在自己的站点愉快享受Mastodon的冲浪生活吧！





















