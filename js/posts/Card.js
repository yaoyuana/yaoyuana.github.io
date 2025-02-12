// 生成一个卡片播放器
class Card {
    constructor(card, imgList) {
        this.card = card;
        this.imgList = imgList
        this.count = imgList.length
        this.activeActivity = imgList.length ? 1 : 0
        this.showCount = this.card.querySelector('.activities-count')
        this.prevButton = this.card.querySelector(".prev-button");
        this.nextButton = this.card.querySelector(".next-button");
        this.initialize();
    }
    initialize() {
        this.drawImg();
        this.eventListeners();
    }
    drawImg() {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this.imgList.length; i++) {
            const activityDiv = document.createElement('div');
            const imgDiv = document.createElement('div');
            const textDiv = document.createElement('div');
            const img = document.createElement('img');
            const h3 = document.createElement('h3');
            const p = document.createElement('p');
            activityDiv.className = i === 0 ? 'activity active' : 'activity' // 默认选中第一个
            imgDiv.className = 'img'
            textDiv.className = 'text'
            img.src = this.imgList[i].src;

            h3.innerText = this.imgList[i].title
            p.innerText = this.imgList[i].content
            imgDiv.appendChild(img);
            textDiv.appendChild(h3);
            textDiv.appendChild(p);

            activityDiv.appendChild(imgDiv);
            activityDiv.appendChild(textDiv);
            fragment.appendChild(activityDiv);
        }
        this.card.appendChild(fragment);
        this.allActivities = this.card.querySelectorAll(".activity"); // 所有imgDiv
    }
    eventListeners() {
        this.prevButton.addEventListener("click", () =>
            this.handleAction("prev")
        );
        this.nextButton.addEventListener("click", () =>
            this.handleAction("next")
        );
    }
    handleAction(action) {
        if (action === "next") {
            this.activeActivity =
                (this.activeActivity + 1) % this.count;
        } else if (action === "prev") {
            this.activeActivity =
                (this.activeActivity - 1 + this.count) %
                this.count;
        }
        this.showSlide(this.activeActivity);
    }
    showSlide(index) {
        this.activeActivity = index;

        this.allActivities.forEach((activity, i) => {
            activity.classList.remove("active");
        });
        this.showCount.innerText = this.activeActivity + '/' + this.count
        this.allActivities[index].classList.add("active");
        this.card.classList.add("children-animating");
        this.card.addEventListener(
            "animationend",
            () => {
                this.card.classList.remove("children-animating");
            },
            { once: true }
        );
    }
}
