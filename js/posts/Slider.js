// 生成一个图片灯箱
class Slider {
    constructor(slider, imgList) {
        this.slider = slider;
        this.imgList = imgList
        this.sliderNavigation = this.slider.querySelector(".slider-navigation");
        this.display = this.slider.querySelector(".image-display");
        this.prevButton = this.slider.querySelector(".prev-button");
        this.nextButton = this.slider.querySelector(".next-button");
        this.content = this.slider.querySelector('.content')
        this.currentSlideIndex = 0;
        this.preloadedImages = {};
        this.initialize();
    }
    initialize() {
        this.drawImg();
        this.setupSlider();
        this.preloadImages();
        this.eventListeners();
    }
    drawImg () {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this.imgList.length; i++) {
            const div = document.createElement('button');
            const img = document.createElement('img');
            div.className = 'nav-button'
            div.setAttribute('aria-selected', true)
            img.className = 'thumbnail'
            img.src = this.imgList[i].src;
            img.setAttribute('alt', i)
            div.appendChild(img);
            fragment.appendChild(div);
        }
        this.sliderNavigation.style.gridTemplateColumns = 'repeat(' + this.imgList.length +', 1fr)';
        this.sliderNavigation.appendChild(fragment);
        this.navButtons = Array.from(this.slider.querySelectorAll(".nav-button"));
    }
    setupSlider() {
        this.showSlide(this.currentSlideIndex);
    }
    showSlide(index) {
        this.currentSlideIndex = index;
        const navButtonImg = this.navButtons[
            this.currentSlideIndex
        ].querySelector("img");
        if (navButtonImg) {
            const imgClone = navButtonImg.cloneNode();
            this.display.replaceChildren(imgClone);
            this.content.innerText = this.imgList[index].content
        }
        this.updateNavButtons();
    }
    updateNavButtons() {
        this.navButtons.forEach((button, buttonIndex) => {
            const isSelected = buttonIndex === this.currentSlideIndex;
            button.setAttribute("aria-selected", isSelected);
            if (isSelected) button.focus();
        });
    }
    preloadImages() {
        this.navButtons.forEach((button) => {
            const imgElement = button.querySelector("img");
            if (imgElement) {
                const imgSrc = imgElement.src;
                if (!this.preloadedImages[imgSrc]) {
                    this.preloadedImages[imgSrc] = new Image();
                    this.preloadedImages[imgSrc].src = imgSrc;
                }
            }
        });
    }
    eventListeners() {
        // document.addEventListener("keydown", (event) => {
        //     this.handleAction(event.key);
        // });
        this.sliderNavigation.addEventListener("click", (event) => {
            const targetButton = event.target.closest(".nav-button");
            const index = targetButton
                ? this.navButtons.indexOf(targetButton)
                : -1;
            if (index !== -1) {
                this.showSlide(index);
            }
        })
        this.prevButton.addEventListener("click", () =>
            this.handleAction("prev")
        );
        this.nextButton.addEventListener("click", () =>
            this.handleAction("next")
        );
    }
    handleAction(action) {
        if (action === "Home") {
            this.currentSlideIndex = 0;
        } else if (action === "End") {
            this.currentSlideIndex = this.navButtons.length - 1;
        } else if (action === "ArrowRight" || action === "next") {
            this.currentSlideIndex =
                (this.currentSlideIndex + 1) % this.navButtons.length;
        } else if (action === "ArrowLeft" || action === "prev") {
            this.currentSlideIndex =
                (this.currentSlideIndex - 1 + this.navButtons.length) %
                this.navButtons.length;
        }
        this.showSlide(this.currentSlideIndex);
    }
}