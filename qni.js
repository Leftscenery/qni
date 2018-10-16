/*
 * VERSION: 1.0.0
 * RELEASE: 2018
 *
 * @author: Jiawei Zhou, leftscenery@gmail.com
 */

~function () {
    //new Qni('ele',200,{left:xxx,right:xxx,ease:'linear'},{onStart:fn,onComplete:fn,offset:50,delay:100})
    class Qni {
        constructor(ele, duration, animation = {}, opts = {}) {
            this.ele = Qtool.getEle(ele);
            this.duration = duration;
            this.offset = opts.offset || 0;
            this.delay = opts.delay || 0;
            this.event = {
                onStart: opts.onStart,
                onComplete: opts.onComplete
            };
            this.state = 'init';
            this.startTime = this.offset + this.delay;
            this.endTime = duration + this.startTime;
            //all state are Qttr instance
            this.endState = new Qttr(animation);
            this.startState = Qtool.makeInitState(this.ele.preState ? this.ele.preState : {}, this.endState, this.ele);
        }

        //Quick animation, use self timer
        //Set Attr
        static from(ele, init = {}) {
            let target = Qtool.getEle(ele);
            target.preState = new Qttr(init);
            Qtool.css(target, target.preState.toReal());
            return Qni
        }

        //Run Animation
        //Qni.to(ele,200,{left:200},{delay:200,onStart:fn,onComplete:fn})
        static to(ele, duration, animation, opts = {}) {
            let target = Qtool.getEle(ele);
            let timer = null;
            let count = 0;
            let endState = new Qttr(animation);
            let startState = Qtool.makeInitState(target.preState ? target.preState : {}, endState, target);
            let event = {
                onStart: opts.onStart,
                onComplete: opts.onComplete
            };
            count = -opts.delay || 0;
            opts.onStart && opts.onStart();
            timer = setInterval(() => {
                if (count >= 0) {
                    if (count >= duration) {
                        clearInterval(timer);
                        Qtool.css(target, endState.toReal());
                        target.preState = endState;
                        opts.onComplete && opts.onComplete();
                    } else {
                        count += 10;
                        Qtool.css(target, Qtool.calculateNext(startState, endState, duration, count, endState.ease).toReal());
                    }
                } else {
                    count += 10;
                }
            }, 10);
        }
    }

    //Qni Attr, used for
    Qni.test = 1;

    //Qttr format
    class Qttr {
        //After instance was created, the unit already polished
        constructor(opts = {}) {
            let animatedAttr = ['left','right','top','bottom','opacity','color','backgroundColor','scale','scaleX','scaleY','translate','translateX','translateY','rotate','skew','ease'];

            //regular
            this.general = {
                left: opts.left ? Qtool.checkValuePx(opts.left) : opts.left,
                right: opts.right ? Qtool.checkValuePx(opts.right) : opts.right,
                top: opts.top ? Qtool.checkValuePx(opts.top) : opts.top,
                bottom: opts.bottom ? Qtool.checkValuePx(opts.bottom) : opts.bottom,
                opacity: opts.opacity,
            };
            this.color = {
                color: opts.color ? Qtool.anyToRgba(opts.color) : opts.color,
                backgroundColor: opts.backgroundColor ? Qtool.anyToRgba(opts.backgroundColor) : opts.backgroundColor
            };
            //Transform group
            this.transform = {
                scale: opts.scale,
                scaleX: opts.scaleX,
                scaleY: opts.scaleY,
                translate: opts.translate ? `(${Qtool.checkValuePx(Qtool.translateToXY(opts.translate).translateX)},${Qtool.checkValuePx(Qtool.translateToXY(opts.translate).translateY)})` : opts.translate,
                translateX: opts.translateX ? Qtool.checkValuePx(opts.translateX) : opts.translateX,
                translateY: opts.translateY ? Qtool.checkValuePx(opts.translateY) : opts.translateY,
                rotate: opts.rotate,
                skew: opts.skew
            };
            //Add other attr to static group
            for(let key in opts){
                if(!animatedAttr.includes(key)){
                    this.static[key]=opts[key];
                }
            }
            this.ease = opts.ease || 0;
        }

        //convert Qttr ToReal without any unit transition
        toReal() {
            let result = {};
            let transform = '';
            //general group
            for (let key in this.general) {
                if (this.general[key]) result[key] = this.general[key];
            }
            //Color group
            for (let key in this.color) {
                if (this.color[key]) result[key] = this.color[key];
            }
            //Transform group
            for (let key in this.transform) {
                if (this.transform[key]) {
                    //Deal with translate
                    switch (key) {
                        case 'translate':
                            let value = Qtool.translateToXY(this.transform[key]);
                            transform += ` ${'translateX'}(${Qtool.checkValuePx(value.translateX)}) ${'translateY'}(${Qtool.checkValuePx(value.translateY)})`;
                            break;
                        case 'translateX':
                            transform += ` ${'translateX'}(${Qtool.checkValuePx(this.transform[key])})`;
                            break;
                        case 'translateY':
                            transform += ` ${'translateY'}(${Qtool.checkValuePx(this.transform[key])})`;
                            break;
                        default:
                            transform += ` ${key}(${this.transform[key]})`
                    }
                }
            }
            //Default group
            for (let key in this.static) {
                if (this.static[key]) result[key] = this.static[key];
            }
            if (transform.trim().length > 0) {
                result['transform'] = transform.trim();
            }
            return result
        }
    }

    //Line control
    class Qline {
        constructor(opts = {}) {
            this.duration = opts.duration || 0;
            this.event = {
                onStart: opts.onStart,
                onComplete: opts.onComplete
            };
            this.delay = opts.delay;
            this.timer = null;
            this.renderList = [];
            this.Qnis = [];
            this.count = -this.delay || 0;
        }

        from(ele, init = {}) {
            let target;
            if(ele instanceof Array){
                ele.forEach(item=>{
                    target = Qtool.getEle(item);
                    target.preState = new Qttr(init);
                })
            }else{
                target = Qtool.getEle(ele);
                target.preState = new Qttr(init);
            }
            return this
        }

        add(ele, duration, animation = {}, opts = {}) {
            let newQni = new Qni(ele, duration, animation, opts);
            if (ele instanceof Array){
                ele.forEach(item=>{
                    newQni = new Qni(item, duration, animation, opts);
                    this.Qnis.push(newQni);
                })
            }else{
                newQni = new Qni(ele, duration, animation, opts);
                this.Qnis.push(newQni);
            }
            return this
        }

        start() {
            this._shuffleQnis();
            this._startAnimate();
            return this
        }

        pause(){
            this.timer=null;
            return this
        }

        continue(){
            this._timerStart();
            return this
        }

        parallel() {
            this._alignQnis();
            this._startAnimate();
            return this
        }

        //Tools
        //calculate duration time and sort, for line mode
        _shuffleQnis() {
            this.Qnis[0].state = 'ready';
            for (let i = 0; i < this.Qnis.length; i++) {
                let item = this.Qnis[i];
                if(i !== 0){
                    item.startTime += this.Qnis[i-1].endTime;
                    item.endTime = item.startTime+item.duration;
                }
                //preset
                Qtool.css(item.ele,item.ele.preState);
                item.state = 'ready';
            }
            this.Qnis.sort((a,b)=>{return (a.startTime-b.startTime)>0})
        }

        _alignQnis(){
            this.Qnis.forEach(item=>item.state='ready');
            this.Qnis.sort((a,b)=>{return (a.startTime-b.startTime)>0})
        }

        _startAnimate(){
            this.duration = this.Qnis.reduce((prev,curr)=>{
                if(curr.endTime>prev){
                    prev=curr.endTime
                }
                return prev
            },0);
            this.event.onStart && this.event.onStart();
            this._timerStart();
        }

        _timerStart(){
            this.timer = setInterval(()=>{
                if (this.count >= 0) {
                    if (this.count >= this.duration) {
                        clearInterval(this.timer);
                        this.renderList.forEach(item=>{
                            item.state = 'done';
                            Qtool.css(item.ele,item.endState.toReal());
                            item.ele.preState = item.endState;
                            this.event.onComplete && this.event.onComplete();
                        });
                        this.renderList=[];
                        this.event.onComplete && this.event.onComplete();
                    } else {
                        //prepare renderList
                        this.Qnis.filter(item=>{
                            if(item.startTime<=this.count && item.state=='ready'){
                                item.state = 'playing';
                                this.renderList.push(item);
                                item.startState=Qtool.makeInitState(item.ele.preState ? item.ele.preState : {}, item.endState, item.ele);
                                item.event.onStart && item.event.onStart();
                            }else if(item.endTime<=this.count && item.state == 'playing'){
                                item.state = 'done';
                                Qtool.css(item.ele,item.endState.toReal());
                                item.ele.preState = item.endState;
                                this.renderList.splice(this.renderList.indexOf(item),1);
                                item.event.onComplete && item.event.onComplete();
                            }
                        });
                        //play renderList
                        this.renderList.forEach(item=>{
                            Qtool.css(item.ele, Qtool.calculateNext(item.startState, item.endState, item.duration, this.count-item.startTime, item.endState.ease).toReal());
                        })
                    }
                    this.count += 5;
                } else {
                    this.count += 5;
                }
            },5)
        }
    }

    //Tool for inner use
    Qtool = {
        //----------------------GENERAL GROUP----------------------
        getEle(ele) {
            if (typeof ele == 'string') {
                return window.document.querySelector(ele);
            } else {
                return ele;
            }
        },

        easeValue(ease, count, beginValue, different, duration) {
            // default transition
            let tempEffect = Qease.Linear;
            //define ease
            if (typeof ease === "number") {
                switch (ease) {
                    case 0:
                        tempEffect = Qease.Linear;
                        break;
                    case 1:
                        tempEffect = Qease.Quad.easeInOut;
                        break;
                    case 2:
                        tempEffect = Qease.Quad.easeIn;
                        break;
                    case 3:
                        tempEffect = Qease.Quad.easeOut;
                        break;
                }
            } else if (ease instanceof Array) {
                //custom trans ['Quad','easeInOut']
                tempEffect = ease.length === 2 ? Qease[ease[0]][ease[1]] : Qease[ease[0]];
            }
            return Number(tempEffect(Number(count), Number(beginValue), Number(different), Number(duration))).toFixed(2)
        },

        easeColor(ease, count, duration, beginColor, finalColor) {
            let beginResult = beginColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})(?:, ?(\d(?:\.\d?)?)\))?/);
            let endResult = finalColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})(?:, ?(\d(?:\.\d?)?)\))?/);
            return `
            rgba(
            ${Qtool.easeValue(ease, count, beginResult[1], endResult[1] - beginResult[1], duration)},
            ${Qtool.easeValue(ease, count, beginResult[2], endResult[2] - beginResult[2], duration)},
            ${Qtool.easeValue(ease, count, beginResult[3], endResult[3] - beginResult[3], duration)},
            ${Qtool.easeValue(ease, count, beginResult[4], endResult[4] - beginResult[4], duration)}
            )
            `
        },

        //----------------------COLOR GROUP----------------------
        anyToRgba(str) {
            let arr = [];
            if (str.search('#') >= 0) {
                let match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str);
                arr = [Number('0x' + match[1]), Number('0x' + match[2]), Number('0x' + match[3])];
                arr.push(1);
            } else {
                let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                arr = [match[1], match[2], match[3]];
                if (match[4]) {
                    arr.push(match[4]);
                } else {
                    arr.push(1)
                }
            }
            return `rgba(${arr[0]},${arr[1]},${arr[2]},${arr[3]})`
        },

        //----------------------UNIT GROUP----------------------
        //check unit, if not add px
        checkValuePx(str) {
            if (!isNaN(str)) {
                return str + 'px'
            }
            return str
        },

        translateToXY(str) {
            str = str.replace(' ', '').match(/^\((.+)\)$/)[1].split(',');
            return {
                translateX: str[0],
                translateY: str[1]
            }
        },

        getUnit(value) {
            const reg = /^([+-]?(\d|[1-9]\d+)(\.\d+)?)(px|pt|rem|em|vh|vw|%|deg|rad)?$/;
            let unit = reg.exec(value);
            unit = unit[unit.length - 1] ? unit[unit.length - 1] : '';
            return unit
        },

        getValue(value) {
            const reg = /^([+-]?(\d|[1-9]\d+)(\.\d+)?)(px|pt|rem|em|vh|vw|%|deg|rad)?$/;
            let result = reg.exec(value);
            return result[1]
        },

        //convert unit any unit
        unitRoster(origin, unit, ele, key) {
            let result;
            if (key == 'translateX' || key == 'translateY') {
                result = key == 'translateX' ? Qtool.getMatrixXY(ele).x : Qtool.getMatrixXY(ele).y;
            } else {
                result = Qtool.css(ele, key);
            }
            //special %
            switch (unit) {
                case 'em':
                    result = Qtool._pxToEm(parseFloat(result), ele) + 'em';
                    break;
                case 'rem':
                    result = Qtool._pxToRem(parseFloat(result)) + 'rem';
                    break;
                case 'pt':
                    result = Qtool._pxToPt(parseFloat(result)) + 'pt';
                    break;
                case 'vh':
                    result = Qtool._pxToVh(parseFloat(result)) + 'vh';
                    break;
                case 'vw':
                    result = Qtool._pxToVw(parseFloat(result)) + 'vw';
                    break;
                case 'px':
                    result = parseFloat(result) + 'px';
                    break;
                case '%':
                    result = Qtool._pxToPercent(ele, origin, result, key) + '%';
                    break;
            }
            return result;
        },

        //transition tools
        _pxToRem(value) {
            let defaultFont = parseFloat(window.getComputedStyle(document.body)['fontSize']);
            return value / defaultFont.toFixed(2);
        },
        _pxToPt(value) {
            return 3 / 4 * value;
        },
        _pxToEm(value, target) {
            let defaultFont = parseFloat(window.getComputedStyle(target.parentNode)['fontSize']);
            return value / defaultFont.toFixed(2);
        },
        _pxToVh(value) {
            let total = parseFloat(window.innerHeight);
            return value / total.toFixed(2);
        },
        _pxToVw(value) {
            let total = parseFloat(window.innerWidth);
            return value / total.toFixed(2);
        },
        //percent need to find the relative parent.
        _pxToPercent(ele, origin, result, key) {
            if (Qtool.getUnit(origin) == '%') {
                return parseFloat(origin)
            } else {
                let parent;
                //find real parent
                if (Qtool.css(ele, 'position') == 'absolute') {
                    parent = ele.parentNode;
                    while (parent != document.body && Qtool.css(parent, 'position') != 'relative') {
                        parent = parent.parentNode;
                    }
                } else if (Qtool.css(ele, 'position') == 'relative' || Qtool.css(ele, 'position') == 'static') {
                    parent = ele.parentNode;
                    while (parent != document.body && Qtool.css(parent, 'position') != 'absolute') {
                        parent = parent.parentNode;
                    }
                } else {
                    return '0'
                }
                switch (key) {
                    case 'left':
                    case 'right':
                        if(parent.clientWidth==0){
                            return parseFloat(result / window.outerWidth).toFixed(2)*100;
                        }
                        return parseFloat(result / parent.clientWidth).toFixed(2)*100;
                        break;
                    case 'top':
                    case 'bottom':
                        if(parent.clientHeight==0){
                            return parseFloat(result / window.outerHeight).toFixed(2)*100;
                        }
                        return parseFloat(result / parent.clientHeight).toFixed(2)*100;
                        break;
                    case 'translateX':
                        return parseFloat(result / ele.clientWidth).toFixed(2);
                    case 'translateY':
                        return parseFloat(result / ele.clientHeight).toFixed(2);
                    default:
                        break;
                }
            }
        },

        //----------------------STATE GROUP----------------------
        //use destination to make a new state
        makeInitState(preSet, reference, ele) {
            let initState = new Qttr({});
            if (reference.general) {
                for (let key in reference.general) {
                    if (reference.general[key]||reference.general[key]===0) {
                        if (preSet != {} && preSet.general && preSet.general[key] != undefined) {
                            //if preSet has value
                            initState.general[key] = Qtool.unitRoster(preSet.general[key], Qtool.getUnit(reference.general[key]), ele, key)
                        } else {
                            //if preSet don't has value
                            initState.general[key] = Qtool.unitRoster(Qtool.css(ele, key), Qtool.getUnit(reference.general[key]), ele, key)
                        }
                    }
                }
            }
            for (let key in reference.color) {
                if (reference.color[key]) {
                    initState.color[key] = Qtool.anyToRgba(Qtool.css(ele, key));
                }
            }
            for (let key in reference.transform) {
                if (reference.transform[key]||reference.transform[key]===0) {
                    if (preSet != {} && preSet.transform && preSet.transform[key] != undefined) {
                        if (key == 'translateX' || key == 'translateY') {
                            initState.transform[key] = Qtool.unitRoster(preSet.transform[key], Qtool.getUnit(reference.transform[key]), ele, key)
                        } else {
                            initState.transform[key] = preSet.transform[key];
                        }
                    } else {
                        //if preSet don't has value
                        switch (key) {
                            case 'translateX':
                                initState.transform['translateX'] = Qtool.getMatrixXY(ele).x + 'px';
                                break;
                            case 'translateY':
                                initState.transform['translateY'] = Qtool.getMatrixXY(ele).y + 'px';
                                break;
                            case 'scale':
                            case 'scaleX':
                            case 'scaleY':
                                initState.transform[key] = 1;
                                break;
                            case 'rotate':
                                initState.transform[key] = '0deg';
                                break;
                            case 'skew':
                                initState.transform[key] = 0;
                                break;
                        }
                    }
                }
            }
            return initState
        },

        //return Qttr
        calculateNext(beginState, endState, total, count, ease) {
            let str = '';
            let result = new Qttr({});
            for (let key in beginState.general) {
                if (beginState.general[key]) {
                    result.general[key] = Qtool.easeValue(ease, count, Qtool.getValue(beginState.general[key]), Qtool.getValue(endState.general[key]) - Qtool.getValue(beginState.general[key]), total) + Qtool.getUnit(beginState.general[key]);
                }
            }
            for (let key in beginState.color) {
                if (beginState.color[key]) {
                    result.color[key] = Qtool.easeColor(ease, count, total, beginState.color[key], endState.color[key]);
                }
            }
            for (let key in beginState.transform) {
                if (beginState.transform[key]) {
                    result.transform[key] = Qtool.easeValue(ease, count, Qtool.getValue(beginState.transform[key]), Qtool.getValue(endState.transform[key]) - Qtool.getValue(beginState.transform[key]), total) + Qtool.getUnit(beginState.transform[key]);
                }
            }
            return result
        },

        //----------------------TRANSFORM GROUP----------------------
        getMatrixXY(ele) {
            //get current value
            let reg = /\((.+)\)/g;
            reg = reg.exec(getComputedStyle(ele)['transform'])[1].split(', ');
            let valueX = reg[4];
            let valueY = reg[5];
            return {x: valueX, y: valueY}
        },

        //----------------------CSS GROUP----------------------
        //get css attribute
        getCss(target, attr) {
            let val = null;
            let reg = null;
            let curEle = target;
            if ("getComputedStyle" in window) {
                val = window.getComputedStyle(curEle)[attr];//
            } else {
                if (attr === "opacity") {
                    val = curEle.currentStyle["filter"];//alpha(opacity=50)
                    reg = /^alpha\(opacity=((?:\d|(?:[1-9]\d+))(?:\.\d+)?)\)$/;
                    let temp = reg.exec(val)[1];
                    val = temp ? temp / 100 : 1;
                    val = parseFloat(val);
                } else {
                    val = curEle.currentStyle[attr];
                }
            }
            //val = isNaN(parseFloat(val)) ? val : parseFloat(val);
            let reg1 = /^([+-]?(\d|[1-9]\d+)(\.\d+)?)(px|pt|rem|em|vh|vw|%)?$/;
            val = reg1.test(val) ? parseFloat(val) : val;// parseFloat trim unit
            return val;
        },

        //set css single attribute
        setCss(target, attr, value) {
            let curEle = target;
            if (attr === "opacity") {
                curEle.style["opacity"] = value;
                // IE opacity support
                curEle.style["filter"] = "alpha(opacity=" + value * 100 + ")";
            }
            ;
            if (attr === "float") {
                //IE float setting
                curEle.style["cssFloat"] = value;
                curEle.style["styleFloat"] = value;
            }
            // if below attribute, add unit
            let reg = /^width|height|top|left|bottom|right|((margin|padding)(Top|Bottom|Left|Right)?)$/;
            if (reg.test(attr)) {
                // if not has unit, add unit.
                if (!isNaN(value)) {
                    value += "px";
                }
            }
            curEle.style[attr] = value;
        },

        //group set css
        setGroupCss(target, options) {
            for (let attr in options) {// loop each attr
                Qtool.setCss(target, attr, options[attr])
            }
        },

        // combine getCss、setCss、setGroupCss
        // css(curEle,"width","100px")
        css() {
            let len = arguments.length,
                target = null,
                attr = null,
                value = null,
                options = null;
            if (len === 3) {
                target = arguments[0];
                attr = arguments[1];
                value = arguments[2];
                Qtool.setCss(target, attr, value);
                return;
            }
            if (len === 2 && typeof arguments[1] === "object") {
                target = arguments[0];
                options = arguments[1];
                Qtool.setGroupCss(target, options);
                return;
            }
            target = arguments[0];
            attr = arguments[1];
            return Qtool.getCss(target, attr);
        }
    };

    //ease math
    Qease = {
        Linear: function (t, b, c, d) {
            return t / d * c + b;
        },
        Bounce: {
            easeIn: function (t, b, c, d) {
                return c - Qease.Bounce.easeOut(d - t, 0, c, d) + b;
            },
            easeOut: function (t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOut: function (t, b, c, d) {
                if (t < d / 2) {
                    return Qease.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                }
                return Qease.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        },
        Quad: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        },
        Cubic: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t + b;
                }
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        },
        Quart: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t * t + b;
                }
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            }
        },
        Quint: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t * t * t + b;
                }
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            }
        },
        Sine: {
            easeIn: function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOut: function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            }
        },
        Expo: {
            easeIn: function (t, b, c, d) {
                return (t == 0)
                    ? b
                    : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOut: function (t, b, c, d) {
                return (t == d)
                    ? b + c
                    : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if (t == 0)
                    return b;
                if (t == d)
                    return b + c;
                if ((t /= d / 2) < 1)
                    return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        },
        Circ: {
            easeIn: function (t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                }
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            }
        },
        Back: {
            easeIn: function (t, b, c, d, s) {
                if (s == undefined)
                    s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut: function (t, b, c, d, s) {
                if (s == undefined)
                    s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut: function (t, b, c, d, s) {
                if (s == undefined)
                    s = 1.70158;
                if ((t /= d / 2) < 1) {
                    return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                }
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            }
        },
        Elastic: {
            easeIn: function (t, b, c, d, a, p) {
                if (t == 0)
                    return b;
                if ((t /= d) == 1)
                    return b + c;
                if (!p)
                    p = d * .3;
                var s;
                !a || a < Math.abs(c)
                    ? (a = c, s = p / 4)
                    : s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOut: function (t, b, c, d, a, p) {
                if (t == 0)
                    return b;
                if ((t /= d) == 1)
                    return b + c;
                if (!p)
                    p = d * .3;
                var s;
                !a || a < Math.abs(c)
                    ? (a = c, s = p / 4)
                    : s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOut: function (t, b, c, d, a, p) {
                if (t == 0)
                    return b;
                if ((t /= d / 2) == 2)
                    return b + c;
                if (!p)
                    p = d * (.3 * 1.5);
                var s;
                !a || a < Math.abs(c)
                    ? (a = c, s = p / 4)
                    : s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1)
                    return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            }
        }
    };

    window.Qline = Qline;
    window.Qni = Qni
}();