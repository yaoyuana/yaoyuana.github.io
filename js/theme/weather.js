(function () {
  var badge = document.getElementById('tod-badge');
  var tempEl = document.getElementById('tod-temp');
  var tipTemp = document.getElementById('tod-tip-temp');
  var tipDesc = document.getElementById('tod-tip-desc');
  var tipFeel = document.getElementById('tod-tip-feel');
  var tipHum = document.getElementById('tod-tip-hum');
  var tipWind = document.getElementById('tod-tip-wind');
  var tipRange = document.getElementById('tod-tip-range');
  if (!badge) return;

  var CACHE_KEY = 'yy-weather-sh';
  var CACHE_MS = 20 * 60 * 1000;
  var WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1';

  function shanghaiHour() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        hour12: false
      }).formatToParts(new Date());
      var i;
      for (i = 0; i < parts.length; i++) {
        if (parts[i].type === 'hour') return parseInt(parts[i].value, 10);
      }
    } catch (e) {}
    return new Date().getHours();
  }

  function fallbackIcon() {
    var hour = shanghaiHour();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'noon';
    return 'evening';
  }

  function iconOf(code, isDay) {
    if (code === 0) return isDay ? 'clear-day' : 'clear-night';
    if (code === 1 || code === 2) return isDay ? 'partly' : 'partly-night';
    if (code === 3) return 'overcast';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 51 && code <= 57) return 'drizzle';
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'storm';
    return isDay ? 'clear-day' : 'clear-night';
  }

  function zhOf(code) {
    if (code === 0) return '晴';
    if (code === 1) return '大部晴朗';
    if (code === 2) return '多云';
    if (code === 3) return '阴';
    if (code === 45 || code === 48) return '雾';
    if (code >= 51 && code <= 57) return '毛毛雨';
    if (code >= 61 && code <= 65) return '雨';
    if (code === 66 || code === 67) return '冻雨';
    if (code >= 71 && code <= 77) return '雪';
    if (code >= 80 && code <= 82) return '阵雨';
    if (code === 85 || code === 86) return '阵雪';
    if (code === 95) return '雷阵雨';
    if (code >= 96) return '雷暴冰雹';
    return '天气';
  }

  function setIcon(name) {
    badge.setAttribute('data-icon', name);
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function showFallback() {
    var icon = fallbackIcon();
    var label = icon === 'morning' ? '上海 · 清晨' : icon === 'noon' ? '上海 · 午间' : '上海 · 夜里';
    setIcon(icon);
    setText(tempEl, '');
    setText(tipTemp, '--°');
    setText(tipDesc, label + ' · 天气暂读不到');
    setText(tipFeel, '--°');
    setText(tipHum, '--%');
    setText(tipWind, '-- km/h');
    setText(tipRange, '--° / --°');
    badge.setAttribute('aria-label', label);
  }

  function applyWeather(data) {
    var cur = data.current || {};
    var daily = data.daily || {};
    var code = Number(cur.weather_code);
    var isDay = cur.is_day === 1;
    var icon = iconOf(code, isDay);
    var desc = zhOf(code);
    var temp = Math.round(cur.temperature_2m);
    var feel = Math.round(cur.apparent_temperature);
    var hum = Math.round(cur.relative_humidity_2m);
    var wind = Math.round(cur.wind_speed_10m);
    var max = daily.temperature_2m_max && daily.temperature_2m_max[0];
    var min = daily.temperature_2m_min && daily.temperature_2m_min[0];
    setIcon(icon);
    setText(tempEl, isNaN(temp) ? '' : temp + '°');
    setText(tipTemp, isNaN(temp) ? '--°' : temp + '°');
    setText(tipDesc, desc);
    setText(tipFeel, isNaN(feel) ? '--°' : feel + '°');
    setText(tipHum, isNaN(hum) ? '--%' : hum + '%');
    setText(tipWind, isNaN(wind) ? '-- km/h' : wind + ' km/h');
    if (max == null || min == null || isNaN(max) || isNaN(min)) {
      setText(tipRange, '--° / --°');
    } else {
      setText(tipRange, Math.round(min) + '° / ' + Math.round(max) + '°');
    }
    badge.setAttribute('aria-label', '上海 ' + desc + ' ' + temp + '°');
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.at || Date.now() - parsed.at > CACHE_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data }));
    } catch (e) {}
  }

  function load() {
    var cached = readCache();
    if (cached) {
      applyWeather(cached);
      return;
    }
    setIcon(fallbackIcon());
    fetch(WEATHER_URL)
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        writeCache(data);
        applyWeather(data);
      })
      .catch(function () {
        showFallback();
      });
  }

  load();
})();
