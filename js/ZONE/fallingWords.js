
/**
 * Matter是一个开源的JavaScript物理引擎库，可以帮助开发者实现基于物理引擎的动画和交互效果。Matter提供了丰富的API，各种物理参数可以轻松配置，例如重力、摩擦力、弹簧等。开发者可以使用Matter实现物理运动、碰撞检测、拖拽等效果，帮助开发者节省大量时间和精力。Matter适用于在Web浏览器中创建交互式的游戏、模拟和动画。
 */
const textNode = document.querySelector("#text");
const abstract = document.querySelector("#abstract");
const splitWords = () => {
    const text = textNode.textContent;
    const newDomElements = text.split(" ").map((text) => {
        const highlighted =
        text.startsWith(`"前"`) ||
        text.startsWith(`软`) ||
        text.startsWith(`姚`);
        return `<span class="word ${
        highlighted ? "highlighted" : null
        }">${text}</span>`;
    });
    textNode.innerHTML = newDomElements.join("");
};

const renderCanvas = () => {
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Runner = Matter.Runner;
    const params = {
        isStatic: true,
        render: {
        fillStyle: "transparent"
        }
    };
    const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    const engine = Engine.create({});

    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
        ...canvasSize,
        background: "transparent",
        wireframes: false
        }
    });
    const floor = Bodies.rectangle(
        canvasSize.width / 2,
        canvasSize.height,
        canvasSize.width,
        50,
        params
    );
    const wall1 = Bodies.rectangle(
        0,
        canvasSize.height / 2,
        50,
        canvasSize.height,
        params
    );
    const wall2 = Bodies.rectangle(
        canvasSize.width,
        canvasSize.height / 2,
        50,
        canvasSize.height,
        params
    );
    const top = Bodies.rectangle(
        canvasSize.width / 2,
        0,
        canvasSize.width,
        50,
        params
    );
    const wordElements = document.querySelectorAll(".word");
    const wordBodies = [...wordElements].map((elemRef) => {
        const width = elemRef.offsetWidth;
        const height = elemRef.offsetHeight;

        return {
        body: Matter.Bodies.rectangle(canvasSize.width / 2, 0, width, height, {
            render: {
            fillStyle: "transparent"
            }
        }),
        elem: elemRef,
        render() {
            const { x, y } = this.body.position;
            this.elem.style.top = `${y - 20}px`;
            this.elem.style.left = `${x - width / 2}px`;
            this.elem.style.transform = `rotate(${this.body.angle}rad)`;
        }
        };
    });

    const mouse = Matter.Mouse.create(document.body);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
        }
    });
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    World.add(engine.world, [
        floor,
        ...wordBodies.map((box) => box.body),
        wall1,
        wall2,
        top,
        mouseConstraint
    ]);
    render.mouse = mouse;
    Runner.run(engine);
    Render.run(render);

    (function rerender() {
        wordBodies.forEach((element) => {
        element.render();
        });
        Matter.Engine.update(engine);
        requestAnimationFrame(rerender);
    })();
};

abstract.addEventListener("mouseover", (event) => {
    abstract.style.display = 'none'
    textNode.style.display = 'block'
    splitWords();
    renderCanvas();
});
// window.addEventListener("DOMContentLoaded", (event) => {
//     splitWords();
//     renderCanvas();
// });