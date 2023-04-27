let scrollsection = document.querySelector('.scrollsection')
function getData() {
    return new Promise((resolve, reject) => {
        fetch('./photoList.json')
        .then(response => response.json())
        .then(res => {
            renderData(res)
            window.ViewImage && ViewImage.init('.scrollsection img'); // 灯箱
            const example = new Example({
                root: document.querySelector('.scroll-animations-example')
            });
        });
    })
}
function renderData(data) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < data.length; i++) {
        const div = document.createElement('div');
        //const scroll = document.createElement('scroll-animations-example')
        const img = document.createElement('img');
        //scroll.setAttribute('data-scroll-section')
        div.className = random('className')
        div.setAttribute('data-scroll', true)
        div.setAttribute('data-scroll-speed', i==0?'item -normal -horizontal': random('number', 1, 5))
        img.className = 'image'
        img.src = data[i].link;
        img.style.maxWidth = 600;
        div.appendChild(img);
        //scroll.appendChild(div);
        fragment.appendChild(div);
    }
    scrollsection.textContent  = ""
    scrollsection.appendChild(fragment);
}
function random(type, min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min)
    let arr =['item -small -horizontal','item -big -horizontal','item -normal -horizontal', 'item -normal','item -small','item -big']
    if(type == 'number'){
        return r
    }else{
        return arr[Math.floor(Math.random() * (arr.length-1 - 0 + 1) + 0)]
    }
}
getData()
class Example {
    constructor(options) {
        this.root = options.root;
        this.init();
        setTimeout(this.showImages.bind(this), 1000);
    }
    init() {
        this.scroll = new LocomotiveScroll({
            el: this.root,
            direction: 'horizontal',
            smooth: true,
            lerp: 0.05,
            tablet: {
                smooth: true
            },
            smartphone: {
                smooth: true
            }
        });
        this.images = this.root.querySelectorAll('.image');

        [].forEach.call(this.images, (image) => {
            image.addEventListener('click', () => {
                image.classList.add('-clicked');
                this.hideImages();
            });
        });
    }

    showImages() {
        [].forEach.call(this.images, (image) => {
            image.classList.remove('-clicked');
            image.classList.add('-active');
        });
    }

    hideImages() {
        [].forEach.call(this.images, (image) => {
            image.classList.remove('-active');
        });

        setTimeout(this.showImages.bind(this), 2000);
    }
}
window.addEventListener('DOMContentLoaded', (event) => {
    const example = new Example({
        root: document.querySelector('.scroll-animations-example')
    });
});
