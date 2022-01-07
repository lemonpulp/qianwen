# 手把手整合SSM
## 一、创建标准的Maven工程
首先通过IDEA创建标准的Maven工程，这个步骤就不详细说明了，之前的课程已经讲的很清楚，这一步最重要的有三点
1、**Maven一定要使用国内的源**,不然会由于网络导致很多问题
2、IDEA创建好Maven之后，不是太完整，**需要我们手动的创建一些文件夹**
![-w1028](media/16073925653357/16073928505581.jpg)
3、由Maven创建的Web工程，默认的**Web.xml**文件还是**Web-app2.3**的版本，需要更改，不然会导致后面一些模板比如jstl，el表达式等等用不起，**改为3.0以上的版本**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="3.0"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
         http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd">
</web-app>
```

## 二、导入Spring核心jar包
![-w713](media/15716226917794/15716378459011.jpg)

现在由于我们使用的Maven工程直接引入`dependency`就ok了，最简单的方式就是直接引入**spring-context包，其他的核心包都会依赖引入**，

所以，最重要的是这几个核心jar包，当然只是这几个jar包还不够，如果要记录日志，还需要日志包，但是spring框架本身从图上可以看到，并没有听日志框架，所以，这是我们唯一需要外部去引用的jar包

[Spring官方关于日志问题的解释](https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/overview.html#overview-logging)

上面的官方文档详细的解释了Spring为什么是用commons-logging,以及怎么关闭commons-logging而是用slf4j（注意：commons-logging与slf4j都是日志的门面模式，两者选择其中的一种就可以了），以及使用log4j的日志框架，由于我们后面还要学习SpringBoot,这**里我们就直接使用slf4j与logback日志框架**，下面是这些jar包在maven中的导入
```xml
<properties>
    <!--设置Spring统一版本号-->
    <spring.version>5.2.9.RELEASE</spring.version>
</properties>

<dependencies>
    <!--Spring核心包-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
        <exclusions>
            <exclusion>
                <groupId>commons-logging</groupId>
                <artifactId>commons-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!--slf4j日志门面-->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-simple</artifactId>
        <version>1.7.25</version>
        <scope>compile</scope>
    </dependency>

    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>jcl-over-slf4j</artifactId>
        <version>1.7.25</version>
    </dependency>
    <!--logback日志框架-->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.2.3</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.2.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-beans</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-expression</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aop</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

既然引入了logback日志框架，当然需要将日志的相关配置引入，日志框架的相关配置这里就不在做介绍，大家只需要将`logback-test.xml`文件导入到工程的`resources`目录下就行了，下面的是日志配置文件的主要内容
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <!--设置logback输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <!-- 在程序的开发测试阶段，可以调整level的级别，常用级别优先级为： -->
    <!-- TRACE < DEBUG < INFO < WARN < ERROR  -->
    <!--
    下面的设置可以让mybatis打印sql语句，已经sql执行过程
    与mybatis一起开发时建议使用
    注意，这里设置之后，在mybatis的全局设置文件中，还需要添加一句
    <settings>
        ......
        <setting name="logImpl" value="STDOUT_LOGGING"/>
        ......
    </settings>
    -->
    <logger name="com.ibatis" level="DEBUG" />
    <logger name="com.ibatis.common.jdbc.SimpleDataSource" level="DEBUG" />
    <logger name="com.ibatis.common.jdbc.ScriptRunner" level="DEBUG" />
    <logger name="com.ibatis.sqlmap.engine.impl.SqlMapClientDelegate" level="DEBUG" />
    <logger name="java.sql.Connection" level="DEBUG" />
    <logger name="java.sql.Statement" level="DEBUG" />
    <logger name="java.sql.PreparedStatement" level="DEBUG" />
    <logger name="java.sql.ResultSet" level="DEBUG" />
    <!--这里最关键，设置你的dao层所在包即可-->
    <logger name="com.yingside.dao" level="DEBUG" />
    <!--设置文件保存日志-->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            <charset>utf-8</charset>
        </encoder>
        <!--文件路径，这里设置的是工程根目录下的log目录下-->
        <file>log/output.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
            <fileNamePattern>log/output.log.%i</fileNamePattern>
        </rollingPolicy>
        <triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
            <MaxFileSize>1MB</MaxFileSize>
        </triggeringPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

## 三、与SpringMVC整合
首先，还是需要导入相关jar包,由于我们肯定会往前台传送json数据，所以，顺便导入jackson相关的jar包，下面的maven中引入的包主要包括三部门

