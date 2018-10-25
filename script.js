// PROGRESS-BAR v.1

class ProgressBar {
    constructor(options) {
        this.defaults = {
            barHeight: 50,
            barColor: '#22ff88',
            sliderColor: '#44aa44',
            sliderWidth: 90,
        }

        this.barHeight = options.barHeight || this.defaults.barHeight;
        this.barColor = options.barColor || this.defaults.barColor;
        this.sliderColor = options.sliderColor || this.defaults.sliderColor;

        this.container = document.getElementById(`${options.container}`);

        this.bar = document.createElement('div');
        this.slider = document.createElement('div');

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
            console.log('wider');
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
        window.removeEventListener('mousemove', this.moveSliderHandler);
        window.removeEventListener('mouseup', this.sliderReleasedHandler);
    }

    setLeftPositionSlider(position) {
        this.slider.style.left = `${position}px`;
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



