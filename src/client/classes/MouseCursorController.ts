import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

class MouseCursorController {
	CursorDiv: HTMLCanvasElement;
	ArrowCursor: HTMLCanvasElement;
	input: any;
    rotation: { x: number; };

	constructor(input: any) {
		{
			this.input = input;
			this.CursorDiv = document.querySelector(".cursor--small");
			this.ArrowCursor = document.querySelector(".arrow-cursor");
			//append a div to the cursor div
			//create a shape for a zoom in cursor in the form of a  magnifying glass with a plus sign

			const circle = "M 0 0 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0";
			//create a plus sign
			const plus = "M 0 0 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0";
			//create a minus sign
			// add the handle 
			const handle = "M 0 0 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0";
			//create a zoom out cursor by merging  the previous shapes

			const zoomOut = circle + plus ;
			//make it a bit larger
			
			

			//this.SetCursor(zoomOut);
            this.rotation = { x: 0 };


			//set the cursor to the arrow
			

			//get the path of the cursor and change its class to arrow1
			//gett svg child


		}
	}

	SetCursor(svg: string) {

		//generate svg element
		const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.setAttribute("viewBox", "0 0 150 150");
		svgElement.setAttribute("width", "300");
		svgElement.setAttribute("height", "300");
		svgElement.setAttribute("class", "cursor--svg");
		
		//generate path element
		const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		svgPath.setAttribute("d", svg);
		svgPath.setAttribute("class", "cursor--path");
		svgPath.setAttribute("fill", "white");
		svgPath.setAttribute("stroke", "white");
		svgPath.setAttribute("stroke-width", "3");
		svgPath.setAttribute("stroke-linecap", "round");
		svgPath.setAttribute("stroke-linejoin", "round");
		svgPath.setAttribute("stroke-miterlimit", "10");
		svgPath.setAttribute("stroke-dasharray", "none");
		svgPath.setAttribute("stroke-dashoffset", "0");
		svgPath.setAttribute("stroke-opacity", "0.6");
		svgPath.setAttribute("fill-rule", "evenodd");
		svgPath.setAttribute("clip-rule", "evenodd");
		svgPath.setAttribute("transform", "matrix(1,0,1,1,0,0)");
		svgPath.setAttribute("style", "mix-blend-mode: normal");

		//append the path to the svg
		svgElement.appendChild(svgPath);

		// add the svg to the cursor div
		this.CursorDiv.appendChild(svgElement);


		

		
	}

	//when 




	Update(dt: number) {

		//when the wheel is scrolled, the svg will scroll with it
		if (this.input.mouseWheel != 0) {
			//this.input.mouseWheelDirection *
			this.rotation.x +=  this.input.mouseWheel * 0.01;
		//	this.rotation.x = Math.min(Math.max(this.rotation.x, -Math.PI / 2), Math.PI / 2);
			this.CursorDiv.style.transform = `rotateX(${this.rotation.x}rad)`;
		}
       
		// if (this.input.pressed("mouse_left")) {
		// 	this.SetCursor("M 50 0 L 100 100 L 0 100 Z");

		// 	//tween the rotation of the cursor
		
		// 	const tween = new TWEEN.Tween(this.rotation)
		// 		.to({ x: 180 + this.rotation.x }, 500)
		// 		.easing(TWEEN.Easing.Quadratic.Out)			
		// 		.start();
		// 	//tween the scale of the cursor


		// 	//  svgPath.classList.remove("arrow2");
		// 	//  svgPath.classList.add("arrow1");
		// 	//svgPath.style.transform = "rotate(180deg)";

		// 	//remove all the classes of the svg path
		// 	//loop through the classes and remove them
		// }
		// if (this.input.released("mouse_left")) {

        //     const tween = new TWEEN.Tween(this.rotation)
        //     .to({ x: -180 + this.rotation.x }, 500)
        //     .easing(TWEEN.Easing.Quadratic.Out)          
        //     .start();


		// 	//rotate the svg path to 180 degrees
		// 	// svgPath.style.transform = "scale(2,1)";

		// 	// svgPath.classList.remove("arrow1");
		// 	// svgPath.classList.add("arrow2");
		// }

		this.CursorDiv.style.transform = `translate(${this.input.mousePosition.x}px, ${this.input.mousePosition.y}px) `;
	//	this.ArrowCursor.style.transform =  ` translate(${this.input.mousePosition.x}px, ${this.input.mousePosition.y}px) 
        //add  rotation to the arrow cursor
   //     this.ArrowCursor.style.transform= `translate(${this.input.mousePosition.x}px, ${this.input.mousePosition.y}px) rotate(${this.rotation.x}deg)`;
	}
}

export { MouseCursorController };




//-- - - - --- -  --- - --- -- ---- - -- ---- -- - - -- --- - - -- -- ---- -- - - - - -- - - -    - - - -