1、spring-web,spring-mvc相关jar包
2、jackson相关jar包
3、jstl相关jar包

```xml
<properties>
    <!--设置Spring统一版本号-->
    <spring.version>5.2.9.RELEASE</spring.version>
    <!--设置jackson版本号-->
    <jackson.version>2.11.3</jackson.version>
</properties>

<!--SpringMVC相关jar包-->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-web</artifactId>
    <version>${spring.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>${spring.version}</version>
</dependency>
<!--jackson相关jar包-->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>${jackson.version}</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
    <version>${jackson.version}</version>
</dependency>
<!--JSTL相关jar包-->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
    <version>1.2</version>
</dependency>
```
### 3.1、创建三层架构和MVC的相关包和测试文件
无论怎么样，要工程化的开始一个工程，三层架构和MVC的相关包必不可少
![-w388](media/16073925653357/16073965018900.jpg)


### 3.2、Spring核心配置applicationContext.xml
我们可以再maven工程的`resources`目录下，新建`applicationContext.xml`，配置Spring的核心内容，当然`applicationContext.xml`这个文件的名字可以自己随便取，但是在大多数公司，默认就叫这个名字
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <!--配置注解扫描包-->
    <context:component-scan base-package="com.yingside.po,com.yingside.dao,com.yingside.service">
    </context:component-scan>
</beans>
```

### 3.3、配置springmvc.xml文件
`applicationContext.xml`现在其实只是配置了注解注入，工程最后要通过tomcat应用服务器进行启动，我们的SpringMVC框架，还需要和Tomcat关联，所以还需要装备配置和tomcat相关的内容。
当然这些内容也可以直接放在`applicationContext.xml`文件中，不过单独把web相关内容提取出来做配置是一个好的习惯
同样，将springmvc.xml文件放入到resources目录下
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    <!--开启注解在controller包下的扫描-->
    <context:component-scan base-package="com.yingside.controller"></context:component-scan>
    <!--开启SpringMVC的相关注解-->
    <mvc:annotation-driven></mvc:annotation-driven>
    <!--开启视图配置解析，这个不是必须的，这里配置的作用仅仅是给视图页面加上前缀和后缀
    比如返回 main 其实相当于返回到页面 /WEB-INF/jsp/main.jsp
    -->
    <bean id="viewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/jsp/"></property>
        <property name="suffix" value=".jsp"></property>
    </bean>
</beans>
```


### 3.4、配置Web.xml
首先我们需要配置Web.xml文件，这里的目的主要是三点：
1、**通过ServletContext加载applicationContext.xml核心配置文件**
2、**配置DispatcherServlet文件，进行url过滤**
3、**通过DispatcherServlet加载springmvc.xml配置文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="3.0"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
         http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd">
  <!--监听Context上下文容器，并读取Spring全局配置文件-->
  <listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
  <context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:applicationContext.xml</param-value>
  </context-param>

  <!--配置dispatcherServlet，并读取springmvc配置文件-->
  <servlet>
    <servlet-name>dispatcherServlet</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <param-value>classpath:springmvc.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>

  <!--配置编码-->
  <filter>
    <filter-name>characterEncoding</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param>
      <param-name>encoding</param-name>
      <param-value>UTF-8</param-value>
    </init-param>
  </filter>
  <filter-mapping>
    <filter-name>characterEncoding</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
</web-app>
```

## 四、测试SpringMVC
建立相关文件，大概结构如下：
![-w416](media/16073925653357/16074105200984.jpg)

**User.java**
```java
@Component
public class User implements Serializable {
    private Integer id;
    private String username;
    private String password;
    private String nickname;
    private Date regTime;
    //......
    //省略相关getter,setter,toString,构造器等方法
```

**UserDao.java**
```java
public interface UserDao {
    List<User> getAll();
    User getUserById(Integer id);
    int insertUser(User user);
}
```

**UserDaoImpl.java**
```java
@Repository("userDao")
public class UserDaoImpl implements UserDao {
    @Override
    public List<User> getAll() {
        System.out.println("Dao层===>获取所有用户数据");
        List<User> users = new ArrayList<>();

        User user1 = new User(1,"zs","123456","张三",new Date());
        User user2 = new User(2,"ls","123456","李四",new Date());
        User user3 = new User(3,"ww","123456","王五",new Date());
        users.add(user1);users.add(user2);users.add(user3);
        return users;
    }

