const CANVAS_ID = 'myCanvas';
window.onload = function () {
    const state = new CanvasState(document.getElementById(CANVAS_ID));

    let rectangle = new DivObject('20px', '20px', 0, 'redRectangle', 'Red', 'Blue', state);
    const circle = new DivObject('20px', '150px', 1, 'greenCircle', 'Green', 'Blue', state);

    document.body.appendChild(rectangle.element);
    document.body.appendChild(circle.element);

    setInterval(() => state.Draw(), 30);
}

function getElementPositionById(id) {
    const element = document.getElementById(id);
    return { left, top } = element.getBoundingClientRect();
}

class Shape {    
    constructor(x = 0, y = 0, type = 0, w = 100, h = 100, fill = 'rgb(255,0,0)') {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.fill = fill;
        this.type = type;
    }

    Draw(cnt) {
        cnt.fillStyle = this.fill;
        switch(this.type){
            case 0: {
                cnt.fillRect(this.x, this.y, this.w, this.h);
            } break;
            case 1:{
                cnt.beginPath();
                cnt.arc(this.x, this.y, this.w/2, 0,2*Math.PI);
                cnt.fill();
            }break;
        }
        
    }

    Contains(mx, my){
        if(this.type == 1) {
            return (this.x - 50 <= mx
                && this.x - 50 + this.w > mx
                && this.y - 50 <= my
                && this.y - 50 + this.h > my 
            );    
        }
        return (this.x <= mx
            && this.x + this.w > mx
            && this.y <= my
            && this.y + this.h > my 
        );
    }
}

class CanvasState{
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.cnt = canvas.getContext('2d');
        this.valid = false;
        this.shapes = [];
        this.selection = null;
        this.dragoffx = 0;
        this.dragoffy = 0;
        this.dragging = false;

        canvas.addEventListener('mousedown', e => {
            debugger;
            const mouse = this.GetMouse(e);
            const {x: mx, y: my} = mouse;
            this.shapes.forEach((shape) => {
                if(shape.Contains(mx, my)){
                    this.dragoffx = mx - shape.x;
                    this.dragoffy = my - shape.y;
                    this.dragging = true;
                    this.selection = shape;
                    this.valid = false;
                    return;
                }
            })
        }, true);

        canvas.addEventListener('mousemove', e => {
            if (this.dragging){
              var mouse = this.GetMouse(e);
              this.selection.x = mouse.x - this.dragoffx;
              this.selection.y = mouse.y - this.dragoffy;   
              this.valid = false;
            }
          }, true);

        canvas.addEventListener('mouseup', (e) => {
            this.dragging = false;
          }, true);
    }

    AddShape(shape) {
        this.shapes.push(shape);
        this.valid = false;
    }

    Clear(){
        this.cnt.clearRect(0,0,this.width, this.height);
    }

    Draw() {
        if (!this.valid) {
            this.Clear();
            this.shapes.forEach((shape)=>{
                if (shape.x > this.width || shape.y > this.height ||
                    shape.x + shape.w < 0 || shape.y + shape.h < 0) return;
                shape.Draw(this.cnt);
            })
        }
        this.valid = true;
    }

    GetMouse(mouseEvent) {
        const canvasPosition = this.canvas.getBoundingClientRect();
    
        return {
            x: mouseEvent.clientX - canvasPosition.left,
            y: mouseEvent.clientY - canvasPosition.top,
        };  
    }
}

class DivObject {
    constructor(x = '25px', y = '25px', type = 0, id, bgColor, border, state){
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.isActive = false;
        this.offset = [0,0];
        this.state = state;
        this.bgColor = bgColor;
        this.border = border;
        this.element;
        this.initElement(x, y, id,bgColor, border, type);

        
        this.element.addEventListener('mousedown', (e) => {
            this.isActive = true;
            this.offset = [
                this.element.offsetLeft - e.clientX,
                this.element.offsetTop - e.clientY
            ];
        }, true);

        this.element.addEventListener('mouseup', (e) => {
            this.isActive = false;

            this.tryCreateElementInCanvas();
            this.resetRectanglePosition(this.element);
        }, true);

        document.addEventListener('mousemove', (e) => {
            event.preventDefault();
            if (this.isActive) {
               let mousePosition = {
                    x : e.clientX,
                    y : e.clientY
                };

                this.element.style.left = (mousePosition.x + this.offset[0]) + 'px';
                this.element.style.top  = (mousePosition.y + this.offset[1]) + 'px';
            }
        }, true);
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.left = this.x;
        this.element.style.top = this.y;
        this.element.style.width = "100px";
        this.element.style.height = "100px";
        this.element.style.background = this.bgColor;
        this.element.style.color = this.border;
        this.element.id = this.id;
        if(this.type === 1){
            this.element.style.borderRadius = "50px"
        }
    }

    tryCreateElementInCanvas(){
        const canvasPosition = getElementPositionById(CANVAS_ID);
        const elementPosition = this.getElementPosition();
        if(elementPosition.left > canvasPosition.left && elementPosition.top > canvasPosition.top){
            debugger;
            const mouseOnCanvas = this.getElementPositionOnCanvas();
            switch(this.type){
                case 0:
                    this.state.AddShape(new Shape(mouseOnCanvas.x, mouseOnCanvas.y, this.type, 100, 100, this.bgColor));
                    break;
                case 1:{
                    this.state.AddShape(new Shape(mouseOnCanvas.x + 50, mouseOnCanvas.y + 50, this.type, 100, 100, this.bgColor));
                } 
            }
            
        }
    }

    getElementPosition(){
       return getElementPositionById(this.id);
    }

    getElementPositionOnCanvas(){
        const canvasPosition = getElementPositionById(CANVAS_ID);
        const elementPosition = this.getElementPosition();
    
        return {
            x: elementPosition.left - canvasPosition.left,
            y: elementPosition.top - canvasPosition.top,
        };
    }
     
    resetRectanglePosition() {
        this.element.style.left = this.x;
        this.element.style.top  = this.y;
    }
}