"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// PROGRESS-BAR v.1
var ProgressBar = function ProgressBar(options) {
  _classCallCheck(this, ProgressBar);

  this.defaults = {
    height: '100px',
    barColor: '#22ff88',
    sliderColor: '#44aa44'
  };
  this.height = options.height || this.defaults.height;
  this.barColor = options.barColor || this.defaults.barColor;
  this.sliderColor = options.sliderColor || this.defaults.sliderColor;
};

window.addEventListener('DOMContentLoaded', function () {});