    @Override
    public User getUserById(Integer id) {
        System.out.println("Dao层===>根据主键ID获取用户数据");
        //这里没有连接数据库，直接模拟了假数据直接传递
        return new User(id,"zs","123456","张三",new Date());
    }
    
    @Override
    public int insertUser(User user) {
        System.out.println("Dao层===>新增用户");
        return 0;
    }
}
```

**UserService.java**
```java
public interface UserService {
    List<User> getAll();
    User getUserById(Integer id);
    boolean insertUser(User user);
}
```

**UserServiceImpl.java**
```java
@Service("userService")
public class UserServiceImpl implements UserService {
    @Autowired
    private UserDao userDao;
    @Override
    public List<User> getAll() {
        System.out.println("Service层===>获取所有用户数据");
        return userDao.getAll();
    }

    @Override
    public User getUserById(Integer id) {
        System.out.println("Service层===>根据主键ID获取用户数据");
        return userDao.getUserById(id);
    }

    @Override
    public boolean insertUser(User user) {
        System.out.println("Dao层===>新增用户");
        return userDao.insertUser(user) > 0 ? true : false;
    }
}
```

**UserController.java**
```java
@Controller
public class UserController {
    @Autowired
    private UserService userService;

    @RequestMapping("/list")
    public String getAll(Model model){
        System.out.println("模拟获取全部用户数据");
        model.addAttribute("users",userService.getAll());
        return "list";
    }

