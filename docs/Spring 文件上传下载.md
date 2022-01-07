# Spring 文件上传下载

**springmvc.xml配置**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    <!--context:component-scan 开启包扫描，对指定的包进行注解扫描-->
    <context:component-scan base-package="com.yingside.controller"></context:component-scan>
    <!--开启mvc注解功能-->
    <mvc:annotation-driven></mvc:annotation-driven>
    
    <bean id="viewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/jsp/"></property>
        <property name="suffix" value=".jsp"></property>
    </bean>

    <mvc:resources mapping="/js/**" location="/js/"></mvc:resources>
    <mvc:resources mapping="/css/**" location="/css/"></mvc:resources>
    <mvc:resources mapping="/images/**" location="/images/"></mvc:resources>
    <mvc:resources mapping="/files/**" location="/files/"></mvc:resources>

    <!--MultipartResolver 解析器-->
    <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <property name="maxUploadSize" value="10240000"></property>
    </bean>
    
    <bean class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
        <property name="exceptionAttribute" value="ex"></property>
        <property name="exceptionMappings">
            <props>
                <prop key="org.springframework.web.multipart.MaxUploadSizeExceededException">exception/error</prop>
            </props>
        </property>
    </bean>
</beans>
```


## 一、下载

后台的静态文件如果想被访问，需要在`springmvc.xml`中加入静态文件解析
```
<mvc:resources mapping="/js/**" location="/js/"></mvc:resources>
<mvc:resources mapping="/css/**" location="/css/"></mvc:resources>
<mvc:resources mapping="/images/**" location="/images/"></mvc:resources>
<mvc:resources mapping="/files/**" location="/files/"></mvc:resources>
```


**download.jsp**
```jsp
<html>
<head>
    <title>Title</title>
</head>
<body>
<a href="download?fileName=onepiece.jpg">下载</a>
<a href="files/onepiece.jpg">下载1</a>
</body>
</html>
```

默认 `header` 头文件的 `Content-Disposition` 是 `inline` 简单来说，就是默认浏览器能读取的就直接在浏览器读取，如果想要下载，需要修改头文件的这个信息：
```java
response.setHeader("Content-Disposition","attachment;filename=onepiece.jpg");
```

要想直接使用Spring控制上传下载，需要在配置中加入`MultipartResolver`解析器
```xml
<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
    <!--控制上传文件的大小-->
    <property name="maxUploadSize" value="10240000"></property>
</bean>
```

上传的Controller代码
```java
@RequestMapping("/download")
public void download(String fileName, HttpServletResponse response, HttpServletRequest request) throws IOException {
    System.out.println("fileName = " + fileName);
    //设置响应流中对文件进行下载的头信息
    response.setHeader("Content-Disposition","attachment;filename=onepiece.jpg");
    ServletOutputStream outputStream = response.getOutputStream();
    String filesPath = request.getServletContext().getRealPath("files");
    System.out.println("filesPath = " + filesPath);
    File file = new File(filesPath,fileName);
    byte[] bytes = FileUtils.readFileToByteArray(file);
    outputStream.write(bytes);
    outputStream.flush();
    outputStream.close();
}
```

## 二、上传
**upload.jsp**
```java
<form action="upload" enctype="multipart/form-data" method="post">
    名称:<input type="text" name="imgName"> <br>
    文件:<input type="file" name="file">
    <button type="submit">提交</button>
</form>
```

**最重要的两点：**
1、将enctype改为multipart/form-data
2、method必须为post

**Controller**

```java
@RequestMapping("/upload")
public String upload(@RequestParam("file") MultipartFile file, String imgName, HttpServletRequest request) throws IOException {
    //获取上传文件名
    String originalFilename = file.getOriginalFilename();
    //截取文件后缀
    String suffix = originalFilename.substring(originalFilename.indexOf("."));
    //获取上传文件路径
    String filesPath = request.getServletContext().getRealPath("files");
    //随机值
    String uid = UUID.randomUUID().toString();
    //新文件全路径名
    String newFilePath = filesPath + "/files/" + uid + suffix;
    //上传文件到新的路径
    FileUtils.copyInputStreamToFile(file.getInputStream(),new File(newFilePath));
    return "redirect:/index.jsp";
}
```

**异常解析**
```xml
<!--异常视图解析器,出现异常可以直接跳转到异常页面-->
<bean class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
    <property name="exceptionAttribute" value="ex"></property>
    <property name="exceptionMappings">
        <props>
            <prop key="org.springframework.web.multipart.MaxUploadSizeExceededException">exception/error</prop>
        </props>
    </property>
</bean>
```



