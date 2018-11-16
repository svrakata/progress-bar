// create the element with some parameters ?!!?
// set css class
// the class will have a method that returns the node

// no point of making this shit


class ResizableNode {
    constructor(options) {
        this.defaults = {

        };


        this.node = {
            el: document.createElement('div'),
        };

        this.setupElement();
        
        return this.node.el;

    }

    setupElement() {
        this.node.el.classList.add('progress-slider');
        


    }
     






}