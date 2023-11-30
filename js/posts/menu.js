// 飞行物
let plane = $('#plane')[0];
let deg = 0, ex = 0,ey = 0, vx = 0, vy = 0, count = 0;
window.addEventListener('mousemove',(e)=>{
    ex = e.x - plane.offsetLeft-plane.clientWidth/2;
    ey = e.y - plane.offsetTop-plane.clientHeight/2;
    deg = 360*Math.atan(ey/ex)/(2*Math.PI)+45;
    if(ex < 0){
        deg += 180;
    }
    count=0;
})
function draw(){
    plane.style.transform = 'rotate('+deg+'deg)';
    if( count < 100 ){
        vx += ex / 100;
        vy += ey / 100;
    }
    plane.style.left = vx + 'px';
    plane.style.top = vy+ 'px';
    count++;
}
setInterval(draw, 1);

const waterfall = $('#waterfall')[0]
const filterBtn  = $('#filter')[0]
$('.dog')[0].style.display = 'none'
const header1  = $('#masthead')[0]
const header2  = $('.post-header')[0]
const footer  = $('.post-footer')[0]
const searchBtn  = $('#search-btn')[0]
const searchCot  = $('#search-content')[0]
// const neontext = new Neontext('search-btn'); // 乱飞的文字
let filterBtns  = []  //所有按钮DOM
let photoList = []
let timerId = null
let MOFUN = window.MOFUN || {};
let running = 0,
    what = $("#what"),
    whatImg = $("#whatImg"),
    times = 0,
    timer = 0;
MOFUN.random = function(max, min) {
    max = max || 100;
    min = min || 0;
    return Math.ceil(Math.random() * (max - min) + min);
}
MOFUN.remove = function(ele) {
    ele && ele.parentNode.removeChild(ele);
};

function getData() {
  return new Promise((resolve, reject) => {
    fetch('/photo/menu.json')
      .then(response => response.json())
      .then(res => {
          photoList = res
          //组装筛选按钮
          let btn = new Set([])
          photoList.forEach(photo => {
            let type = photo.type.split('、')
            type.forEach(t =>{ btn.add(t) })
          });
          renderFilterBtn([...btn])
          showList(photoList)
          resolve(res)
      });
  })
}
getData()
searchBtn.addEventListener('click',(e)=>{
    waterfall.style.display = 'none'
    searchCot.style.display = 'block'
    searchBtn.innerText = '停止'
    // neontext.render.run();
    let foodList = showListBytype( $('.filter-button.active')[0].innerText )
    if (!running) {
        times++;
        hideOther()
        if (times == 3) {
            searchBtn.innerText = '继续'
            showOther()
            // neontext.render.killer();
            return false;
        }
        searchBtn.innerText = '停止'
        timer = setInterval(function() {
            var r = MOFUN.random(foodList.length),
                food = foodList[r - 1],
                rTop = MOFUN.random($(document).height()),
                rLeft = MOFUN.random($(document).width() - 50),
                rSize = MOFUN.random(37, 14);
            what.html(food.desc);

            whatImg.attr('src', food.link);
            $("<span class='temp'>" + food.desc + "</span>").css({
                "display": "none",
                "top": rTop,
                "left": rLeft,
                "color": "rgba(0,0,0,." + Math.random() + ")",
                "fontSize": rSize + "px"
            }).appendTo("body").fadeIn(800, function() {
                $(this).fadeOut(1000, function() {
                    $(this).remove();
                });
            });
        }, 100);
        running = 1;
    } else {
        showOther()
        searchBtn.innerText = "不行，换一个"
        clearInterval(timer);
        running = 0;
    };
})
function hideOther() {
    filterBtn.style.opacity = 0
    header1.style.opacity = 0
    header2.style.opacity = 0
    $('.post-footer')[0].style.opacity = 0
}
function showOther() {
    filterBtn.style.opacity = 1
    header1.style.opacity = 1
    header2.style.opacity = 1
    $('.post-footer')[0].style.opacity = 1
}
function renderFilterBtn(filterButtons) {
  const fragment = document.createDocumentFragment();
  const button = document.createElement('button');
  button.className = 'filter-button active'
  button.textContent = '全部';
  fragment.appendChild(button);
  for (let i = 0; i < filterButtons.length; i++) {
    const button = document.createElement('button');
    button.className = 'filter-button'
    button.textContent = filterButtons[i];
    fragment.appendChild(button);
  }
  filterBtn.appendChild(fragment);
  filterBtns = document.querySelectorAll('.filter-button'); 
  filterBtns.forEach(button => {
    button.addEventListener('click', () => {
      // 移除所有按钮的active类
      filterBtns.forEach(b => b.classList.remove('active'));
      // 为当前按钮添加active类
      button.classList.add('active');
      showList( showListBytype(button.innerText) )
    });
  });
}
function showListBytype(type) {
    return type === '全部'? photoList : photoList.filter(photo =>{
        return photo.type.split('、').includes(type)
    })
}
function showList(res) {
  renderData(res);
  renderr(); // 添加移入移入事件
  window.ViewImage && ViewImage.init('.waterfall img'); // 灯箱
}
function debounce(fn, delay) {
  return function () {
      let self = this;
      let args = arguments;
      timerId && clearTimeout(timerId);
      timerId = setTimeout(function () {
          fn.apply(self, args);
      }, delay || 1000);
  }
}
function isMobile() {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['iphone', 'android', 'phone', 'mobile', 'wap', 'netfront', 'java', 'opera mobi',
    'opera mini', 'ucweb', 'windows ce', 'symbian', 'blackberry', 'windows phone', 'nokia', 'webos', 'iemobile'];
  return mobileKeywords.some((keyword) => userAgent.indexOf(keyword) > -1);
}
function renderData(data) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < data.length; i++) {
    const div = document.createElement('li');
    const p = document.createElement('p');
    const span = document.createElement('span');
    const img = document.createElement('img');
    const desc = document.createElement('div');
    div.className = 'waterfall-item'
    desc.className = 'waterfall-desc'
    img.src = data[i].link;
    span.textContent = data[i].desc;
    desc.innerText = data[i].desc
    p.appendChild(span);
    div.appendChild(img);
    div.appendChild(p);
    div.appendChild(desc);
    div.style.width =  isMobile()? '50%': '25%'
    div.style.height =  isMobile()? '150px': '275px'
    fragment.appendChild(div);
  }
  waterfall.textContent  = ""
  waterfall.appendChild(fragment);
}