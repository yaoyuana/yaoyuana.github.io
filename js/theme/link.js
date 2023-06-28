// 随机排列
function shuffle(arr) {
  let i = arr.length;
  while (i) {
    let j = Math.floor(Math.random() * i--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
}

// 渲染数据
function renderlink(data) {
  var name, avatar, site, li = "";
  shuffle(data);
  for (var i = 0; i < data.length; i++) {
    name = data[i].name;
    avatar = data[i].avatar;
    site = data[i].site;
    li += '<div class="card">' + '<a href="' + site + '" target="_blank">' + '<div class="thumb" style="background: url( ' + avatar + ');">' + '</div>'+'<img src="https://s0.wp.com/mshots/v1/'+ site + '/?w=600&h=400"></img>' + '</a>' + '<div class="card-header">' + '<div><a href="' + site + '" target="_blank">' + name + '</a></div>' + '</div>' + '</div>';
  }
  document.querySelector(".link-navigation").innerHTML = li;
}

// 获取 json 文件
fetch('/links/linklist.json')
  .then(response => response.json())
  .then(res => renderlink(res));
  
window.onload = function() {
  new Valine({
      el: '#vcomment',
      notify: true,
      verify: false,
      // app_id: 'DFIWx0Ig1P6q1pCANzVk1rOp-MdYXbMMI',
      // app_key: 'LNfCXusAIdFZmfswnwN3a0gX',
      app_id: 'unnudWlPyrKXJy8ZHA7NZclo-gzGzoHsz',
      app_key: 'HAVxxg2rAU74oBO1M1ssTo1U',
      placeholder: '留下点什么吧......',
      avatar: 'monsterid',
      pageSize: 5,
      visitor: true,
      highlight: true,
      recordIP: true,
      // serverURLs: 'https://dfiwx0ig.api.lncldglobal.com'  // 增加这一行！！！
  });
  let comment = document.getElementById('vcomment')
  comment.style.display = 'block'
}