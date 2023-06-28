class WaterFall {
    constructor(container, options) {
      this.gap = options.gap || 0;
      this.container = container;
      this.items = container.children || [];
      this.heightArr = [];
      this.renderIndex = 0;
      window.addEventListener('resize', () => {
        this.renderIndex = 0;
        this.heightArr = [];
        this.layout()
      });
      this.container.addEventListener('DOMSubtreeModified', () => {
        this.layout();
      })
    }
    layout() {
      if(this.items.length === 0) return;
      const gap = this.gap;
      const pageWidth = this.container.offsetWidth;
      const itemWidth = this.items[0].offsetWidth;
      const columns = parseInt(pageWidth / (itemWidth + gap)); // 总共有多少列
      while (this.renderIndex < this.items.length) {
        let top, left;
        if(this.renderIndex < columns) { // 第一列
          top = 0; left = (itemWidth + gap) * this.renderIndex;
          this.heightArr.push(this.items[this.renderIndex].offsetHeight)
        } else {
          const minIndex = this.getMinIndex(this.heightArr);
          top = this.heightArr[minIndex] + gap;
          left = this.items[minIndex].offsetLeft
          this.heightArr[minIndex] += (this.items[this.renderIndex].offsetHeight + gap); 
        }
        this.container.style.height = this.getMaxHeight(this.heightArr) + 'px';
        this.items[this.renderIndex].style.top = top + 'px';
        this.items[this.renderIndex].style.left = left + 'px';
        this.renderIndex++;
      }
    }
  
    getMinIndex(heightArr) {
      let minIndex = 0;
      let min = heightArr[minIndex]
      for (let i = 1; i < heightArr.length; i++) {
        if(heightArr[i] < min) {
          min = heightArr[i]
          minIndex = i;
        }      
      }
      return minIndex;
    }
    getMaxHeight(heightArr) {
      let maxHeight = heightArr[0]
      for (let i = 1; i < heightArr.length; i++) {
        if(heightArr[i] > maxHeight) {
          maxHeight = heightArr[i]
        }      
      }
      return maxHeight;
    }
  }
window.onload = function() {
  const waterfall = document.getElementById('waterfall');
  const water = new WaterFall(waterfall, {gap: 0})
  water.layout()
}
//TODO: 懒加载、滚动加载
const waterfall = document.getElementById('waterfall')
const filterBtn  = document.getElementById('filter')
let filterBtns  = []  //所有按钮DOM
let photoList = []
function getData() {
  return new Promise((resolve, reject) => {
    fetch('/photo/photoList.json')
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
      showList( button.innerText == '全部'? photoList: photoList.filter(photo =>{
        return photo.type.split('、').includes(button.innerText)
      }))
    });
  });
}
function showList(res) {
  renderData(res);
  renderr(); // 添加移入移入事件
  window.ViewImage && ViewImage.init('.waterfall img'); // 灯箱
  const water = new WaterFall(waterfall, {gap: 0}) 
  water.layout()
}
let timerId = null
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
    div.className = 'waterfall-item'
    img.src = data[i].link;
    img.addEventListener('load',debounce(function(){
      const water = new WaterFall(waterfall, {gap: 0}) 
      water.layout();
    }, 1000));
    span.textContent = data[i].desc;
    p.appendChild(span);
    div.appendChild(img);
    div.appendChild(p);
    div.style.width =  isMobile()? '32.5%': '25%'
    // div.style.height =  '200px'
    fragment.appendChild(div);
  }
  waterfall.textContent  = ""
  waterfall.appendChild(fragment);
}