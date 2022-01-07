# 学习Spring AOP必读--静态代理、动态代理、cglib代理与Spring AOP的处理
## 代理介绍
> 代理（Proxy）是一种设计模式， 提供了对目标对象另外的访问方式；即通过代理访问目标对象。 这样好处： 可以在目标对象实现的基础上，增强额外的功能操作。(扩展目标对象的功能)。

**简单理解代理:**
代理其实和现实世界中，明星的经纪人很类似。真正接受工作，要去表演的其实还是明星，但是明星一个人不可能直接和你对接，我们一般找到的都是明星的经纪人。右经济人帮明星筛选接收工作。也就是明星真正做事之前和做事之后的工作都由经纪人帮忙完成了。
```
经纪人接收工作(洽谈工作，签合约，安排时间，前期宣传等等...)
明星演戏唱歌
经纪人收尾工作(收尾款，后续宣传等等...)
```

**经纪人就是代理，实际上台唱歌、表演的还是明星**

这样的例子，我们换成实际的代码写出来，最简单的写法就是**静态代理**

## 静态代理

**直接用例子来说明,比如已经有一个我们常写的IUserDao接口:**
```java
// 接口
public interface IUserDao {
    void save();
}
```
**实现类UserDaoImpl：**
```java
public class UserDaoImpl implements IUserDao{
    @Override
    public void save() {
        System.out.println("-----保存数据------");
    }
}
```
现在，要**在save()方法保存数据前开启事务、保存数据之后关闭事务…**当然啦，在业务少的时候，直接在save()方法中介绍事务就可以了
```java
public void save() {
    System.out.println("开启事务");
    System.out.println("-----保存数据------");
    System.out.println("关闭事务");
}
```

**但是,如果我有好多个业务方法都需要开启事务、关闭事务呢？**

```java
public void save() {
    System.out.println("开启事务");
    System.out.println("-----保存数据-----");
    System.out.println("关闭事务");
}
public void delete() {
    System.out.println("开启事务");
    System.out.println("-----删除数据-----");
    System.out.println("关闭事务");
}
public void update() {
    System.out.println("开启事务");
    System.out.println("-----更新数据-----");
    System.out.println("关闭事务");
}
public void login() {
    System.out.println("开启事务");
    System.out.println("-----登录-----");
    System.out.println("关闭事务");
}
```
这样，就有了很多很多的重复代码了…

于是呢，我们就请了一个代理，但是要注意两点：

1. 这个代理要和IUserDao有相同的方法
2. 代理只是对IUserDao进行增强，真正做事的还是UserDao
因此，代理就要实现IUserDao接口，这样的话，代理就跟IUserDao有相同的方法了。

```java
public class UserDaoProxy implements IUserDao{

    //实现IUserDao，保持和IUserDao一样的方法
    //并且将IUserDao作为自身的一个属性，这里实际需要的是IUserDao的实现类UserDaoImpl
    private IUserDao target;
    public UserDaoProxy(IUserDao target) {
        this.target = target;
    }
    @Override
    public void save() {
        System.out.println("开始事务...");
        target.save();          // 执行目标对象的方法
        System.out.println("提交事务...");
    }
}
```
**外界并不是直接去找UserDaoImpl,而是要通过代理才能找到UserDaoImpl**
```java
public static void main(String[] args) {
    // 目标对象
    IUserDao target = new UserDaoImpl();

    // 代理
    IUserDao proxy = new UserDaoProxy(target);
    proxy.save();  // 执行的是，代理的方法
}
```

这样在UserDaoImpl里面就不用在每个方法中都写入事务这些重复的代码了。

## 动态代理

**为什么还要动态代理？**
首先来看一下**静态代理的不足：**
* 如果接口改了，代理的也要跟着改...这样很不方便
* 因为代理对象，需要与目标对象实现一样的接口。所以会有很多代理类，反而显得很不方便。

**动态代理比静态代理好的地方：**

* 代理对象，不需要实现接口，这样就不会有太多的代理类了
* 代理对象的生成，是利用JDKAPI， 动态地在内存中构建代理对象

