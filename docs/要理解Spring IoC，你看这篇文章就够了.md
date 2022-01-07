# 要理解Spring IoC，你看这篇文章就够了
关于Spring的一些介绍就不用多说了...反正现在java框架这一块,基本上已经进入Spring全家桶模式,所以Spring的重要性无需多言.

## 一、IoC的基本理解

要使用Spring,那肯定避不开两个话题,Spring IoC与Spring AOP,这两块内容,算是Spring安身立命的根本了.而Spring Ioc算是基础中的基础,根本中的根本,不把这个搞清楚,Spring的一切都是空谈

> IoC : Inversion of Control,控制反转
> 还有一个更加容易理解的称呼: 
> DI : Dependency Injection,依赖注入


其实两个单词说的是一个意思,一样的操作,只是出发点不一样而已
**IoC是着眼于全局的一种说法,DI是着眼于某个具体类上的说法而已**

使用Spring来配置IoC其实很简单，但是关键点是，你要理解什么是IoC为什么需要用他，而且，为什么他要叫做控制反转？反转了什么？

首先要搞清楚一件事情:

**IoC 不是一种技术，只是一种思想，一个重要的面向对象编程的法则**，它能指导我们如何设计出松耦合、更优良的程序。传统应用程序都是由我们在类内部主动创建依赖对象，从而导致类与类之间高耦合，难于测试，我们一般的项目都肯定会用到三层架构，那基本上也就意味着,每个类都不是独立存在的，类和类之间都有这互相依赖，而这种依赖关系越多，在我们调用类的时候，复杂度也会相应的提高。

## 二、手动实现注入

来看下面的这个例子，传统程序的做法：

比如我们有一个男孩类，一个宠物类，男孩要和宠物玩耍，所以，在男孩类中依赖了宠物类，当做我们需要在界面上显示这个过程，肯定就需要创建这两个类的对象，然后将宠物对象赋值给男孩对象中的属性或者方法，这就是一个简单的注入过程

![-w403](media/15481234313549/15482985361031.jpg)



这个过程，用传统代码的实现，我经常会用到的做法其实就下面这两个
1. 类和类之间直接的依赖关系（Dependency），这种关系的做法就是一个类中的方法需要另外一个类做为参数。
2. 类和类之间的关联关系（Association），一个类是另外一个类的属性

对于设计来说，关联关系是更好处理的方式，而对于关联关系，代码里面的处理给属性赋值，最常用的也是两种方式，构造器传值与setter，getter传值，来看一下代码实现

首先是 宠物接口和他的两个实现类
**Pet.java:**
```java
public interface Pet {
    public void enjoy();
}
```
**Dog.java:**
```java
public class Dog implements Pet {
    public void enjoy() {
        System.out.println("小狗很高兴");
    }
}
```
**Cat.java:**
```java
public class Cat implements Pet{
    public void enjoy() {
        System.out.println("小猫很高兴");
    }
}
```

Boy与Pet有关联关系，Pet是Boy类中的一个属性，可以有两种方式去实现 Pet 的注入

**Boy.java: 构造去注入Pet对象**
```java
public class Boy {
    private Pet pet;
    public Boy() {
    }
    public Boy(Pet pet) {
        this.pet = pet;
    }
    public void play(){
        pet.enjoy();
    }
}
```

**Boy.java: setter，getter注入Pet对象**
```java
public class Boy {
    private Pet pet;

    public Pet getPet() {
        return pet;
    }
    public void setPet(Pet pet) {
        this.pet = pet;
    }
    public Boy() {
    }
    public void play(){
        pet.enjoy();
    }
}
```

在测试类中进行测试。
**Test.java:**
```java
public class Test {
    public static void main(String[] args) {
        Pet dog = new Dog();
        //Boy boy = new Boy();
        //通过setter注入
        //boy.setPet(dog);
        
        //通过构造器注入
        Boy boy = new Boy(dog);
        boy.play();
    }
}
```

![2019-01-24_10-03-48](media/15481234313549/2019-01-24_10-03-48.png)

## 三、Spring IoC的具体实现
当有了IoC容器之后，上面的实现过程，就变成了这个样子：
![-w445](media/15481234313549/15482993344673.jpg)

简单来说就是由容器来控制所有对象的生死

