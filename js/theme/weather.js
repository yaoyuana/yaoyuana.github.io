(function () {
  var badge = document.getElementById('tod-badge');
  var tempEl = document.getElementById('tod-temp');
  var tipPlace = document.querySelector('.tod-tip-place');
  var tipTemp = document.getElementById('tod-tip-temp');
  var tipDesc = document.getElementById('tod-tip-desc');
  var tipFeel = document.getElementById('tod-tip-feel');
  var tipHum = document.getElementById('tod-tip-hum');
  var tipWind = document.getElementById('tod-tip-wind');
  var tipRange = document.getElementById('tod-tip-range');
  if (!badge) return;

  var CACHE_KEY = 'yy-weather-loc';
  var CACHE_MS = 20 * 60 * 1000;
  var FALLBACK = { lat: 34.2655, lon: 108.9541, place: '西安' };

  function weatherUrl(lat, lon) {
    return 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
      '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day' +
      '&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
  }

  function localHour() {
    return new Date().getHours();
  }

  function fallbackIcon() {
    var hour = localHour();
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

  function publishWeather(info) {
    window.yyWeather = info;
    try {
      window.dispatchEvent(new CustomEvent('yy-weather', { detail: info }));
    } catch (e) {}
  }

  function setIcon(name) {
    badge.setAttribute('data-icon', name);
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setPlace(name) {
    setText(tipPlace, name || FALLBACK.place);
  }

  function showFallback(place) {
    var icon = fallbackIcon();
    var where = place || FALLBACK.place;
    var when = icon === 'morning' ? '清晨' : icon === 'noon' ? '午间' : '夜里';
    setIcon(icon);
    setPlace(where);
    setText(tempEl, '');
    setText(tipTemp, '--°');
    setText(tipDesc, when + ' · 天气暂读不到');
    setText(tipFeel, '--°');
    setText(tipHum, '--%');
    setText(tipWind, '-- km/h');
    setText(tipRange, '--° / --°');
    badge.setAttribute('aria-label', where + ' · ' + when);
    publishWeather({
      place: where,
      desc: when,
      temp: null,
      feel: null,
      icon: icon,
      ok: false,
      usedFallback: where === FALLBACK.place
    });
  }

  function applyWeather(data, place) {
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
    var where = place || FALLBACK.place;
    setIcon(icon);
    setPlace(where);
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
    badge.setAttribute('aria-label', where + ' ' + desc + ' ' + temp + '°');
    publishWeather({
      place: where,
      desc: desc,
      temp: isNaN(temp) ? null : temp,
      feel: isNaN(feel) ? null : feel,
      icon: icon,
      ok: true,
      usedFallback: where === FALLBACK.place && window.__yyWeatherFallback === true
    });
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.at || Date.now() - parsed.at > CACHE_MS) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        at: Date.now(),
        lat: payload.lat,
        lon: payload.lon,
        place: payload.place,
        data: payload.data,
        usedFallback: payload.usedFallback === true
      }));
    } catch (e) {}
  }

  function locate() {
    return new Promise(function (resolve) {
      if (!navigator.geolocation) {
        window.__yyWeatherFallback = true;
        resolve(FALLBACK);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          window.__yyWeatherFallback = false;
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            place: ''
          });
        },
        function () {
          window.__yyWeatherFallback = true;
          resolve(FALLBACK);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 30 * 60 * 1000 }
      );
    });
  }

  function lookupPlace(lat, lon) {
    return fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=zh')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (json) {
        return json.city || json.locality || json.principalSubdivision || '';
      })
      .catch(function () { return ''; });
  }

  function fetchWeather(loc) {
    return fetch(weatherUrl(loc.lat, loc.lon))
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        var placePromise = loc.place ? Promise.resolve(loc.place) : lookupPlace(loc.lat, loc.lon);
        return placePromise.then(function (place) {
          var where = place || loc.place || '当前位置';
          writeCache({ lat: loc.lat, lon: loc.lon, place: where, data: data, usedFallback: window.__yyWeatherFallback === true });
          applyWeather(data, where);
        });
      });
  }

  function load() {
    var cached = readCache();
    if (cached && cached.data) {
      window.__yyWeatherFallback = cached.usedFallback === true;
      applyWeather(cached.data, cached.place);
      return;
    }
    setIcon(fallbackIcon());
    setPlace('定位中');
    locate()
      .then(function (loc) {
        return fetchWeather(loc).catch(function () {
          showFallback(loc.place || '当前位置');
        });
      });
  }

  load();
})();