**Java提供了一个Proxy类，调用它的newInstance方法可以生成某个对象的代理对象,该方法需要三个参数：**
```java
/**
 * Returns an instance of a proxy class for the specified interfaces
 * that dispatches method invocations to the specified invocation
 * handler.
 *
 * <p>{@code Proxy.newProxyInstance} throws
 * {@code IllegalArgumentException} for the same reasons that
 * {@code Proxy.getProxyClass} does.
 *
 * @param   loader the class loader to define the proxy class
 * @param   interfaces the list of interfaces for the proxy class
 *          to implement
 * @param   h the invocation handler to dispatch method invocations to
 * @return  a proxy instance with the specified invocation handler of a
 *          proxy class that is defined by the specified class loader
 *          and that implements the specified interfaces
 * @throws  IllegalArgumentException if any of the restrictions on the
 *          parameters that may be passed to {@code getProxyClass}
 *          are violated
 * @throws  SecurityException if a security manager, <em>s</em>, is present
 *          and any of the following conditions is met:
 *          <ul>
 *          <li> the given {@code loader} is {@code null} and
 *               the caller's class loader is not {@code null} and the
 *               invocation of {@link SecurityManager#checkPermission
 *               s.checkPermission} with
 *               {@code RuntimePermission("getClassLoader")} permission
 *               denies access;</li>
 *          <li> for each proxy interface, {@code intf},
 *               the caller's class loader is not the same as or an
 *               ancestor of the class loader for {@code intf} and
 *               invocation of {@link SecurityManager#checkPackageAccess
 *               s.checkPackageAccess()} denies access to {@code intf};</li>
 *          <li> any of the given proxy interfaces is non-public and the
 *               caller class is not in the same {@linkplain Package runtime package}
 *               as the non-public interface and the invocation of
 *               {@link SecurityManager#checkPermission s.checkPermission} with
 *               {@code ReflectPermission("newProxyInPackage.{package name}")}
 *               permission denies access.</li>
 *          </ul>
 * @throws  NullPointerException if the {@code interfaces} array
 *          argument or any of its elements are {@code null}, or
 *          if the invocation handler, {@code h}, is
 *          {@code null}
 */
@CallerSensitive
public static Object newProxyInstance(ClassLoader loader,
                                      Class<?>[] interfaces,
                                      InvocationHandler h)
    throws IllegalArgumentException
```
* 参数一：生成代理对象使用哪个类装载器
* 参数二：生成哪个对象的代理对象，通过接口指定,指定要代理类的接口
* 参数三：生成的代理对象的方法里干什么事,实现handler接口

**在编写动态代理之前，要明确几个概念：**

* 代理对象拥有目标对象相同的方法，因为参数二指定了对象的接口
* 用户调用代理对象的什么方法，都是在调用处理器的invoke方法。
* 使用JDK动态代理必须要有接口

比如举例明星的例子：
**Andy Lau是一个明星，实现了人的接口：**
**AndyLau.java对象:**
```java
public class AndyLau implements Person {

    @Override
    public void sing(String name) {
        System.out.println("Andy Lau 唱" + name);
    }

    @Override
    public void dance(String name) {
        System.out.println("Andy Lau 跳" + name);
    }
}
```
**Person.java接口**
```java
public interface Person {
    void sing(String name);
    void dance(String name);
}
```
**AndyLau的代理类AndyLauProxy.java:**
```java
public class AndyLauProxy {
    //代理只是一个经纪人，实际干活的还是andyLau，于是需要在代理类上维护andyLau这个变量
    AndyLau andyLau = new AndyLau();
    //返回代理对象
    public Person getProxy() {
        /**
         * 参数一：代理类的类加载器
         * 参数二：被代理对象的接口
         * 参数三：InvocationHandler实现类
         */
        return (Person)Proxy.newProxyInstance(AndyLauProxy.class.getClassLoader(), andyLau.getClass().getInterfaces(), new InvocationHandler() {

            /**
             * proxy : 把代理对象自己传递进来
             * method：把代理对象当前调用的方法传递进来
             * args:把方法参数传递进来
             */
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

                //如果别人想要让AndyLau唱歌
                if (method.getName().equals("sing")) {

                    System.out.println("please pay money $10000000");

                    //实际上唱歌的还是AndyLau
                    method.invoke(andyLau, args);
                }
                return null;
            }
        });
    }
}
```
**测试类：**
```java
public static void main(String[] args) {
    //外界通过代理才能让Andy Lau唱歌
    AndyLauProxy andyLauProxy = new AndyLauProxy();
    Person proxy = andyLauProxy.getProxy();
    proxy.sing("爱你一万年");
}
```

