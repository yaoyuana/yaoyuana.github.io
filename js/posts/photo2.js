if (typeof window.yyDestroyLoco === 'function') {
    try { window.yyDestroyLoco(); } catch (e) {}
}
let scrollsection = document.querySelector('.scrollsection')
function getData() {
    return new Promise((resolve, reject) => {
        fetch('/photo/photoList.json')
        .then(response => response.json())
        .then(res => {
            renderData(res)
            window.ViewImage && ViewImage.init('.scrollsection img');
            var root = document.querySelector('.scroll-animations-example');
            if (!root || typeof LocomotiveScroll === 'undefined') return;
            waitImages(root, function () {
                new Example({ root: root });
            });
        });
    })
}
function renderData(data) {
    if (!scrollsection) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < data.length; i++) {
        const div = document.createElement('div');
        const img = document.createElement('img');
        div.className = random('className')
        div.setAttribute('data-scroll', true)
        div.setAttribute('data-scroll-speed', i==0?'item -normal -horizontal': random('number', 1, 5))
        img.className = 'image'
        img.src = data[i].link;
        img.style.maxWidth = 600;
        div.appendChild(img);
        fragment.appendChild(div);
    }
    scrollsection.textContent  = ""
    scrollsection.appendChild(fragment);
}
function waitImages(root, cb) {
    var imgs = [].slice.call(root.querySelectorAll('img'));
    if (!imgs.length) { cb(); return; }
    var left = imgs.length;
    var done = false;
    function one() {
        left -= 1;
        if (left <= 0 && !done) {
            done = true;
            cb();
        }
    }
    imgs.forEach(function (img) {
        if (img.complete && img.naturalWidth) one();
        else {
            img.addEventListener('load', one);
            img.addEventListener('error', one);
        }
    });
    setTimeout(function () {
        if (!done) {
            done = true;
            cb();
        }
    }, 4000);
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
        window.__yyLoco = this.scroll;
        window.yyDestroyLoco = function () {
            try {
                if (window.__yyLoco && typeof window.__yyLoco.destroy === 'function') {
                    window.__yyLoco.destroy();
                }
            } catch (e) {}
            window.__yyLoco = null;
            document.documentElement.classList.remove(
                'has-scroll-smooth',
                'has-scroll-init',
                'has-scroll-scrolling',
                'has-scroll-dragging'
            );
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            window.yyDestroyLoco = null;
        };
        if (window.yyPjaxOnLeave) window.yyPjaxOnLeave(window.yyDestroyLoco);
        this.images = this.root.querySelectorAll('.image');
        if (this.scroll && typeof this.scroll.update === 'function') {
            var self = this;
            setTimeout(function () { try { self.scroll.update(); } catch (e) {} }, 300);
        }

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
getData()
