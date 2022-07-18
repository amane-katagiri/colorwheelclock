var HUE_START_DEFAULT = 240;
var SAT_DEFAULT = 80;
var LIGHT_MIN_DEFAULT = 25;
var LIGHT_MAX_DEFAULT = 75;
var HUE_DEGREE = 360;
var DAY_SECONDS = 86400;
var HOUR_SECONDS = 3600;
var MINUTE_SECONDS = 60;

var HUE_START = HUE_START_DEFAULT;
var SAT = SAT_DEFAULT;
var LIGHT_MIN = LIGHT_MIN_DEFAULT;
var LIGHT_MAX = LIGHT_MAX_DEFAULT;

document.documentElement.style.setProperty( '--vh', window.innerHeight / 100 + 'px');
window.addEventListener('resize', function() {
  document.documentElement.style.setProperty( '--vh', window.innerHeight / 100 + 'px');
}, false);
function updateByTime(h, m, s) {
  var t = h * HOUR_SECONDS + m * MINUTE_SECONDS + s;
  _update(h, m, s, t);
}
function updateByPosition(_t) {
  var t = _t % DAY_SECONDS;
  var h = Math.ceil(t / HOUR_SECONDS);
  var m = Math.ceil((t % HOUR_SECONDS) / MINUTE_SECONDS);
  var s = Math.ceil((t % HOUR_SECONDS) % MINUTE_SECONDS);
  _update(h, m, s, t);
}
function _update(h, m, s, t) {
  document.getElementById('h').innerHTML = h < 10 ? '0' + h : h;
  document.getElementById('m').innerHTML = m < 10 ? '0' + m : m;
  document.getElementById('s').innerHTML = s < 10 ? '0' + s : s;
  document.body.style.backgroundColor = makeHslColor(t);
  var h_offset = makeHue(t);
  var gradient = `linear-gradient(90deg,
    hsl(` + (HUE_DEGREE * 3 / 6 + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS * 3 / 6).toString() + `%) 0%,
    hsl(` + (HUE_DEGREE * 4 / 6 + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS * 4 / 6).toString() + `%) 17%,
    hsl(` + (HUE_DEGREE * 5 / 6 + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS * 5 / 6).toString() + `%) 34%,
    hsl(` + (HUE_DEGREE         + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS        ).toString() + `%) 50%,
    hsl(` + (HUE_DEGREE * 7 / 6 + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS * 7 / 6).toString() + `%) 67%,
    hsl(` + (HUE_DEGREE * 8 / 6 + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS * 8 / 6).toString() + `%) 84%,
    hsl(` + (HUE_DEGREE * 9 / 6 + h_offset).toString() + `, ` + SAT + `%, ` + makeLight(t + DAY_SECONDS * 9 / 6).toString() + `%) 100%
  )`; // TODO: light is not precise
  document.getElementById('message-container').style.background = gradient;
  document.body.classList.remove('loading');
}
function makeHslColor(t, hue_offset = 0, sat = SAT, light_min = LIGHT_MIN, light_max = LIGHT_MAX, hue_start = HUE_START) {
  return 'hsl(' + makeHue(t, hue_offset, hue_start).toString() + ', ' + sat.toString() + '%, ' + makeLight(t, light_min, light_max).toString() + '%)';
}
function makeHue(t, hue_offset = 0, hue_start = HUE_START) {
  return (hue_offset + HUE_DEGREE * (t % DAY_SECONDS) / DAY_SECONDS + hue_start) % HUE_DEGREE;
}
function makeLight(t, light_min = LIGHT_MIN, light_max = LIGHT_MAX) {
  return light_max - Math.abs((light_max - light_min) * 2 * (t % DAY_SECONDS) / DAY_SECONDS - (light_max - light_min));
}
function storageAvailable(type) {
  var storage;
  try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}
document.addEventListener('DOMContentLoaded', function() {
  setInterval(function() {
    var now = new Date();
    updateByTime(now.getHours(), now.getMinutes(), now.getSeconds());
  }, 500);
  if (storageAvailable('localStorage')) {
    document.getElementById('hue').value = parseInt(localStorage.getItem('hue') || HUE_START, 10);
    document.getElementById('sat').value = parseInt(localStorage.getItem('sat') || SAT, 10);
    document.getElementById('bom').value = parseInt(localStorage.getItem('bom') || LIGHT_MIN, 10);
    document.getElementById('bon').value = parseInt(localStorage.getItem('bon') || LIGHT_MAX, 10);
  }
  HUE_START = parseInt(document.getElementById('hue').value, 10);
  SAT = parseInt(document.getElementById('sat').value, 10);
  LIGHT_MIN = parseInt(document.getElementById('bom').value, 10);
  LIGHT_MAX = parseInt(document.getElementById('bon').value, 10);
  document.getElementById('hue').addEventListener('change', function(e) {
    HUE_START = parseInt(e.target.value, 10);
    if (storageAvailable('localStorage')) {
      localStorage.setItem('hue', HUE_START);
    }
  });
  document.getElementById('sat').addEventListener('change', function(e) {
    SAT = parseInt(e.target.value, 10);
    if (storageAvailable('localStorage')) {
      localStorage.setItem('sat', SAT);
    }
  });
  document.getElementById('bom').addEventListener('change', function(e) {
    LIGHT_MIN = parseInt(e.target.value, 10);
    if (storageAvailable('localStorage')) {
      localStorage.setItem('bom', LIGHT_MIN);
    }
  });
  document.getElementById('bon').addEventListener('change', function(e) {
    LIGHT_MAX = parseInt(e.target.value, 10);
    if (storageAvailable('localStorage')) {
      localStorage.setItem('bon', LIGHT_MAX);
    }
  });
  document.getElementById('reset').addEventListener('click', function() {
    HUE_START = HUE_START_DEFAULT;
    SAT = SAT_DEFAULT;
    LIGHT_MIN = LIGHT_MIN_DEFAULT;
    LIGHT_MAX = LIGHT_MAX_DEFAULT;
    document.getElementById('hue').value = HUE_START;
    document.getElementById('sat').value = SAT
    document.getElementById('bom').value = LIGHT_MIN;
    document.getElementById('bon').value = LIGHT_MAX;;
    if (storageAvailable('localStorage')) {
      localStorage.removeItem('hue');
      localStorage.removeItem('sat');
      localStorage.removeItem('bom');
      localStorage.removeItem('bon');
    }
  });
});
