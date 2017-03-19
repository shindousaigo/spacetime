// javascript setX methods like setDate() can't be used because of the local bias
//these methods wrap around them.
const dayTimes = require('../lib/dayTimes');
const ms = require('../../lib/milliseconds');
const months = require('../lib/months');
const monthLength = require('../lib/monthLength');

const validate = function(n) {
  //handle number as a string
  if (typeof n === 'string') {
    n = parseInt(n, 10);
  }
  return n;
};

const units = {
  second: ['second', 'millisecond'],
  minute: ['minute', 'second', 'millisecond'],
  hour: ['hour', 'minute', 'second', 'millisecond'],
  date: ['date', 'hour', 'minute', 'second', 'millisecond'],
  month: ['month', 'date', 'hour', 'minute', 'second', 'millisecond'],
  year: ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'],
};
//reduce hostile micro-changes when moving dates by millisecond
const confirm = function(s, tmp, unit) {
  let arr = units[unit];
  for(let i = 0; i < arr.length; i++) {
    let want = tmp[arr[i]]();
    s[arr[i]](want);
  }
  return s;
};

module.exports = {

  milliseconds: (s, n) => {
    n = validate(n);
    let current = s.millisecond();
    let diff = current - n; //milliseconds to shift by
    return s.epoch - diff;
  },

  seconds: (s, n) => {
    n = validate(n);
    let diff = s.second() - n;
    let shift = diff * ms.second;
    return s.epoch - shift;
  },

  minutes: (s, n) => {
    n = validate(n);
    let old = s.clone();
    let diff = s.minute() - n;
    let shift = diff * ms.minute;
    s.epoch -= shift;
    confirm(s, old, 'second');
    return s.epoch;
  },

  hours: (s, n) => {
    n = validate(n);
    let old = s.clone();
    let diff = s.hour() - n;
    let shift = diff * ms.hour;
    s.epoch -= shift;
    confirm(s, old, 'minute');
    return s.epoch;
  },

  //support setting time by '4:25pm' - this isn't very-well developed..
  time: (s, str) => {
    let m = str.match(/([0-9]{1,2}):([0-9]{1,2})(am|pm)?/);
    if (!m) {
      return s.epoch;
    }
    let h24 = false;
    let hour = parseInt(m[1], 10);
    let minute = parseInt(m[2], 10);
    if (hour > 12) {
      h24 = true;
    }
    if (!h24 && m[3] === 'pm') {
      hour += 12;
    }
    s.hour(hour);
    s.minute(minute);
    s.second(0);
    s.millisecond(0);
    return s.epoch;
  },

  date: (s, n) => {
    n = validate(n);
    let old = s.clone();
    let diff = n - s.date();
    let shift = diff * ms.day;
    s.epoch += shift;
    //account for a dst/leap change
    confirm(s, old, 'hour');
    return s.epoch;
  },

  //this one's tricky
  month: (s, n) => {
    let old = s.clone();
    if (typeof n === 'string') {
      n = months.mapping[n.toLowerCase()];
    }
    n = validate(n);
    //months are zero-based
    let date = s.date();
    //there's no 30th of february, etc.
    if (date > monthLength[n]) {
      //make it as close as we can..
      date = monthLength[n];
    }
    // s.log();
    s.date(date);
    let diff = n - s.month();
    let shift = diff * ms.month;
    s.epoch += shift;
    if (s.d.getMonth() > n) {
      s.epoch -= ms.month;
    }
    if (s.d.getMonth() < n) {
      s.epoch += ms.month;
    }
    s.date(date);
    confirm(s, old, 'hour');
    return s.epoch;
  },

  year: (s, n) => {
    n = validate(n);
    let old = s.clone();
    let diff = n - s.year();
    let shift = diff * ms.year;
    s.epoch += shift;
    //account for a dst/leap change
    confirm(s, old, 'month');
    return s.epoch;
  },

  dayOfYear: (s, n) => {
    n = validate(n);
    let old = s.clone();
    let diff = n - s.dayOfYear();
    let shift = diff * ms.day;
    s.epoch += shift;
    confirm(s, old, 'hour');
    return s.epoch;
  },

  timeOfDay: (s, str) => {
    if (dayTimes[str] !== undefined) {
      s.hour(dayTimes[str]);
      s.minute(0);
      s.second(0);
      return s.epoch;
    }
    return null;
  }

};