Qni_js
---

<br/>

Qni is a javascript quick animation plugin, support single animation and complex animation timeline with multiple ease mode.


---

#### Key Feature:
+ Quick setup
+ Two animation mode: **Qni** for single animation & **Qline** for complex animation timeline
+ Different animating order: quene, parallel
+ Full animation control: start, pause, continue
+ Callback supported: oncomplete, onstart 
+ 11 * 3 ease modes

<br/>

---

#### Quick Start:
+ Qni: Single animation
```javascript
Qni.to('#box1',500,{left:300,ease:1},{delay:300});
```

+ Qline : Animation timeline
```javascript
new Qline({delay:100})
        .add('#box',200,{top:50,ease:1})
        .add('#box',500,{top:'20%',ease:1})
        .add('#box',700,{left:'50%',ease:1},{oncomplete:{...},offset:50})
        .start()
```

<br/>

---

#### Qni: Single Animation
```javascript
Qni.from(ele,style)
   .to(ele,duration,style[,options?]);
```
> + **from (ele,style)**
>   + Set start state 
> <br>
> + **to (ele,duration,style[,options?])**
>   + Set final state

<br>

>+ **ele**
>   + Query selector
>   + Dom element
>   + Array for query selectors or dom elements
>+ **duration**: Animation duration, ms based
>+ **style**: Object, key-value `{left:100, top:'50%',ease:1}`
>   + style: styles support by Qni, using camel style
>   + ease mode('to' only): control the ease mode of animation
>+ **options**: other settings
>   + **onComplete**: function called once animation complete
>   + **onStart**: function called once animation start
>   + **delay**: delay animation, ms based

<br/>

---

#### Qline: Animation timeline
```javascript
new Qline(lineSetting)
        .from(ele,style),
        .add(ele,duration,style[,options?]),
        .add(ele,duration,style[,options?]),
        .start() / .parallel() / .pause() / .continue()
```
> + **from (ele,style)**
>   + Set start state 
> + **add (ele,duration,style[,options?])**
>   + Set final state
> + **start()**:
>   + animating by sequence
> + **parallel()**
>   + animating at same time
> + **pause()**
>   + pause animation
> + **continue()**
>   + after pause, continue animation

<br>

>+ **ele**
>   + Query selector
>   + Dom element
>   + Array for query selectors or dom elements
>+ **duration**: Animation duration, ms based
>+ **style**: required, key-value `{left:100, top:'50%',ease:1}`
>   + style: styles support by Qni, using camel style
>   + ease: ('add' only) control the ease mode of animation
>+ **options**: optional, key-value
>   + **onComplete**: function called once animation complete
>   + **onStart**: function called once animation start
>   + **delay**: delay animation, ms based
>   + **offset**: early call animation, ms based

<br/>

---

#### Ease
>**Express Default**
><br>
> `ease:0`
>+ 0: linear
>+ 1: Quad.easeInOut
>+ 2: Quad.easeIn
>+ 3: Quad.easeOut

<br>

>**Custom Ease**
><br>
> `ease:['Bounce']['easeIn']`
> + Bounce: easeIn / easeOut / easeInOut
> + Quad: easeIn / easeOut / easeInOut
> + Cubic: easeIn / easeOut / easeInOut
> + Quart: easeIn / easeOut / easeInOut
> + Quint: easeIn / easeOut / easeInOut
> + Sine: easeIn / easeOut / easeInOut
> + Expo: easeIn / easeOut / easeInOut
> + Circ: easeIn / easeOut / easeInOut
> + Back: easeIn / easeOut / easeInOut
> + Elastic: easeIn / easeOut / easeInOut

<br/>

---

#### Supported Style
+ left
+ right
+ top
+ bottom
+ opacity
+ color
+ backgroundColor
+ scale
+ scaleX
+ scaleY
+ translate
+ translateX
+ translateY
+ rotate
+ skew
+ transformOrigin

<br/>

---

#### Supported Unit
+ px
+ pt
+ rem
+ em
+ vh
+ vw
+ %
+ deg

<br/>

---

#### Notice
+ if rotate and skew's start value not equal with 0, they must be defined through from


<br/>

---



Feel free to let me know if there are any functions or parts need to be fixed :)
<br>By Jiawei Zhou 2018