    @RequestMapping("/getUser/{id}")
    @ResponseBody //直接返回json数据
    public User getUserById(@PathVariable("id") Integer id){
        User user = userService.getUserById(1);
        return user;
    }
}
```

**list.jsp**
```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head>
    <title>用户数据</title>
</head>
<body>
<c:forEach var="user" items="${users}">
    ${user.username}--${user.nickname} <br/>
</c:forEach>
</body>
</html>
```

## 五、数据、事务整合
### 5.1、导入相关jar包
要整合数据和事务相关内容，那又需要加入一堆jar包，要导入的包主要包含下面几块

1、spring-jdbc数据库读取和spring-tx事务相关jar包
2、mysql的jar包
3、数据库连接池jar包
4、sprint-aop与AspectJ相关jar包

`spring-jdbc`需要依赖`spring-tx`,所以，在maven引入的时候，只需要引入`spring-jdbc`就好，下面写出来是为了大家能看清楚有哪些jar包

`spring-aop`的jar包在之前导入核心jar包spring-context的时候已经依赖导入了，因此只需要再导入AspectJ相关jar包就行了

`spring-aspects`仅仅只有这一个jar包其实还不行，不过maven也会依赖帮我们导入`aspectjweaver` 这个jar包



连接池相关常用的jar包现在无非也就三种，**dbcp2，c3p0以及druid**，前面我们使用的是dbcp2，这里我们就配置使用一下**druid**

因此，在pom文件中加入下面的引用
```xml
<!--spring-jdbc jar包,会自定依赖引入spring-tx-->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>${spring.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-tx</artifactId>
    <version>${spring.version}</version>
</dependency>
<!--mysql数据库-->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>${mysql.version}</version>
</dependency>
<!--druid连接池-->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>${druid.version}</version>
</dependency>
<!--spring AOP需要的Aspects的jar包，会自动导入aspectjweaver-->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
    <version>${spring.version}</version>
</dependency>
```

### 5.2、加入jdbc.properties文件
这个文件主要是为了在spring中好读取数据库的相关信息，在resources目录下放入jdbc.properties文件

```properties
driverClassName=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://127.0.0.1:3306/RBAC?useUnicode=true&characterEncoding=UTF8&useSSL=false&serverTimezone=Asia/Shanghai
username=root
password=123456
```

### 5.3、配置数据源
在原有的`applicationContext.xml`上，加入数据源连接池的相关配置
```xml
<!--读取配置文件-->
<context:property-placeholder location="classpath:jdbc.properties"/>

<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
    <!-- 数据库连接相关配置，可以读取properties文件       -->
    <property name="driverClassName" value="${driverClassName}"></property>
    <property name="url" value="${url}"></property>
    <property name="username" value="${username}"></property>
    <property name="password" value="${password}"></property>

    <!-- 配置监控统计拦截的filters -->
    <property name="filters" value="stat"/>

    <!-- 配置初始化大小、最小、最大 -->
    <property name="maxActive" value="20"/>
    <property name="initialSize" value="1"/>
    <property name="minIdle" value="1"/>

    <!-- 配置获取连接等待超时的时间 -->
    <property name="maxWait" value="60000"/>

    <!-- 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒 -->
    <property name="timeBetweenEvictionRunsMillis" value="60000"/>

    <!-- 配置一个连接在池中最小生存的时间，单位是毫秒 -->
    <property name="minEvictableIdleTimeMillis" value="300000"/>
    <property name="testWhileIdle" value="true"/>
    <property name="testOnBorrow" value="false"/>
    <property name="testOnReturn" value="false"/>

    <!-- 打开PSCache，并且指定每个连接上PSCache的大小 -->
    <property name="poolPreparedStatements" value="true"/>
    <property name="maxOpenPreparedStatements" value="20"/>
</bean>
```

### 5.4、配置druid监听
druid数据源，还搭配了
```xml
<filter>
    <filter-name>DruidWebStatFilter</filter-name>
    <filter-class>com.alibaba.druid.support.http.WebStatFilter</filter-class>
    <init-param>
        <param-name>exclusions</param-name>
        <param-value>*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>DruidWebStatFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
<servlet>
    <servlet-name>DruidStatView</servlet-name>
    <servlet-class>com.alibaba.druid.support.http.StatViewServlet</servlet-class>
    <init-param>
        <!-- 用户名 -->
        <param-name>loginUsername</param-name>
        <param-value>druid</param-value>
    </init-param>
    <init-param>
        <!-- 密码 -->
        <param-name>loginPassword</param-name>
        <param-value>druid</param-value>
    </init-param>
</servlet>
<servlet-mapping>
    <servlet-name>DruidStatView</servlet-name>
    <url-pattern>/druid/*</url-pattern>
</servlet-mapping>
```

### 5.5、整合事务

整合事务主要需要在配置文件中加入下列的配置，其实是要处理三个要点：
1、创建`DataSourceTransactionManager`对象
2、配置事务通知策略advice
3、配置切面以及切面和通知的连接点

这里直接在`resources`目录下创建新的事务配置文件`spring-tx.xml`,当然，事务的配置完全也可以全部现在全局配置文件`applicationContext.xml`中，拆分文件只是让配置更加清晰

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tx="http://www.springframework.org/schema/tx"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd">
    <!--引入全局配置-->
    <import resource="applicationContext.xml"></import>
    <!--创建事务管理器-->
    <bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"></property>
    </bean>
    <!--事务通知配置策略-->
    <tx:advice transaction-manager="txManager" id="txAdvice">
        <tx:attributes>
            <!--增删改开头开启事务，查询相关只读-->
            <tx:method name="insert*" propagation="REQUIRED"></tx:method>
            <tx:method name="update*" propagation="REQUIRED"></tx:method>
            <tx:method name="delete*" propagation="REQUIRED"></tx:method>
            <tx:method name="query*" read-only="true" />
            <tx:method name="get*" read-only="true" />
            <tx:method name="find*" read-only="true" />
            <tx:method name="select*" read-only="true" />
        </tx:attributes>
    </tx:advice>
    <!--AOP配置-->
    <aop:config>
        <!--AOP切面-->
        <aop:pointcut id="myPointCut" expression="execution(* com.yingside.service.impl..*(..))"/>
        <!--advisor 负责联系切面与通知-->
        <aop:advisor advice-ref="txAdvice" pointcut-ref="myPointCut"/>
    </aop:config>
</beans>
```

## 六、整合Mybatis
### 6.1、要整合mybatis，首先第一步，还是要导包,这里的包主要包含三部分

1、mybatis自身jar包
2、mybatis与spring关联的jar包


```xml
<properties>
...
<!--设置mybatis版本号-->
<mybatis.version>3.5.6</mybatis.version>
<!--设置mybatis-spring版本号-->
<mybatis.spring.version>2.0.5</mybatis.spring.version>
...
</properties>

<dependencies>
    ......
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>${mybatis.version}</version>
    </dependency>
    
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis-spring</artifactId>
        <version>${mybatis.spring.version}</version>
    </dependency>
    ......
</dependencies>
```

### 6.2、mybatis相关配置
可以将mybatis的全局配置直接引入，然后再配置spring和mybatis的整合
首先在`resources`目录下，放入新的`mybatis-configuration.xml`文件，这个文件其实就是之前我们单独使用mybatis的全局配置文件，但是里面关于数据源已经mapper地址的设置现在可以全部交给Spring来控制了，只留下了mybatis自己独有的配置

**mybatis-configuration.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <setting name="lazyLoadingEnabled" value="true"/>
        <setting name="aggressiveLazyLoading" value="false"/>
        <setting name="logImpl" value="STDOUT_LOGGING"/>
    </settings>
    <typeAliases>
        <package name="com.yingside.po"></package>
    </typeAliases>
</configuration>
```

在`resources`目录下，放入新的`spring-mybatis.xml`文件

**spring-mybatis.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tx="http://www.springframework.org/schema/tx"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd">

    <!--引入全局配置-->
    <import resource="applicationContext.xml"></import>

    <!--创建SessionFactory-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!--引入dataSource-->
        <property name="dataSource" ref="dataSource"></property>
        <!--引入mybatis的主配置文件,一些mybatis的其他设置还是可以放在mybatis自己的设置文件中-->
        <property name="configLocation" value="classpath:mybatis-configuration.xml"></property>
        <!--配置映射，纯注解不用配置-->
        <property name="mapperLocations">
            <array>
                <value>classpath:com/yingside/mapper/*Mapper.xml</value>
            </array>
        </property>
    </bean>
    <!--开启mapper包扫描，这就要求必须要有一个接口-->
    <bean id="mappers" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!--扫描com.yingside.dao-->
        <property name="basePackage" value="com.yingside.dao"></property>
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property>
    </bean>
</beans>
```

### 6.3、创建*Mapper.xml文件
接下来只需要在mapper包中创建相关的mapper文件，与原来dao层接口进行动态映射即可，将原结构做一下修改
![-w346](media/16073925653357/16075188757153.jpg)
`UserDao`接口中的方法与`UserMapper`文件内容进行映射

**UserMapper.xml**
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.yingside.dao.UserDao">
    <resultMap id="userMap" type="User">
        <id column="user_pkid" property="id"></id>
        <result column="username" property="username"></result>
        <result column="nickname" property="nickname"></result>
        <result column="password" property="password"></result>
        <result column="reg_time" property="regTime"></result>
    </resultMap>
    <select id="getAll" resultMap="userMap">
        select * from t_user
    </select>
    <select id="getUserById" resultMap="userMap" parameterType="Integer">
        select * from t_user where user_pkid=#{0}
    </select>
    <insert id="insertUser" parameterType="User" >
        insert into t_user(user_pkid,username,nickname,password,reg_time) values(#{id},#{username},#{nickname},#{password},#{regTime});
    </insert>
</mapper>
```

### 6.4、修改Web.xml加入xml配置文件
由于之前只是加入了全局**applicationContext.xml**配置文件，现在有加入`spring-tx.xml`与`spring-mybatis.xml`,因此，在启动的时候还需要加载这两个配置文件

**web.xml**
```xml
...
<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>
      classpath:applicationContext.xml,
      classpath:spring-tx.xml,
      classpath:spring-mybatis.xml
    </param-value>
</context-param>
...
```

### 七、完整的三层结构

![-w420](media/16073925653357/16075202039231.jpg)

这三层，直接使用Spring的注入，分分钟解决问题

**UserDao**
```java
@Repository("userMapper")
public interface UserDao {
    List<User> getAll();
    User getUserById(Integer id);
    int insertUser(User user);
}
```
**注意： UserDao接口和UserMapper是由mybatis控制，动态生成了Impl代码，所以，无需再写实现类了**

**UserService**
```java
public interface UserService {
    List<User> getAll();
    User getUserById(Integer id);
    boolean insertUser(User user);
}
```

**UserServiceImpl**
```java
@Service("userService")
public class UserServiceImpl implements UserService {
    @Autowired
    private UserDao userDao;
    @Override
    public List<User> getAll() {
        System.out.println("Service层===>获取所有用户数据");
        return userDao.getAll();
    }

    @Override
    public User getUserById(Integer id) {
        System.out.println("Service层===>根据主键ID获取用户数据");
        return userDao.getUserById(id);
    }

    @Override
    public boolean insertUser(User user) {
        System.out.println("Dao层===>新增用户");
        return userDao.insertUser(user) > 0 ? true : false;
    }
}
```

**UserController**
```java
@Controller
public class UserController {
    @Autowired
    private UserService userService;

    @RequestMapping("/list")
    public String getAll(Model model){
        System.out.println("模拟获取全部用户数据");
        model.addAttribute("users",userService.getAll());
        return "list";
    }

    @RequestMapping("/getUser/{id}")
    @ResponseBody //直接返回json数据
    public User getUserById(@PathVariable("id") Integer id){
        User user = userService.getUserById(1);
        return user;
    }
}
```
