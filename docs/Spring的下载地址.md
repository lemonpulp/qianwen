# Spring的下载地址
对于一个新手来说，如果不依靠maven，想自己单独去下载Spring就挺头疼的，这里简单说明一下Spring的下载路径

**最简单的，直接到下面的路径去下载就行了**
[https://repo.spring.io/libs-release-local/](https://repo.spring.io/libs-release-local/)
沿着**org，springframework-spring，spring**，可以看到各版本的压缩包下载链接。

解压后有如下几个子文件
![-w277](media/16035954373445/16035958618999.jpg)

## Spring目录分析


**docs：**Spring相关文档，包括开发指南，API参考文档。
**libs：**libs文件夹里是Spring的jar包，一共63个。3个一组

![-w373](media/16035954373445/16035973143299.jpg)
**Spring框架class文件的jar包**；
Spring框架源文件的压缩包，文件名以-source结尾；
Spring框架API文档的压缩包，文件名以-javadoc结尾。

其实真正在项目中用的就21个。





**schemas：**该文件下包含了Spring各种配置文件的XML Schema文档。
**readme.txt,notice.txt,license.txt：**说明性文档

另外：

spring的核心容器必须依赖于common-logging的jar包

[http://commons.apache.org/](http://commons.apache.org/)
![-w310](media/16035954373445/16035960231943.jpg)
![-w259](media/16035954373445/16035960919947.jpg)
![-w690](media/16035954373445/16035961246647.jpg)


另外，Spring的官网下载路径相当的难于寻找...

下面把具体找个这个路径的办法说一说，大家可以当做纯新手只是看看就行了

首先官网，找到**PROJECT**
![-w1243](media/16035954373445/16035966252102.jpg)

选择 **Spring FrameWork**
![-w1010](media/16035954373445/16035966906556.jpg)

![-w1250](media/16035954373445/16035967411108.jpg)

![](media/16035954373445/16035968643272.jpg)
![](media/16035954373445/16035968717361.jpg)
![](media/16035954373445/16035968808061.jpg)
![](media/16035954373445/16035969705716.jpg)

**org -> springframework -> spring，选择要下载的版本，展开它**

![-w991](media/16035954373445/16035970793928.jpg)
