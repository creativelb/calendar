/* 
        todo 年月的点击选择时间
    */

/* 
  options： {
    separator： '/', 分隔符
  }
*/
function Calendar(el, options) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.options = options || {};
    this.elHeight = this.el.offsetHeight;
    this.showTime = { //目前选中的日期
        // millisecond: 0,
        year: 0,
        month: 0,
        day: 0,
        show: ''
    };
    this.currentTime = { //日历界面的当前展示年月
        // millisecond: 0,
        year: 0,
        month: 0,
        day: 0,
        show: ''
    };
    this.state = 0; //0隐藏 1显示日子 2显示月份 3显示年份
    this.isMoving = false; //是否正在移动有移动动画
    this.calendarShow = false;
    this.create();
}

// 2月有闰年 不放入map中
Calendar.prototype.monthToDay = new Map([[1, 31], [3, 31], [4, 30], [5, 31], [6, 30], [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31]])

//初始化日历对象和dom 
Calendar.prototype.create = function () {
    let current = new Date()
    let { millisecond, year, month, day, show } = this.gainTime(current);
    this.currentTime = { millisecond, year, month, day, show }
    this.showTime = { millisecond, year, month, day, show }
    this.el.style.position = 'relative';
    this.el.addEventListener('click', this.toggleCalendarShow.bind(this), false);
    let fragment = document.createDocumentFragment();
    let calendar = document.createElement('div')
    calendar.style.display = 'none'
    calendar.classList.add('calendar');
    let calendarYearAndMonth = this.setCalendarYearAndMonth();
    calendar.appendChild(calendarYearAndMonth);
    let calendarWrapper = document.createElement('div');
    calendarWrapper.classList.add('calendar-wrapper');
    let currentMonth = this.currentTime.month;
    let currentYear = this.currentTime.year;
    let prevMonth = (currentMonth - 1) <= 0 ? 12 : currentMonth - 1;
    let prevYear = prevMonth === 12 ? currentYear - 1 : currentYear;
    let nextMonth = (currentMonth + 1) >= 12 ? 1 : currentMonth + 1;
    let nextYear = nextMonth === 1 ? currentYear + 1 : currentYear;
    let prevUl = this.setCalendarItem(prevYear, prevMonth);
    let currentUl = this.setCalendarItem(currentYear, currentMonth);
    let nextUl = this.setCalendarItem(nextYear, nextMonth);
    calendarWrapper.appendChild(prevUl);
    calendarWrapper.appendChild(currentUl);
    calendarWrapper.appendChild(nextUl);
    calendarWrapper.style.transform = 'translateX(-300px)'
    calendar.appendChild(calendarWrapper);
    fragment.appendChild(calendar);
    this.el.appendChild(fragment);
}
// calendar的显示与隐藏
Calendar.prototype.toggleCalendarShow = function () {
    if (this.calendarShow) {
        this.el.querySelector('.calendar').style.display = 'none';
    } else {
        let calendar = this.el.querySelector('.calendar');
        this.el.querySelector('.calendar').style.display = 'block';
        calendar.style.top = this.elHeight + 'px';
    }
    this.calendarShow = !this.calendarShow;
}
// 设置年月dom
Calendar.prototype.setCalendarYearAndMonth = function () {
    let div = document.createElement('div');
    let year = document.createElement('div');
    let month = document.createElement('div');
    year.classList.add('calendar-date');
    year.classList.add('calendar-year');
    month.classList.add('calendar-date');
    month.classList.add('calendar-month');
    year.innerText = this.currentTime.year;
    month.innerText = this.currentTime.month;
    // todo 年月的点击选择时间
    div.appendChild(year);
    div.appendChild(month);
    return div;
}
// 设置dom 日历框中的dom元素
Calendar.prototype.setCalendarItem = function (year, month) {
    let date = new Date();
    date.setFullYear(year, month - 1, 1);
    // 这个年月第一天是周几  0:周日 6:周六
    let dayOfWeek = date.getDay();
    // 月份有几天
    let numOfMonth;
    if (this.monthToDay.has(month)) {
        numOfMonth = this.monthToDay.get(month);
    } else {
        this.isLeapYear(month) ? numOfMonth = 29 : numOfMonth = 28;
    }
    // 获取上个月的相关数据
    let prevMonth = (month - 1) <= 0 ? 12 : month - 1;
    let prevYear = prevMonth === 12 ? year - 1 : year;
    let prevDate = new Date();
    prevDate.setFullYear(prevYear, prevMonth, 1);
    // 月份有几天
    let prevNumOfMonth;
    if (this.monthToDay.has(prevMonth)) {
        prevNumOfMonth = this.monthToDay.get(prevMonth);
    } else {
        this.isLeapYear(prevMonth) ? prevNumOfMonth = 29 : prevNumOfMonth = 28;
    }
    // 没有渲染到页面上 未涉及重绘 所以无需fragment
    // let fragment = document.createDocumentFragment();
    let ul = document.createElement('ul');
    ul.classList.add('calendar-container');
    for (let i = 0; i < dayOfWeek; i++) {
        let li = document.createElement('li');
        li.innerText = prevNumOfMonth - dayOfWeek + 1 + i; //处理上个月最后几天的显示
        li.addEventListener('click', this.showPrevMonth.bind(this));
        li.classList.add('calendar-container-item-noactive');
        li.classList.add('calendar-container-item');
        ul.appendChild(li)
    }
    for (let i = 0; i < numOfMonth; i++) {
        let li = document.createElement('li');
        li.innerText = i + 1;
        li.addEventListener('click', this.selectDate.bind(this), false);
        if (year === this.showTime.year && month === this.showTime.month && i + 1 === this.showTime.day) {
            li.classList.add('calendar-container-item');
            li.classList.add('calendar-container-item-active');
        } else {
            li.classList.add('calendar-container-item');
        }
        ul.appendChild(li)
    }
    for (let i = 0; i < 6 * 7 - dayOfWeek - numOfMonth; i++) { //6*7一共有42个格子
        let li = document.createElement('li');
        li.innerText = i + 1; //处理下个月刚开始几天
        li.addEventListener('click', this.showNextMonth.bind(this));
        li.classList.add('calendar-container-item-noactive');
        li.classList.add('calendar-container-item');
        ul.appendChild(li)
    }
    return ul;
}
// 选择日期
Calendar.prototype.selectDate = function (e) {
    let year = this.currentTime.year;
    let month = this.currentTime.month;
    let day = parseInt(e.target.innerText);
    // e.target.classList.add('calendar-container-item-active');
    let separator = this.options.separator || '-';
    this.showTime = { //目前选中的日期
        year,
        month,
        day,
        show: `${year}${separator}${month >= 10 ? month : '0' + month}${separator}${day >= 10 ? day : '0' + day}`
    };
    let calendarWrapper = this.el.querySelector('.calendar-wrapper')
    calendarWrapper.innerHTML = '';
    let currentMonth = this.currentTime.month;
    let currentYear = this.currentTime.year;
    let prevMonth = (currentMonth - 1) <= 0 ? 12 : currentMonth - 1;
    let prevYear = prevMonth === 12 ? currentYear - 1 : currentYear;
    let nextMonth = (currentMonth + 1) >= 12 ? 1 : currentMonth + 1;
    let nextYear = nextMonth === 1 ? currentYear + 1 : currentYear;
    let prevUl = this.setCalendarItem(prevYear, prevMonth);
    let currentUl = this.setCalendarItem(currentYear, currentMonth);
    let nextUl = this.setCalendarItem(nextYear, nextMonth);
    let time = document.createTextNode(this.showTime.show);
    // 如果存在原来的时间 则先删除后添加选中的时间
    if (this.el.childNodes[1].nodeType === 3) {
        this.el.childNodes[1].remove();
    }
    this.el.insertBefore(time, this.el.childNodes[1]);
    calendarWrapper.appendChild(prevUl);
    calendarWrapper.appendChild(currentUl);
    calendarWrapper.appendChild(nextUl);
    /* 
        this.el.innerHTML = this.showTime.show + this.el.innerHTML;
        这样做是有问题的,this.el.innerHTML相当于里边的dom重新创建了一遍,所以
        dom元素绑定的点击事件就会失效,因为事件绑定在原来的dom元素上
    */
    // e.stopPropagation();
}

