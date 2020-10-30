var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var errorList = [];
var ratiosList = [];
var stopTest = false;
var actualTime;
var edited = true;
function initRotate(params) {
    params.animateStartTime = new Date().getTime();
    actualTime = params.animateStartTime;
    rotate(params, 0);
}
function rotate(params, prevAngle) {
    if (stopTest)
        return;
    actualTime += 10;
    var angle = Math.round(easing(0, actualTime - params.animateStartTime, params.animateStartAngle, params.animateTo - params.animateStartAngle, params.duration) * 10) / 10;
    // params.ele.style[supportedCSS] = `rotate(${angle % 360}deg)`;
    if (prevAngle > angle) {
        errorList.push({
            index: params.index,
            ratios: params.ratios
        });
        // TODO: 進這裡代表逆轉
    }
    else if (angle >= params.animateTo) {
        console.log('成功', {
            index: params.index,
            ratios: params.ratios
        });
    }
    else {
        rotate(params, angle);
    }
}
function easing(x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}
function rotateFn(randomN) {
    var deg = 360 / 100; // 每1%的角度
    var totalRatio = ratiosList.reduce(function (total, num) {
        return total + num;
    });
    var heapRatio = 0;
    for (var i = 0; i < randomN; i++) {
        heapRatio += ratiosList[i];
    }
    // let angles = item * (360 / turnplate.names.length) - (360 / (turnplate.names.length * 2));
    var angles = (heapRatio + ratiosList[randomN] / 2) / totalRatio * 100 * deg;
    if (angles < 270) {
        angles = 270 - angles;
    }
    else {
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
var inputDOM = document.querySelector('#input');
var btnDOM = document.querySelector('#btn');
var listDOM = document.querySelector('#list');
var ratiosDOM = document.querySelector('#ratios');
inputDOM.addEventListener('input', function (e) {
    var setTimeoutEvent = null;
    edited = false;
    if (setTimeoutEvent) {
        clearTimeout(setTimeoutEvent);
    }
    setTimeoutEvent = setTimeout(function () {
        var inputValue = +e.target.value;
        var oldRatiosList = __spreadArrays(ratiosList);
        ratiosList = [];
        ratiosDOM.innerHTML = '';
        if (!inputValue) {
            edited = true;
            return;
        }
        if (oldRatiosList.length <= inputValue) {
            ratiosList = __spreadArrays(oldRatiosList);
            inputValue = inputValue - oldRatiosList.length;
            while (inputValue--) {
                ratiosList.push(1);
            }
        }
        else {
            oldRatiosList.length = inputValue;
            ratiosList = __spreadArrays(oldRatiosList);
        }
        ratiosList.forEach(function (r, i) {
            var div = document.createElement('div');
            var input = document.createElement('input');
            input.setAttribute('data-index', i + '');
            input.setAttribute('type', 'number');
            // input.setAttribute('min', '1');
            // input.setAttribute('max', '10');
            input.value = r;
            var innerSetTimeoutEvent = null;
            input.addEventListener('input', function (e) {
                var ratiosValue = +e.target.value;
                ratiosValue = Math.max(Math.min(ratiosValue, 10), 1);
                edited = false;
                if (innerSetTimeoutEvent) {
                    clearTimeout(innerSetTimeoutEvent);
                }
                innerSetTimeoutEvent = setTimeout(function () {
                    if (ratiosValue) {
                        ratiosList[i] = ratiosValue;
                    }
                    e.target.value = ratiosValue + '';
                    edited = true;
                }, 500);
            });
            div.textContent = i + 1 + "\uFF1A";
            div.appendChild(input);
            ratiosDOM.appendChild(div);
        });
        edited = true;
    }, 500);
});
var isTexting = false;
var clickTimeout = null;
function clickFn() {
    if (clickTimeout) {
        clearTimeout(clickTimeout);
    }
    if (!edited) {
        clickTimeout = setTimeout(function () {
            clickFn();
        }, 50);
        return;
    }
    console.clear();
    listDOM.innerHTML = '';
    errorList.length = 0;
    if (isTexting && !ratiosList.length) {
        return;
    }
    isTexting = true;
    ratiosList.forEach(function (_, i) {
        rotateFn(i);
    });
    if (!errorList.length) {
        var div = document.createElement('div');
        div.textContent = "\u7121";
        listDOM.appendChild(div);
    }
    else {
        errorList.forEach(function (data) {
            var div = document.createElement('div');
            div.textContent = "\u7B2C " + (data.index + 1) + " \u500B\uFF0C\u6BD4\u4F8B\u70BA " + data.ratios;
            listDOM.appendChild(div);
        });
    }
    isTexting = false;
}
btnDOM.addEventListener('click', function () {
    clickFn();
});
//# sourceMappingURL=script.js.map