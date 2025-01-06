import { lrc } from './data.js';

const doms = {
    ul: document.querySelector('ul'),
    audio: document.querySelector('audio'),
    lis: [],
};

let liHeight; //歌词li的高度

let parseLrcArr; //解析后的歌词数组

//解析歌词
const parseLrcToArr = () => {
    return lrc
        .split('\n')
        .map((i) => {
            return i.split(']');
        })
        .map((i, idx) => {
            return {
                idx,
                time: formatTimeToSeconds(i[0].replace('[', '')),
                content: i[1],
            };
        });
};

//初始化页面
const initLrcElement = () => {
    const frg = document.createDocumentFragment();
    parseLrcArr.forEach((i) => {
        const li = document.createElement('li');
        li.innerText = i.content;
        li.setAttribute('data-idx', i.idx);
        frg.appendChild(li);
    });
    doms.ul.appendChild(frg);
    doms.lis = document.querySelectorAll('li');
    liHeight = doms.lis[0].clientHeight;
};

//获取音频当前播放时间
const getAudioCurrentTime = () => {
    return doms.audio.currentTime;
};

//获取当前歌词下标
const getCurrentLrcIndex = () => {
    const idx = parseLrcArr.findIndex((i) => {
        return getAudioCurrentTime() <= i.time;
    });
    if (idx >= parseLrcArr.length - 1) {
        return parseLrcArr.length - 2;
    }
    return idx - 1;
};

//设置对应下标li的active
const setActive = (idx) => {
    const activeLi = document.querySelector('.active');
    if (activeLi) {
        activeLi.classList.remove('active');
    }
    doms.lis[idx].classList.add('active');
};

//获取偏移量
const getOffset = () => {
    return getCurrentLrcIndex() * liHeight;
};

//设置偏移量
const setOffset = (offset) => {
    //最大偏移量
    const maxOffset = document.querySelector('ul').clientHeight - document.querySelector('.container').clientHeight;
    const calcOffset = offset > maxOffset ? maxOffset : offset - liHeight / 2;
    doms.ul.style.transform = `translateY(-${calcOffset}px)`;
};

//格式化数字时间为秒数   00:00:00 => 0
const formatTimeToSeconds = (time) => {
    const timeArr = time.split(':');
    return +timeArr[0] * 60 + +timeArr[1];
};

//事件聚合
const event = () => {
    setOffset(getOffset());
    setActive(getCurrentLrcIndex());
};

//li的点击事件
const lrcClick = (event) => {
    const idx = +event.target.attributes['data-idx'].value + 1;
    doms.audio.currentTime = parseLrcArr[idx].time;
};

parseLrcArr = parseLrcToArr();

initLrcElement();

doms.audio.addEventListener('timeupdate', event);

doms.ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        lrcClick(e);
    }
});