## cglib代理
**由于静态代理需要实现目标对象的相同接口，那么可能会导致代理类会非常非常多....不好维护，因此出现了动态代理**

**动态代理也有个约束：目标对象一定是要有接口的，没有接口就不能实现动态代理.....因此出现了cglib代理**

**cglib代理也叫子类代理**，从内存中构建出一个子类来扩展目标对象的功能！

CGLIB是一个强大的高性能的代码生成包，它可以在运行期扩展Java类与实现Java接口。它广泛的被许多AOP的框架使用，例如**Spring AOP**，为他们提供方法的**interception（拦截）**。

### 编写cglib代理
接下来我们就讲讲怎么写cglib代理：

* 需要引入cglib.jar文件， 但是spring的核心包中已经包括了cglib功能，所以直接引入spring-core-xxxx.jar即可。
* 引入功能包后，就可以在内存中动态构建子类
* 代理的类不能为final，否则报错
* 目标对象的方法如果为final/static, 那么就不会被拦截，即不会执行目标对象额外的业务方法。

比如有下面的代码：

**UserDaoImpl.java类,注意这里并没有接口**
```java
package com.yingside.dao;

public class UserDaoImpl {
    public void add(String str){
        System.out.println("正在新增:" + str);
    }
}
```

**cglib实现代理MyInterceptor类：**
```java
import org.springframework.cglib.proxy.MethodInterceptor;
import org.springframework.cglib.proxy.MethodProxy;
import java.lang.reflect.Method;

public class MyInterceptor implements MethodInterceptor {

    private Object target;

    public MyInterceptor() {
    }

    public MyInterceptor(Object target) {
        this.target = target;
    }
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("o---" + o.getClass().getSimpleName());
//        System.out.println("target---" + target.getClass().getSimpleName());
        System.out.println("cglib开始事务");
        //可以通过构造函数传入具体需要代理的对象
//        Object obj = method.invoke(target, objects);
        //也可以通过代理方法直接找到需要代理的对象
        Object obj = methodProxy.invokeSuper(o,objects);
        System.out.println("cglib结束事务");
        
        return obj;
    }
}
```

**测试类：**
```java
package com.yingside.test;
import com.yingside.dao.UserDaoImpl;
import com.yingside.proxy.MyInterceptor;
public class Test {
    @org.junit.Test
    public void testCGLibProxy(){
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(UserDaoImpl.class);
        //可以直接调用无参构造函数,但是前提是MyInterceptor具体的intercept方法应该是调用代理的methodProxy.invokeSuper
        //enhancer.setCallback(new MyInterceptor());
        //直接传入需要代理的对象
        enhancer.setCallback(new MyInterceptor(new UserDaoImpl()));
        UserDaoImpl proxyUserDao = (UserDaoImpl) enhancer.create();
        proxyUserDao.add("李四");
    }
}
```

## Spring AOP的理解

### 重点理解：

> **Aop：** aspect object programming 面向切面编程
> **功能：** 让关注点代码与业务代码分离！
> **面向切面编程就是指：** 对很多功能都有的重复的代码抽取，再在运行的时候往业务方法上动态植入“切面类代码”。
> **关注点：**重复代码就叫做关注点。

**下面的代码是使用Hibernate保存用户的片段：**
```java
// 保存一个用户
public void add(User user) { 
    Session session = null; 
    Transaction trans = null; 
    try { 
        session = HibernateSessionFactoryUtils.getSession();   // 【关注点代码】
        trans = session.beginTransaction();    // 【关注点代码】
         
        session.save(user);     // 核心业务代码
         
        trans.commit();     //【关注点代码】

    } catch (Exception e) {     
        e.printStackTrace(); 
        if(trans != null){ 
            trans.rollback();   //【关注点代码】
        } 
    } finally{ 
        HibernateSessionFactoryUtils.closeSession(session);   //【关注点代码】

    } 
}
```

### 什么是切面？
**关注点形成的类，就叫切面(类)**

```java
public class AOP {
    public void begin() {
        System.out.println("==========开始事务==========");
    }
    public void close() {
        System.out.println("==========关闭事务==========");
    }
}
```

