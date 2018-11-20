// PROGRESS-BAR v.1

class ProgressBar {
    constructor(options) {
        this.defaults = {
            delayTime: 3000,
            durationSlider: {
                step: 30,
                min: 30,
                max: 600,
                value: 30,
            },
        };

        this.length = options.length;

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
        };

        this.durationSlider = {
            el: document.createElement('input'),
            attr: this.defaults.durationSlider,
        }

        this.mouse = {
            isDown: false,
            lastPosition: null,
            sliderLeftPosition: null,
        };

        this.timers = {
            durationRecording: new Timer('Duration of the recording:', this.length),
            durationSection: new Timer('Duration of the section:', this.durationSlider.attr.value),
            startTimeSection: new Timer('Start time of the section:', 0),
            endTimeSection: new Timer('End time of the section:', 0),
        };

        this.setupElements();
        this.addToDom();

        this.bar.boundaries = this.getBoundaries(this.bar.el);

        this.secondsPerPixels = this.getSecondsPerPixels();
        this.pixelsPerSecond = this.getPixelsPerSecond();

        this.setSliderWidth(this.durationSlider.el.value);
        this.setMarkers();

        // this changes the position of the markers and the px per sec and sec per px values when the screen is resized
        window.addEventListener('resize', _.throttle(this.resetBarOnWindowResize.bind(this)), 150, { 'leading': true });

        this.helpers = {
            passStringPxReturnNumber: (pixelsString) => (+(pixelsString.split('px')[0])),
        };

    }

    setupElements() {
        this.barElSetup(this.bar);
        this.sliderElSetup(this.slider);
        this.durationElSetup(this.durationSlider);
    }

    barElSetup(node) {
        node.el.classList.add('progress__bar');
        node.el.addEventListener('click', this.moveSliderOnClick.bind(this));
    }

    sliderElSetup(node) {
        node.el.classList.add('progress__slider');
        node.el.addEventListener('mousedown', this.sliderPressedDown.bind(this));
    }

    durationElSetup(node) {
        node.el.classList.add('progress__duration');
        node.el.setAttribute('type', 'range');
        node.el.value = node.attr.value;
        node.el.min = node.attr.min;
        node.el.max = node.attr.max;
        node.el.step = node.attr.step;
        node.el.addEventListener('change', this.changeSliderWidth.bind(this));
    }

    addToDom() {
        this.bar.el.appendChild(this.slider.el);
        this.container.appendChild(this.bar.el);
        this.container.appendChild(this.durationSlider.el);
        Object.keys(this.timers).forEach(e => this.container.appendChild(this.timers[e].el.container));
    }

    getBoundaries(element) {
        return element.getBoundingClientRect();
    }

    setSliderWidth(seconds) {
        const px = parseInt(seconds) * this.pixelsPerSecond;
        const action = () => {
            this.slider.el.style.width = `${px}px`;
            // update the slider boundaries inside the animationFrame 'cause it's called asyncly
            this.slider.boundaries = this.getBoundaries(this.slider.el);
        };
        requestAnimationFrame(action);
    }

    changeSliderWidth(e) {
        const value = e.target.value;
        this.timers.durationSection.updateTime(value);
        this.setSliderWidth(value);
    }

    sliderPressedDown(e) {
        this.mouse.isDown = true;
        this.mouse.lastPosition = e.clientX;
        this.mouse.sliderLeftPosition = this.helpers.passStringPxReturnNumber(this.slider.el.style.left);
        window.addEventListener('mousemove', this.slider.moveHandler);
        window.addEventListener('mouseup', this.slider.releaseHandler);
    }

    moveSlider(e) {
        const distance = e.clientX - this.mouse.lastPosition;
        const sliderNewLeft = this.mouse.sliderLeftPosition + distance;

        if (sliderNewLeft < 0) {
            return this.setLeftPositionSlider(0);
        }

        if (sliderNewLeft > this.bar.boundaries.width - this.slider.boundaries.width) {
            return this.setLeftPositionSlider(this.bar.boundaries.width - this.slider.boundaries.width);
        }

        this.setLeftPositionSlider(sliderNewLeft);
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
        requestAnimationFrame(() => this.slider.el.style.left = `${position}px`);
    }

    setSliderAtPositionInSnds(snds = 0) {
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
            marker.classList.add('progress__marker--tall');
        }

        this.bar.el.appendChild(marker);
    };

    setMarkers() {
        const tenMinutesMarkers = this.length / (60 * 10);

        // sets markers for each 10 minutes
        for (let i = 0; i <= tenMinutesMarkers; i++) {
            if (i % 6 === 0) {
                this.createAndAddMarker(i * 600, true);
            } else {
                this.createAndAddMarker(i * 600);
            }

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
        return this.helpers.passStringPxReturnNumber(this.slider.el.style.left) * this.secondsPerPixels;
    }

    setActionOnSliderRelease(action) {
        this.slider.actionOnRelease = action;
    }
}

class Timer {
    constructor(label = '', time = '') {

        this.helpers = {
            passSecondsReturnTime: (seconds) => {
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

                return `${hours}h. ${minutes}m. ${secondsLeft}s.`;
            },
        }

        this.label = label;
        this.time = this.helpers.passSecondsReturnTime(time);

        this.el = this.createEl();


    }

    createEl() {
        const container = document.createElement('div');
        const label = document.createElement('span');
        const time = document.createElement('span');

        container.classList.add('progress__timer');
        label.classList.add('progress__label');
        time.classList.add('progress__time');

        label.innerHTML = this.label;
        time.innerHTML = this.time;

        container.appendChild(label);
        container.appendChild(time);

        return {
            container,
            label,
            time,
        };
    }

    changeLabel(newLabel = '') {
        this.el.label.innerHTML = newLabel;
    }

    updateTime(newTime = 0) {
        this.el.time.innerHTML = this.helpers.passSecondsReturnTime(newTime);
    }
}