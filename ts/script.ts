interface SettingData {
    index: number;
    ratios: number;
}

interface Params {
    index: number;
    angle: number;
    animateTo: number;
    duration: number;
    animateStartAngle: number;
    animateStartTime?: number;
    ratios: SettingData;
}

const errorList = [];
let ratiosList = [];
let stopTest = false;

let actualTime
let edited = true;
function initRotate(params: Params): void {
    params.animateStartTime = new Date().getTime();
    actualTime = params.animateStartTime;
    rotate(params, 0);
}

function rotate(params: Params, prevAngle: number): void {
    if (stopTest) return;
    actualTime += 10;
    const angle = Math.round(easing(0, actualTime - params.animateStartTime, params.animateStartAngle, params.animateTo - params.animateStartAngle, params.duration) * 10) / 10;
    // params.ele.style[supportedCSS] = `rotate(${angle % 360}deg)`;
    if (prevAngle > angle) {
        errorList.push({
            index: params.index,
            ratios: params.ratios
        });
        // TODO: 進這裡代表逆轉
    } else if (angle >= params.animateTo) {
        console.log('成功', {
            index: params.index,
            ratios: params.ratios
        });
    } else {
        rotate(params, angle);
    }
}

function easing(x, t, b, c, d): number {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}

function rotateFn(randomN: number): void {
    const deg = 360 / 100; // 每1%的角度
    const totalRatio = ratiosList.reduce((total, num) => {
        return total + num;
    });
    let heapRatio = 0;
    for (let i = 0; i < randomN; i++) {
        heapRatio += ratiosList[i];
    }

    // let angles = item * (360 / turnplate.names.length) - (360 / (turnplate.names.length * 2));
    let angles = (heapRatio + ratiosList[randomN] / 2) / totalRatio * 100 * deg;
    if (angles < 270) {
        angles = 270 - angles;
    } else {
        angles = 360 - angles + 270;
    }

    initRotate({
        index: randomN,
        angle: 0,
        animateStartAngle: 0,
        animateTo: angles + 3600,
        duration: 8000,
        ratios: ratiosList[randomN]
    });
}


// 操作部分
const inputDOM = document.querySelector('#input');
const btnDOM = document.querySelector('#btn');
const listDOM = document.querySelector('#list');
const ratiosDOM = document.querySelector('#ratios');

let setTimeoutEvent = null;
inputDOM.addEventListener('input', (e: InputEvent) => {
    edited = false;
    if (setTimeoutEvent) {
        clearTimeout(setTimeoutEvent);
    }
    setTimeoutEvent = setTimeout(() => {
        let inputValue = +(e.target as HTMLInputElement).value;
        const oldRatiosList = [...ratiosList];
        ratiosList = [];
        ratiosDOM.innerHTML = '';
        if (!inputValue) {
            edited = true;
            return;
        }
        inputValue = Math.max(Math.min(inputValue, 100), 1);
        (e.target as HTMLInputElement).value = inputValue + '';
        
        if (oldRatiosList.length <= inputValue) {
            ratiosList = [...oldRatiosList]
            inputValue = inputValue - oldRatiosList.length;
            while (inputValue--) {
                ratiosList.push(1);
            }
        } else {
            oldRatiosList.length = inputValue;
            ratiosList = [...oldRatiosList];
        }
        ratiosList.forEach((r, i) => {
            const div = document.createElement('div');
            const input = document.createElement('input');
            input.setAttribute('data-index', i + '');
            input.setAttribute('type', 'number');
            // input.setAttribute('min', '1');
            // input.setAttribute('max', '10');
            input.value = r;
            let innerSetTimeoutEvent = null;
            input.addEventListener('input', (e) => {
                let ratiosValue = +(e.target as HTMLInputElement).value;
                ratiosValue = Math.max(Math.min(ratiosValue, 10), 1);
                edited = false;
                if (innerSetTimeoutEvent) {
                    clearTimeout(innerSetTimeoutEvent);
                }
                innerSetTimeoutEvent = setTimeout(() => {
                    if (ratiosValue) {
                        ratiosList[i] = ratiosValue;
                    }
                    (e.target as HTMLInputElement).value = ratiosValue + '';
                    edited = true;
                }, 500);
            });
            div.textContent = `${i + 1}：`;
            div.appendChild(input);
            ratiosDOM.appendChild(div);
        });
        edited = true;
    }, 500);
});

let isTexting = false;

let clickTimeout = null;

function clickFn() {
    listDOM.innerHTML= '計算中...';
    if (clickTimeout) {
        clearTimeout(clickTimeout);
    }
    if (!edited) {
        clickTimeout = setTimeout(() => {
            clickFn();
        }, 50);
        return;
    }
    
    console.clear();
    listDOM.innerHTML = '';
    errorList.length = 0;
    if (isTexting || !ratiosList.length) {
        listDOM.innerHTML = '請輸入有效數字';
        return;
    }
    isTexting = true;
    ratiosList.forEach((_, i) => {
        rotateFn(i);
    });
    
    if (!errorList.length) {
        const div = document.createElement('div');
        div.textContent = `此獎項數量與比例可安心使用`;
        listDOM.appendChild(div);
    } else {
        errorList.forEach(data => {
            const div = document.createElement('div');
            div.textContent = `第 ${data.index + 1} 個，比例為 ${data.ratios}`
            listDOM.appendChild(div);
        });
    }
    isTexting = false;
}


btnDOM.addEventListener('click', () => {
    clickFn();
});