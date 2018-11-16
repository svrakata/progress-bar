// PROGRESS-BAR v.1

class ProgressBar {
    constructor(options) {
        this.defaults = {
            barHeight: 50,
            barColor: '#22ff88',
            sliderColor: '#44aa44',
            sliderWidth: 360,
            delayTime: 3000,
        };
        
        this.length = options.length;
        
        this.actionDelayTime = options.delayTime || this.defaults.delayTime;
        this.barHeight = options.barHeight || this.defaults.barHeight;
        this.barColor = options.barColor || this.defaults.barColor;
        this.sliderColor = options.sliderColor || this.defaults.sliderColor;

        // throw error if container is not specified
        this.container = document.getElementById(`${options.container}`);

        this.bar = {
            el: document.createElement('div'),
            boundaries: null,
        };

        this.slider = {
            el: document.createElement('div'),
            clear: null,
            boundaries: null,
            moveHandler: this.moveSlider.bind(this),
            releaseHandler: this.sliderReleased.bind(this),
            actionOnRelease: (time) => console.warn('Please set a callback as an action!', time),
            width: options.sliderWidth || this.defaults.sliderWidth,
        };

        this.durationSlider = {
            el: document.createElement('input'),
        }

        this.mouse = {
            isDown: false,
            lastPosition: null,
            sliderLeftPosition: null, 
        };

        this.setupElements(options);
        this.addListeners();
        this.addToDom();

        this.bar.boundaries = this.getBoundaries(this.bar.el);

        this.secondsPerPixels = this.getSecondsPerPixels();
        this.pixelsPerSecond = this.getPixelsPerSecond();

        this.setSliderWidth(this.slider.width);
        this.slider.boundaries = this.getBoundaries(this.slider.el);
        this.setMarkers();

        // change the position of the markers and the px per sec and sec per px values on screen resize
        window.addEventListener('resize', _.throttle(this.resetBarOnWindowResize.bind(this)), 150, { 'leading': true });
    }

    setupElements(options) {
        // bar setup
        this.bar.el.classList.add('progress__bar');
        this.bar.el.style.backgroundColor = options.barColor || this.defaults.barColor;
        this.bar.el.style.height = `${options.barHight || this.defaults.barHeight}px`;

        // slider setup
        this.slider.el.classList.add('progress__slider');
        this.slider.el.style.backgroundColor = options.sliderColor || this.defaults.sliderColor;

        // duration input setup
        this.durationSlider.el.classList.add('progress__duration');
        this.durationSlider.el.setAttribute('type', 'range');

    }

    addListeners() {
        this.slider.el.addEventListener('mousedown', this.sliderPressedDown.bind(this));
        this.bar.el.addEventListener('click', this.moveSliderOnClick.bind(this));
    }

    addToDom() {
        this.bar.el.appendChild(this.slider.el);
        this.container.appendChild(this.bar.el);
        this.container.appendChild(this.durationSlider.el);
    }

    getBoundaries(element) {
        return element.getBoundingClientRect();
    }

    setSliderWidth(seconds) {
        const px = seconds * this.pixelsPerSecond;
        this.slider.el.style.width = `${px}px`;
        this.slider.boundaries = this.getBoundaries(this.slider.el);
    }

    sliderPressedDown(e) {
        this.mouse.isDown = true;
        this.mouse.lastPosition = e.clientX;
        this.mouse.sliderLeftPosition = giveStringPxReturnNumber(this.slider.el.style.left);
        window.addEventListener('mousemove', this.slider.moveHandler);
        window.addEventListener('mouseup', this.slider.releaseHandler);
    }

    moveSlider(e) {
        let distance = e.clientX - this.mouse.lastPosition;

        if (this.mouse.sliderLeftPosition + distance < 0) {
            return this.setLeftPositionSlider(0);
        }

        if (this.mouse.sliderLeftPosition + distance > this.bar.boundaries.width - this.slider.boundaries.width) {
            return this.setLeftPositionSlider(this.bar.boundaries.width - this.slider.boundaries.width);
        }

        this.setLeftPositionSlider(this.mouse.sliderLeftPosition + distance);
    }

    moveSliderOnClick(e) {
        if (e.target === this.bar.el) {

            // check 

            this.setLeftPositionSlider(e.clientX - this.bar.boundaries.left);
        }
    }

    sliderReleased() {
        this.mouseDown = false;

        if (this.slider.clear) {
            clearTimeout(this.slider.clear);
        }

        this.slider.clear = setTimeout(this.slider.actionOnRelease.bind(this, this.getTimeAccordingSliderPosition()), this.actionDelayTime);

        window.removeEventListener('mousemove', this.slider.moveHandler);
        window.removeEventListener('mouseup', this.slider.releaseHandler);
    }

    setLeftPositionSlider(position) {
        this.slider.el.style.left = `${position}px`;
    }

    setSliderAtPositionInSnds(snds = 234) {
        const pxs = snds * this.pixelsPerSecond;
        const start = 0;
        const end = this.bar.boundaries.width - this.slider.boundaries.width;

        if (pxs >= end) {
            this.setLeftPositionSlider(end);      
        } else if (pxs < start) {
            this.setLeftPositionSlider(0);
        } else {
            this.setLeftPositionSlider(pxs);
        }
    }

    getPixelsPerSecond() {
        return this.bar.boundaries.width / this.length;
    }

    getSecondsPerPixels() {
        return this.length / this.bar.boundaries.width;
    }

    createAndAddMarker(position, tall) {
        const marker = document.createElement('div');
        marker.classList.add('progress__marker');
        marker.style.left = position * this.pixelsPerSecond + 'px';

        if (tall) {
            marker.style.height = '30px';
        }
        this.bar.el.appendChild(marker);
    };

    setMarkers() {
        const oneHourMarkers = this.length / (60 * 60);
        const tenMinutesMarkers = this.length / (60 * 10);

        // set markers for each hour
        for (let i = 0; i <= oneHourMarkers; i++) {
            this.createAndAddMarker(i * 3600, true);
        }

        // sets markers for each 10 minutes
        for (let i = 0; i <= tenMinutesMarkers; i++) {
            this.createAndAddMarker(i * 600);
        }
    }

    removeMarkers() {
        this.bar.el.querySelectorAll('.progress__marker').forEach(e => e.remove());
    }

    resetBarOnWindowResize() {
        this.bar.boundaries = this.getBoundaries(this.bar.el);
        this.slider.boundaries = this.getBoundaries(this.slider.el);

        this.secondsPerPixels = this.getSecondsPerPixels();
        this.pixelsPerSecond = this.getPixelsPerSecond();

        this.removeMarkers();
        this.setMarkers();
    }

    getTimeAccordingSliderPosition() {
        return giveStringPxReturnNumber(this.slider.el.style.left) * this.secondsPerPixels;
    }

    setActionOnSliderRelease(action) {
        this.slider.actionOnRelease = action;
    }
}


const giveStringPxReturnNumber = (pixelsString) => {
    return (+(pixelsString.split('px')[0]));
};

const getSecondsReturnTime = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secondsLeft = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 9) {
        hours = `0${hours}`;
    }

    if (minutes < 9) {
        minutes = `0${minutes}`;
    }

    if (secondsLeft < 9) {
        secondsLeft = `0${secondsLeft}`;
    }

    return `${hours}ч. ${minutes}м. ${secondsLeft}с.`;
};