可能由于我们在学习中主要写的都是一些测试性的代码，所以，不能直观的感受到这样做的好处。举一个形象点的例子：

> 在实际的玩具工厂中生成钢铁侠的玩具，钢铁侠的头，手，身体，腿肯定是由不同的模具生产出来的，然后下一道工序需要组装，传统的做法就是自己去找到这些配件，手动进行装备。而IoC容器的做法就相当于又是一个专门的自动组装车间。在容器中直接帮我们装配好钢铁侠的所有配件。

所以，还是那句话：**IoC 不是一种技术，只是一种思想，一个重要的面向对象编程的法则**

### 1、导入Spring的jar包

首先需要说到的是Spring的版本，目前为止，Spring最新的是5.0以上的版本，不过**5.xx的版本要求java最新的版本是JDK8以上**，由于基准是JDK8，使用了很多JDK8的新特性，比如lamda表达式，接口的新特性等等，简单来说，使用起来更方便，但是就是不再向下兼容。
这里说明，还是用的Spring4.3.22的版本，其实基本上没有什么大的差别，Spring5.xx一些增强的内容，在初学者期间你也用不到

还是使用基于Maven的工程，没用过Maven没关系，你就把Maven当做一个工程规范，以及一个导包工具就可以了，不熟悉的可以点[这里](http://www.yanhongzhi.com/post/IDEA.html)

[spring最核心的包](https://docs.spring.io/spring/docs/4.3.22.RELEASE/spring-framework-reference/htmlsingle/#overview-core-container)，导入之后，我们就可以进行最基本的配置

#### 1.1、在pom文件中引入相关jar包

在pom.xml文件中引入下面的内容：
```xml
<dependencies>
    <!-- 引入spring核心包spring-core -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>4.3.22.RELEASE</version>
    </dependency>
    <!-- 引入spring-context包，并且会关联引入
    spring-beans,spring-aop,spring-expression等关键包
     -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>4.3.22.RELEASE</version>
    </dependency>
</dependencies>
```

#### 1.2、IDEA创建XML文件没有Spring Config选项的问题

注意：上面的`spring-context`的配置，在IDEA上还有一个重要的功能，那就是在创建spring的相关xml文件的时候，会出现spring的相关配置

**没有配置`spring-context`的时候，创建xml：**
![2019-01-24_15-40-29](media/15481234313549/2019-01-24_15-40-29.png)

**配置了`spring-context`之后，创建xml：**
![2019-01-24_15-42-06](media/15481234313549/2019-01-24_15-42-06.png)


### 2、配置bean
spring的配置，主要是配置注入，在做法上，最重要的理解是：spring的做法就是**把每一个需要用到的类看做bean**

在`resources`目录下创建基于`Spring Config`的`application.xml`文件，默认文件是下面这个样子的

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="pet" class="com.yingside.demo.Dog"/>

    <bean id="boy" class="com.yingside.demo.Boy">
        <property name="pet" ref="pet"/>
    </bean>

</beans>
```


注意下图中配置中的bean与类对应的情况，**这里在配置中使用的是Setter情况的注入**
![2019-01-24_16-02-46](media/15481234313549/2019-01-24_16-02-46.png)

然后，我们只需要在自己的测试中，从容器中取出要使用的对象，直接使用就可以了

```xml
//得到容器对象
ApplicationContext ac = new ClassPathXmlApplicationContext("application.xml");
//从容器中获取bean对象
Boy boy = ac.getBean(Boy.class, "boy");

boy.play();
```

![2019-01-24_17-00-13](media/15481234313549/2019-01-24_17-00-13.png)


当然，在Spring中配置bean的注入也有很多种方式，比如这里的setter方式的注入，还有构造器的注入，静态工厂的方法注入，实例工厂的方法注入等4种方式...不过回字也有多种写法...没必要都知道这些注入到底该怎么做，实际要用的最多也就setter与构造器的注入方式。而且实际工作中，我们也不可能直接只使用xml的配置方式，而是使用**注解+xml结合配置**一起使用

### 3、注解+xml结合配置

使用注解配置，整个工程全部使用注解配置可以很简洁，但是又会导致整个配置线不是太统一，所以注解+xml结合的配置更适合一般公司的工程开发

其实也就两步：

#### 1、xml标注哪些文件需要映射
![2019-01-25_10-14-29](media/15481234313549/2019-01-25_10-14-29.png)

#### 2、在需要被Spring IoC容器管理的类上加上相关的注解
介绍注解并不是这篇文章的重点，初学者也没有必要每个注解都去详细了解再下手，这里简单介绍以下最重要的几个常用注解就行了

##### 2.1、定义Bean
定义Bean使用注解`@Component`，该注解的value属性用于指定该bean的id值

![2019-01-25_11-01-41](media/15481234313549/2019-01-25_11-01-41.png)


另外，Spring还提供了3个功能基本和@Component等效的注解：

* `@Repository` 用于对DAO实现类进行注解
* `@Service` 用于对Service实现类进行注解
* `@Controller` 用于对Controller实现类进行注解

很明显这三个注解是为三层架构所准备的，现在我们这里的例子没用三层，所以`@Component`就可以了

##### 2.2、按类型注入域属性`@Autowired`
需要在域属性上使用注解@Autowired，该注解默认使用按类型自动装配Bean的方式。
使用该注解完成属性注入时，类中无需setter。当然，若属性有setter，则也可将其加到setter上。

![2019-01-25_11-04-19](media/15481234313549/2019-01-25_11-04-19.png)

上面这两个注解就已经能够完成我们的例子了，使用Test测试就能得到结果，当然，Test里面的语句还是没有变化的

```java
//得到容器对象
ApplicationContext ac = new ClassPathXmlApplicationContext("application.xml");
//从容器中获取bean对象
Boy boy = ac.getBean(Boy.class, "boy");

boy.play();
```

除此之外，还有几个比较重要的注解，这里稍微介绍一下

##### 2.3、Bean的作用域@Scope
这个默认不需要定义，它的作用是指定作用域。默认为singleton。
这个注解看情况使用，一般默认为单例就可以了singleton，不过它有5个值可以选：

**（1）singleton**

表明容器中创建时只存在一个实例，所有引用此bean都是同一个实例。
singleton类型的bean定义从容器启动到第一次被请求而实例化开始，只要容器不销毁或退出，该类型的bean的单一实例就会一直存活，典型单例模式，如同servlet在web容器中的生命周期。

**（2）prototype**

spring容器在进行输出prototype的bean对象时，会每次都重新生成一个新的对象给请求方，虽然这种类型的对象的实例化以及属性设置等工作都是由容器负责的，但是只要准备完毕，并且对象实例返回给请求方之后，容器就不在拥有当前对象的引用，请求方需要自己负责当前对象后继生命周期的管理工作，包括该对象的销毁。也就是说，容器每次返回请求方该对象的一个新的实例之后，就由这个对象“自生自灭”，最典型的体现就是spring与struts2进行整合时，要把action的scope改为prototype。

如同分苹果，将苹果的bean的scope属性声明为prototype，在每个人领取苹果的时候，我们都是发一个新的苹果给他，发完之后，别人爱怎么吃就怎么吃，爱什么时候吃什么时候吃，但是注意吃完要把苹果核扔到垃圾箱！对于那些不能共享使用的对象类型，应该将其定义的scope设为prototype。

**（3）request
（4）session
（5）global session**
request，session和global session类型只实用于web程序，这里就不再详细说明每个值的意义，有需要的自行查询

##### 2.4、按名称注入域属性`@Autowired`与`@Qualifier`
这个意思其实很简单，我们这里Pet接口如果只有一个实现类Dog，那么`@Autowired`会自动找到IoC容器中的Dog对象，但是如果Pet接口有多个实现类，并且都在IoC容器中进行了管理了呢？那`@Autowired`怎么知道要找的是哪一个？

所以 `@Qualifier` 就是用来指定，装配的到底是哪一个Bean
![2019-01-25_11-31-40](media/15481234313549/2019-01-25_11-31-40.png)

##### 2.5、基本类型属性注入`@Value`
需要在属性上使用注解@Value，该注解的value属性用于指定要注入的值。
使用该注解完成属性注入时，类中无需setter。当然，若属性有setter，则也可将其加到setter上。
![2019-01-25_11-39-22](media/15481234313549/2019-01-25_11-39-22.png)






