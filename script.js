// PROGRESS-BAR v.1

class ProgressBar {
    constructor(options) {
        this.defaults = {
            barHeight: 50,
            barColor: '#22ff88',
            sliderColor: '#44aa44',
            sliderWidth: 90,
            delayTime: 3000,
        };
        
        this.length = options.length;
        
        this.actionDelayTime = options.delayTime || this.defaults.delayTime;
        this.barHeight = options.barHeight || this.defaults.barHeight;
        this.barColor = options.barColor || this.defaults.barColor;
        this.sliderColor = options.sliderColor || this.defaults.sliderColor;

        this.container = document.getElementById(`${options.container}`);

        this.bar = document.createElement('div');
        this.slider = document.createElement('div');

        this.bar.classList.add('progress__bar');

        this.mouse = {
            isDown: false,
            lastPosition: null,
            sliderLeftPosition: null, 
        };

        this.moveSliderHandler = this.moveSlider.bind(this);
        this.sliderReleasedHandler = this.sliderReleased.bind(this);

        this.setStyles(options);
        this.addListeners();
        this.addToDom();

        this.barBoundaries = this.getBoundaries(this.bar);
        this.sliderBoundaries = this.getBoundaries(this.slider);

        this.secondsPerPixels = this.getSecondsPerPixels();
        this.pixelsPerSecond = this.getPixelsPerSecond();

        this.secs = 0;

        this.setMarkers();

        window.addEventListener('resize', _.throttle(this.resetBarOnWindowResize.bind(this)), 150, { 'leading': true });
    }

    setStyles(options) {
        this.bar.style.backgroundColor = options.barColor || this.defaults.barColor;
        this.bar.style.height = `${options.barHight || this.defaults.barHeight}px`;

        this.slider.classList.add('progress__slider');
        this.slider.style.backgroundColor = options.sliderColor || this.defaults.sliderColor;
        this.slider.style.width = `${options.sliderWidth || this.defaults.sliderWidth}px`;
    }

    addListeners() {
        this.slider.addEventListener('mousedown', this.sliderPressedDown.bind(this));
        this.bar.addEventListener('click', this.moveSliderOnClick.bind(this));
    }

    addToDom() {
        this.bar.appendChild(this.slider);
        this.container.appendChild(this.bar);
    }

    getBoundaries(element) {
        return element.getBoundingClientRect();
    }

    setSliderWidth(width) {
        this.slider.style.width = `${width}px`;
    }

    sliderPressedDown(e) {
        this.mouse.isDown = true;
        this.mouse.lastPosition = e.clientX;
        this.mouse.sliderLeftPosition = this.getBoundaries(this.slider).left;
        window.addEventListener('mousemove', this.moveSliderHandler);
        window.addEventListener('mouseup', this.sliderReleasedHandler);
    }

    moveSlider(e) {
        let distance = e.clientX - this.mouse.lastPosition;

        if (this.mouse.sliderLeftPosition + distance < 0) {
            return this.setLeftPositionSlider(0);
        }

        if (this.mouse.sliderLeftPosition + distance > this.barBoundaries.width - this.sliderBoundaries.width) {
            return this.setLeftPositionSlider(this.barBoundaries.width - this.sliderBoundaries.width);
        }
        this.setLeftPositionSlider(this.mouse.sliderLeftPosition + distance);
    }

    moveSliderOnClick(e) {
        if (e.target === this.bar) {

            // check 

            this.setLeftPositionSlider(e.clientX - this.barBoundaries.left);
        }
    }

    sliderReleased() {
        this.mouseDown = false;

        const clear = setTimeout(this.actionOnSliderRelease.bind(this), this.actionDelayTime);

        window.removeEventListener('mousemove', this.moveSliderHandler);
        window.removeEventListener('mouseup', this.sliderReleasedHandler);
    }

    setLeftPositionSlider(position) {
        this.slider.style.left = `${position}px`;
    }

    setSliderAtPositionInSnds(snds = 234) {
        const pxs = snds * this.pixelsPerSecond;
        const start = 0;
        const end = this.barBoundaries.width - this.sliderBoundaries.width;

        if (pxs >= end) {
            this.setLeftPositionSlider(end);      
        } else if (pxs < start) {
            this.setLeftPositionSlider(0);
        } else {
            this.setLeftPositionSlider(pxs);
        }
    }

    getPixelsPerSecond() {
        return this.barBoundaries.width / this.length;
    }

    getSecondsPerPixels() {
        return this.length / this.barBoundaries.width;
    }

    createAndAddMarker(position, tall) {
        const marker = document.createElement('div');
        marker.classList.add('vrs-slider-marker');
        marker.style.left = position * this.pixelsPerSecond + 'px';

        if (tall) {
            marker.style.height = '30px';
        }

        this.bar.appendChild(marker);
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
        this.bar.querySelectorAll('.vrs-slider-marker').forEach(e => e.remove());
    }

    resetBarOnWindowResize() {
        this.barBoundaries = this.getBoundaries(this.bar);
        this.sliderBoundaries = this.getBoundaries(this.slider);

        this.secondsPerPixels = this.getSecondsPerPixels();
        this.pixelsPerSecond = this.getPixelsPerSecond();

        this.removeMarkers();
        this.setMarkers();
    }

    getTimeAccordingSliderPosition() {
        return giveStringPxReturnNumber(this.slider.style.left) * this.secondsPerPixels;
    }

    actionOnSliderRelease(callback = (time) => console.warn('Please set a callback as an action!', time)) {
        const time = this.getTimeAccordingSliderPosition();
        callback(time);
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