**切入点:**
* 执行目标对象方法，动态植入切面代码。
* 可以通过切入点表达式，指定拦截哪些类的哪些方法； 给指定的类在运行的时候植入切面类代码。
**切入点表达式：**
* 指定哪些类的哪些方法被拦截

## Spring 注解方式实现AOP编程
我们之前手动的实现AOP编程是需要自己来编写代理工厂的，现在**有了Spring，就不需要我们自己写代理工厂了。Spring内部会帮我们创建代理工厂。**

**也就是说，不用我们自己写代理对象了。**

因此，我们只要关心**切面类、切入点、编写切入表达式**指定拦截什么方法就可以了！

**pom.xml文件**
主要是需要导入的包
```java
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-core</artifactId>
  <version>3.2.18.RELEASE</version>
</dependency>

<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-aop</artifactId>
  <version>3.2.18.RELEASE</version>
</dependency>

<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-context</artifactId>
  <version>3.2.18.RELEASE</version>
</dependency>

<dependency>
  <groupId>org.aspectj</groupId>
  <artifactId>aspectjweaver</artifactId>
  <version>1.7.4</version>
</dependency>
```

**spring配置文件applicationContext.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">

    <!-- 定义包扫描器，指定到哪个包下面找到bean -->
    <context:component-scan base-package="com.yingside"/>

    <!-- 开启aop注解方式 -->
    <aop:aspectj-autoproxy></aop:aspectj-autoproxy>

</beans>
```

**IUserDao接口：**
```java
public interface IUserDao {
    public void save();
}
```

**UserDaoImpl实现类:**
```java
import org.springframework.stereotype.Component;

@Component(value = "userDao")
public class UserDaoImpl implements IUserDao{
    public void save(){
        System.out.println("正在保存");
    }
}
```

上面的UserDaoImpl.java文件里面的save()方法很明显是我们要执行的方法，现在我们需要的是在save()方法上添加代理，有了**Spring管理之后，就不需要我们再像之前人为的编写Proxy代码了。**现在直接转变思维，**需要关注的是切面类**，其实也就是像之前一样需要加到save()方法前后的一些重复代码。只不过把这些提取出来，容易形成一个类，就叫做切面类


```java
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Component
@Aspect//指定为切面类
public class AOP {
    //里面的值为切入点表达式
    @Before("execution(* com.yingside..*.*(..))")
    public void begin() {
        System.out.println("=====开始事务=====");
    }
    @After("execution(* com.yingside..*.*(..))")
    public void close() {
        System.out.println("=====关闭事务=====");
    }
}
```

**简单解释一下上面的切入点表达式：**
格式：
```java
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern)throws-pattern?) 
括号中各个pattern分别表示:
* 修饰符匹配（modifier-pattern?）
* 返回值匹配（ret-type-pattern）可以为*表示任何返回值,全路径的类名等
* 类路径匹配（declaring-type-pattern?）
* 方法名匹配（name-pattern）可以指定方法名 或者 *代表所有, set* 代表以set开头的所有方法
* 参数匹配（(param-pattern)）可以指定具体的参数类型，多个参数间用“,”隔开，各个参数也可以用“*”来表示匹配任意类型的参数，如(String)表示匹配一个String参数的方法；(*,String) 表示匹配有两个参数的方法，第一个参数可以是任意类型，而第二个参数是String类型；可以用(..)表示零个或多个任意参数
* 异常类型匹配（throws-pattern?）
* 其中后面跟着“?”的是可选项
```

如果觉得太复杂，下面的解释可能更适合你看：
```java
1）execution(* *(..))  
//表示匹配所有方法  
2）execution(public * com.yingside.service.UserService.*(..))  
//表示匹配com.yingside.server.UserService中所有的公有方法  
3）execution(* com.yingside..*.*(..))  
//表示匹配com.yingside包及其子包下的所有方法
```

**最后的测试:**
```java
@org.junit.Test
public void sprintAop(){
    ApplicationContext ac =
            new ClassPathXmlApplicationContext("applicationContext.xml");
    //这里得到的是代理对象....
    IUserDao iUser = (IUserDao) ac.getBean("userDao");

    System.out.println(iUser.getClass());

    iUser.save();
}
```