// 跳到下一页
Calendar.prototype.showNextMonth = function (e) {
    if (this.isMoving) {
        e.stopPropagation();
        return;
    }
    this.currentTime.month = this.currentTime.month + 1 > 12 ? 1 : this.currentTime.month + 1;
    this.currentTime.year = this.currentTime.month === 1 ? this.currentTime.year + 1 : this.currentTime.year;
    this.el.querySelector('.calendar-year').innerText = this.currentTime.year;
    this.el.querySelector('.calendar-month').innerText = this.currentTime.month;
    let wrapper = this.el.querySelector('.calendar-wrapper');
    wrapper.classList.add('transition');
    this.isMoving = true;
    wrapper.style.transform = 'translateX(-600px)';
    let showNextMonthTransiton = () => {
        wrapper.removeEventListener('transitionend', showNextMonthTransiton);
        this.isMoving = false;
        wrapper.classList.remove('transition');
        let nextMonth = this.currentTime.month + 1 > 12 ? 1 : this.currentTime.month + 1;
        let nextYear = nextMonth === 1 ? this.currentTime.year + 1 : this.currentTime.year;
        let nextMonthUl = this.setCalendarItem(nextYear, nextMonth);
        wrapper.appendChild(nextMonthUl);
        wrapper.removeChild(wrapper.children[0]);
        wrapper.style.transform = 'translateX(-300px)'; //回到初始位置
    }
    wrapper.addEventListener('transitionend', showNextMonthTransiton, false);
    e.stopPropagation();
}
// 跳到上一页
Calendar.prototype.showPrevMonth = function (e) {
    if (this.isMoving) {
        e.stopPropagation();
        return;
    }
    if (this.isMoving) return;
    this.currentTime.month = this.currentTime.month - 1 <= 0 ? 12 : this.currentTime.month - 1;
    this.currentTime.year = this.currentTime.month === 12 ? this.currentTime.year - 1 : this.currentTime.year;
    this.el.querySelector('.calendar-year').innerText = this.currentTime.year;
    this.el.querySelector('.calendar-month').innerText = this.currentTime.month;
    let wrapper = this.el.querySelector('.calendar-wrapper');
    wrapper.classList.add('transition');
    wrapper.style.transform = 'translateX(0)';
    let showPrevMonthTransiton = () => {
        wrapper.removeEventListener('transitionend', showPrevMonthTransiton);
        this.isMoving = false;
        wrapper.classList.remove('transition');
        let prevMonth = this.currentTime.month - 1 <= 0 ? 12 : this.currentTime.month - 1;
        let prevYear = prevMonth === 12 ? this.currentTime.year - 1 : this.currentTime.year;
        let prevMonthUl = this.setCalendarItem(prevYear, prevMonth);
        wrapper.insertBefore(prevMonthUl, wrapper.children[0]);
        wrapper.removeChild(wrapper.children[wrapper.children.length - 1]);
        wrapper.style.transform = 'translateX(-300px)'; //回到初始位置
    }
    wrapper.addEventListener('transitionend', showPrevMonthTransiton, false);
    e.stopPropagation();
}

// 判断闰年
Calendar.prototype.isLeapYear = function (year) {
    let result;
    ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? result = true : result = false;
    return result;
}

// 获取时间
Calendar.prototype.gainTime = function (date) {
    if (date === null || date instanceof Date !== true) throw new Error('日期格式或数据错误');
    let separator = this.options.separator || '-';
    let millisecond = date.getTime();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return {
        millisecond,
        year,
        month,
        day,
        show: `${year}${separator}${month > 10 ? month : '0' + month}${separator}${day > 10 ? day : '0' + day}`
    }
}

export default Calendar;