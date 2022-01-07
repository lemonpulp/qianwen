# mybatis-plus的使用入门

## 前言
mybatis在持久层框架中还是比较火的，一般项目都是基于ssm。虽然mybatis可以直接在xml中通过SQL语句操作数据库，很是灵活。但正其操作都要通过SQL语句进行，就必须写大量的xml文件，很是麻烦。mybatis-plus就很好的解决了这个问题。

## 一、mybatis-plus简介：

Mybatis-Plus（简称MP）是一个 Mybatis 的增强工具，在 Mybatis 的基础上只做增强不做改变，为简化开发、提高效率而生。这是官方给的定义，关于mybatis-plus的更多介绍及特性，可以参考[mybatis-plus官网](https://baomidou.com/)。那么它是怎么增强的呢？其实就是它已经封装好了一些crud方法，我们不需要再写xml了，直接调用这些方法就行，就类似于JPA。

## 二、spring整合mybatis-plus

### 1、在pom中加入mp的库

```xml
<!-- mp 依赖 -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus</artifactId>
    <version>3.4.1</version>
</dependency>
```

### 2、替换SqlSessionFactoryBean

在原生的spring和mybatis整合的配置中，我们需要由spring控制SqlSessionFactory，一般都是如下配置
```xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
   ......
</bean>
```

使用`mybatis-plus` 需要将这里的替换

主要，`mybatis-plus` 3.0前后的版本，包的位置不太一致
**mp3.0以前**

```xml
<bean id="sqlSessionFactory" class="com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean">
......
</bean>
```

**mp3.0以后**
```xml
<bean id="sqlSessionFactory" class="com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean">
......
</bean>
```

### 3、实体类与表进行配置映射

```java

@Data //这里使用了lombok
@TableName(value="t_user")
public class User {
    //value与数据库主键列名一致，若实体类属性名与表主键列名一致可省略value
    @TableId(value="user_pkid",type = IdType.AUTO)
    private Integer id;
    private String username;
    private String password;
    private String nickname;
    //若没有开启驼峰命名，或者表中列名不符合驼峰规则，可通过该注解指定数据库表中的列名，exist标明数据表中有没有对应列
    @TableField(value = "reg_time",exist = true)
    private Date regTime;
}
```

### 4、Dao层
mp已经帮我们写好了一些常用的数据库crud的api，因此，我们自己要写一些简单的sql语句，直接可以继承`BaseMapper`

```java
@Repository
public interface UserMapper extends BaseMapper<User> {
}
```
这样就完成了`mybatis-plus`与`spring`的整合。把`sqlsessionfactory`换成`mybatis-plus`的，然后实体类中添加`@TableName`、`@TableId`等注解，最后mapper继承BaseMapper即可。


## 三、通用CRUD

再使用之前需要提醒一句，**mybatis-plus自带的CRUD操作，只适用于单表操作**...如果想要做多表操作，比如多表级联查询，还是只能自己去写Mapper，或者使用MP的自定义SQL操作

**需求：**
存在一张 `t_user` 表，且已有对应的实体类 `User`，实现 `t_user` 表的 CRUD 操作我们需要做什么呢？
**基于 Mybatis：**
需要编写 UserMapper 接口，并在 UserMapper.xml 映射文件中手动编写 CRUD 方法对应的sql语句。
**基于 Mybaits-plus：**
只需要创建 `UserMapper` 接口, 并继承 `BaseMapper` 接口。
我们已经有了User、t_user了，并且`UserMapper`也继承了`BaseMapper`了，接下来就直接使用CRUD方法。

### 1、insert操作
```java
final Logger logger = LoggerFactory.getLogger(getClass());
private UserMapper userMapper;
@Before
public void init(){
    ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring.xml");
    userMapper = context.getBean("userMapper", UserMapper.class);
}
@org.junit.Test
public void testInsert(){
    User u = new User();
    u.setUsername("ouyangfeng");
    u.setPassword("123456");
    u.setNickname("欧阳锋");
    u.setRegTime(new Date());
    userMapper.insert(u);
    logger.info("{}",u);
}
```
执行添加操作，直接调用insert方法传入实体即可。

### 2、update操作：

```java
@org.junit.Test
public void testUpdate(){
    User u = new User();
    u.setId(10);
    u.setUsername("huangyaoshi");
    u.setPassword("654321");
    userMapper.updateById(u);
}
```

### 3、delete操作：

```java
@org.junit.Test
public void testSelectById(){
    User u = userMapper.selectById(1);
    logger.info("{}",u);
}
```

### 4、select操作：

**根据id查询：**
```java
@org.junit.Test
public void testSelectById(){
    User u = userMapper.selectById(1);
    logger.info("{}",u);
}
```
**根据id集合查询：**
```java
@org.junit.Test
public void testSelectBatchIds(){
    List<User> users = userMapper.selectBatchIds(
            Arrays.asList(new Integer[]{1,2,3,4}));
    logger.info("{}",users);
}
```

**通过list查询全部**
```java
@org.junit.Test
public void testSelectList(){
    List<User> users = userMapper.selectList(null);
    logger.info("{}",users);
}
```

**通过map给定查询条件**
```java
@org.junit.Test
public void testSelectMap(){
    Map<String,Object> map = new HashMap<String,Object>();
    map.put("nickname","黄蓉");
    map.put("password","123456");
    List<User> users = userMapper.selectByMap(map);
    logger.info("{}",users);
}
```

**根据Wrapper查询一条数据：**
```java
@org.junit.Test
public void testSelectOne(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.eq("user_pkid","1");
    User user = userMapper.selectOne(wr);
    logger.info("{}",user);
}
```
![](media/16077642639286/16077694926039.jpg)

**根据条件查询返回多条数据**

上面的selectOne，如果返回多条数据，会报错，如果要返回多条数据，应该使用下面的API
```java
@org.junit.Test
public void testSelectWrapper1(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.likeRight("nickname","张");
    List<User> users = userMapper.selectList(wr);
    logger.info("{}",users);
}
```

当如Wrapper是很强大的...比如下面的一些用法
```java
@org.junit.Test
public void testSelectWrapper2(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.isNotNull("nickname") // 昵称不为空
            .ge("reg_time","2020-12-10"); //注册时间大于2020-12-10号
    List<User> users = userMapper.selectList(wr);
    logger.info("{}",users);
}
```

**查询时间 在xxx-xxx范围内的记录数**
```java
@org.junit.Test
public void testSelectWrapper3(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.between("reg_time","2020-10-10","2020-10-20");
    int count = userMapper.selectCount(wr);
    logger.info("{}",count);
}
```

**模糊查询**
```java
@org.junit.Test
public void testSelectWrapper4(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.like("username","u")
            .likeRight("nickname","张");
    //左和右 左：%e   右：e%  两边：%e%
    //右查询
    List<User> users = userMapper.selectList(wr);
    logger.info("{}",users);
}
```
**子查询**
```java
@org.junit.Test
public void testSelectWrapper5(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.inSql("user_pkid","select fk_user_id from t_user_role where fk_role_id=1");
    List<User> users = userMapper.selectList(wr);
    logger.info("{}",users);
}
```
![-w1101](media/16077642639286/16078277559347.jpg)

### 5、分页
MP里面分为内存分页和物理分页，内存分页没有什么适用价值，这里直接讲解物理分页

**1、引入MP的分页插件**
mybatis-plus 3.4以上版本在XML的配置中添加分页插件挺麻烦的
```xml
<bean id="sqlSessionFactory" class="com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean">
   ......
    <property name="plugins">
        <list>
            <bean class="com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor">
                <property name="interceptors">
                    <list>
                        <bean class="com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor">
                            <constructor-arg name="dbType" value="MYSQL"></constructor-arg>
                        </bean>
                    </list>
                </property>
            </bean>
        </list>
    </property>
</bean>
```

**2、使用Page**
```java
@org.junit.Test
public void testSelectPage(){
    Page<User> page = new Page<>(1,2);
    IPage<User> userPage = userMapper.selectPage(page, null);
    logger.info("总页数:" + userPage.getPages());
    logger.info("总记录数:" + userPage.getTotal());
    logger.info("数据" + userPage.getRecords());
}
```

### 6、自定义Wrapper条件查询sql

前面的条件查询都是使用MP自带的一些方法，我们也可以在自己的Mapper文件中自定义方法使用Wrapper，基本操作就两步
1、在参数中使用`@Param(Constants.WRAPPER)Wrapper<T> wrapper`
2、在需要使用条件的地方使用`${ew.customSqlSegment}`

**UserMapper**
```java
@Repository
public interface UserMapper extends BaseMapper<User> {

    @Select("select user_pkid AS id,username,password,nickname,reg_time from t_user ${ew.customSqlSegment}")
    List<User> selectByMyWrapper(@Param(Constants.WRAPPER)Wrapper<User> wrapper);
}
```
**测试**
```java
@org.junit.Test
public void testSelectWrapper6(){
    QueryWrapper<User> wr = new QueryWrapper<>();
    wr.likeRight("nickname","张");
    List<User> users = userMapper.selectByMyWrapper(wr);
    logger.info("{}",users);
}
```

这里需要注意一个问题，由于使用了自定义的SQL，因此在**原来实体类中定义的注解就不会再起作用，影响最大的应该就是字段名和对象属性名不一致的情况**，所以，如果出现不一致的情况，需要自己去定义别名，或者使用ResultMap对应，和之前自己实现mybatis 的情况一致

**7、自定义SQL条件多表级联查询**
由于MP本身CRUD只支持单表查询，所以，要想实现多表查询，只有自己去写Mapper，和传统的写法一致，没有区别

比如现在有如下Mapper文件：
**UserMapper.xml**
```java
<mapper namespace="com.yingside.dao.UserMapper">
    <resultMap id="userMap" type="User">
        <id column="user_pkid" property="id"></id>
        <result column="username" property="username"></result>
        <result column="nickname" property="nickname"></result>
        <result column="password" property="password"></result>
        <result column="reg_time" property="regTime"></result>
        <collection property="roles" ofType="Role">
            <id column="role_pkid" property="id"></id>
            <result column="role_name" property="roleName"></result>
            <result column="role_info" property="roleInfo"></result>
            <result column="role_level" property="roleLevel"></result>
        </collection>
    </resultMap>
</mapper>
```

**UserMapper.java**
```java
@Repository
public interface UserMapper extends BaseMapper<User> {
    @Select("select * from t_user_role tur inner join t_user u on u.user_pkid=tur.fk_user_id INNER join t_role r on r.role_pkid=tur.fk_role_id ${ew.customSqlSegment}")
    @ResultMap("com.yingside.dao.UserMapper.userMap")
    List<User> selectByMyLinkWrapper(@Param(Constants.WRAPPER) Wrapper<User> wrapper);
}
```

其实这里唯一的不同点就是使用参数`@Param(Constants.WRAPPER) Wrapper<User> wrapper`，也可以完全不用，就用原始的实现也可以的，这里只是举例

**测试：**
```java
@org.junit.Test
public void testSelectWrapper7(){
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.eq("role_pkid",1);
    List<User> users = userMapper.selectByMyLinkWrapper(queryWrapper);
    logger.info("{}",users);
}
```

### 8、自定义SQL条件多表级联查询并分页

和上面唯一的不同，就是方法需要一个Page类
```java
@Select("select * from t_user_role tur inner join t_user u on u.user_pkid=tur.fk_user_id INNER join t_role r on r.role_pkid=tur.fk_role_id ${ew.customSqlSegment}")
    @ResultMap("com.yingside.dao.UserMapper.userMap")
    IPage<User> selectByLinkWrapperPage(Page<User> page,@Param(Constants.WRAPPER) Wrapper<User> wrapper);
```

**测试**
```java
@org.junit.Test
public void testSelectLinkWrapperPagePage(){
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.eq("role_pkid",1);
    Page<User> page = new Page<>(1,2);
    IPage<User> userPage = userMapper.selectByLinkWrapperPage(page, queryWrapper);
    logger.info("总页数:" + userPage.getPages());
    logger.info("总记录数:" + userPage.getTotal());
    logger.info("数据" + userPage.getRecords());
}
```

