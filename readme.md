### 原生js日历插件
1. 使用方法
+ 引入calendar.js文件
+ 使用es6 引入calendar-module.js 通过`import Calendar from xxx`
然后`new Calender(el,options)`
2. 说明
+ el为输入日期的dom元素,可以为dom对象也可为字符串,如果是字符串会尝试使用`querySelector`进行解析

+ options为选项 

+ ```javascript
  暂时只支持
  options： {
  	separator： '/', 分隔符
  }
  ```

3. bug

+ 快速点击(动画未完成时)非当前月日期,会发生日历消失无法点击的现象

4. TODO

+ 实现点击年/月可以进行年月的选择