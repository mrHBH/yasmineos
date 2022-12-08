import { Object3D } from "three";
//import {Buffer} from "Buffer";
class CSS3DObject extends Object3D {
	isCSS3DObject: boolean;
	element: HTMLDivElement;
	constructor(element = document.createElement("div")) {
		super();

		this.isCSS3DObject = true;
		this.element = element;
		this.element.style.position = "absolute";
		this.element.style.pointerEvents = "auto";
		this.element.style.userSelect = "none";

		this.element.setAttribute("draggable", "false");

		this.addEventListener("removed", function () {
			this.traverse(function (object) {
				if (
					object.element instanceof Element &&
					object.element.parentNode !== null
				) {
					object.element.parentNode.removeChild(object.element);
				}
			});
		});
	}
}

class CSS3DRenderer {
	domElement: HTMLDivElement;
	getSize: () => { width: number; height: number };
	render: (scene: THREE.Object3D, camera: THREE.PerspectiveCamera) => void;
	renderW: (scene: THREE.Object3D, camera: THREE.PerspectiveCamera) => void;
	setSize: (width: number, height: number) => void;
	renderObject: (object: CSS3DObject, scene: THREE.Object3D) => void;
	backgroundWorker: Worker;
	constructor(parameters = {} as { element: HTMLDivElement }) {
		//const _this = this;

		//const w = new Worker("Worker.js");
		// this.backgroundWorker = new Worker(new URL("./Worker.ts", import.meta.url));
		// this.backgroundWorker.onmessage = function (event) {
		// 	console.group("Worker --------------- ss");
		// 	console.log(event.data);
		// 	console.groupEnd();
		// };

		// this.backgroundWorker.postMessage("start",);
		




		let _width: number, _height: number;
		let _widthHalf: number, _heightHalf: number;

		const cache = {
			camera: { fov: 0, style: "" },
			objects: new WeakMap(),
		};

		const domElement =
			parameters.element !== undefined
				? parameters.element
				: document.createElement("div");

		domElement.style.overflow = "hidden";

		this.domElement = domElement;

		const cameraElement = document.createElement("div");

		cameraElement.style.transformStyle = "preserve-3d";
		cameraElement.style.willChange = "all";
		cameraElement.style.pointerEvents = "none";

		domElement.appendChild(cameraElement);

		// this.backgroundWorker.onmessage = function (event) {
		// 	//check even name
		// };

		this.getSize = function () {
			return {
				width: _width,
				height: _height,
			};
		};

		this.render = function (scene, camera) {
			const fov = camera.projectionMatrix.elements[5] * _heightHalf;

			if (cache.camera.fov !== fov) {
				domElement.style.perspective = camera.isPerspectiveCamera
					? fov + "px"
					: "";
				cache.camera.fov = fov;
			}
			scene.updateMatrixWorld();
			if (camera.parent === null && camera.matrixAutoUpdate === true)
				camera.updateMatrixWorld();
	//		console.log(camera.matrixWorldInverse.elements);
	//		const view = new Float64Array(camera.matrixWorldInverse.elements);
			// this.backgroundWorker.postMessage(camera.matrixWorldInverse.elements, [Buffer.from(camera.matrixWorldInverse.elements)], );

			// this.backgroundWorker.postMessage(view, [view.buffer], );

			// if (view.byteLength) {
			// 	alert('Transferables are not supported in your browser!');
			// } else {
			// 	// Transferables are supported.
			// }

			const a = getCameraCSSMatrix(camera.matrixWorldInverse);
			const cameraCSSMatrix = "translateZ(" + fov + "px)" + a;

			const style =
				cameraCSSMatrix +
				"translate(" +
				_widthHalf +
				"px," +
				_heightHalf +
				"px)";

			if (cache.camera.style !== style) {
				cameraElement.style.transform = style;

				//				cache.camera.style = style;
			}

			this.renderObject(scene, camera);
		};

		this.renderW = function (scene, camera) {
			const fov = camera.projectionMatrix.elements[5] * _heightHalf;

			if (cache.camera.fov !== fov) {
				domElement.style.perspective = camera.isPerspectiveCamera
					? fov + "px"
					: "";
				cache.camera.fov = fov;
			}
			scene.updateMatrixWorld();
			if (camera.parent === null && camera.matrixAutoUpdate === true)
				camera.updateMatrixWorld();

			// this.backgroundWorker.postMessage("getCameraCSSMatrix", [
			// 	camera.matrixWorldInverse,
			// ]);

			const a = getCameraCSSMatrix(camera.matrixWorldInverse);
			const cameraCSSMatrix = "translateZ(" + fov + "px)" + a;

			const style =
				cameraCSSMatrix +
				"translate(" +
				_widthHalf +
				"px," +
				_heightHalf +
				"px)";

			if (cache.camera.style !== style) {
				cameraElement.style.transform = style;

				cache.camera.style = style;
			}

			this.renderObject(scene, camera);
		};

		this.setSize = function (width, height) {
			_width = width;
			_height = height;
			_widthHalf = _width / 2;
			_heightHalf = _height / 2;

			domElement.style.width = width + "px";
			domElement.style.height = height + "px";

			cameraElement.style.width = width + "px";
			cameraElement.style.height = height + "px";
		};

		function epsilon(value) {
			return Math.abs(value) < 1e-10 ? 0 : value;
		}

		function getCameraCSSMatrix(matrix) {
			const elements = matrix.elements;

			return (
				"matrix3d(" +
				epsilon(elements[0]) +
				"," +
				epsilon(-elements[1]) +
				"," +
				epsilon(elements[2]) +
				"," +
				epsilon(elements[3]) +
				"," +
				epsilon(elements[4]) +
				"," +
				epsilon(-elements[5]) +
				"," +
				epsilon(elements[6]) +
				"," +
				epsilon(elements[7]) +
				"," +
				epsilon(elements[8]) +
				"," +
				epsilon(-elements[9]) +
				"," +
				epsilon(elements[10]) +
				"," +
				epsilon(elements[11]) +
				"," +
				epsilon(elements[12]) +
				"," +
				epsilon(-elements[13]) +
				"," +
				epsilon(elements[14]) +
				"," +
				epsilon(elements[15]) +
				")"
			);
		}

		function getObjectCSSMatrix(matrix) {
			const elements = matrix.elements;
			const matrix3d =
				"matrix3d(" +
				epsilon(elements[0]) +
				"," +
				epsilon(elements[1]) +
				"," +
				epsilon(elements[2]) +
				"," +
				epsilon(elements[3]) +
				"," +
				epsilon(-elements[4]) +
				"," +
				epsilon(-elements[5]) +
				"," +
				epsilon(-elements[6]) +
				"," +
				epsilon(-elements[7]) +
				"," +
				epsilon(elements[8]) +
				"," +
				epsilon(elements[9]) +
				"," +
				epsilon(elements[10]) +
				"," +
				epsilon(elements[11]) +
				"," +
				epsilon(elements[12]) +
				"," +
				epsilon(elements[13]) +
				"," +
				epsilon(elements[14]) +
				"," +
				epsilon(elements[15]) +
				")";

			return "translate(-50%,-50%)" + matrix3d;
		}

		this.renderObject = function renderObject(object, camera) {
			if (object.isCSS3DObject) {
				const visible =
					object.visible === true && object.layers.test(camera.layers) === true;

				if (visible === true) {
					const style = getObjectCSSMatrix(object.matrixWorld);
					const element = object.element;
					const cachedObject = cache.objects.get(object);

					if (cachedObject === undefined || cachedObject.style !== style) {
						element.style.transform = style;

						const objectData = { style: style };
						cache.objects.set(object, objectData);
					}

					if (element.parentNode !== cameraElement) {
						cameraElement.appendChild(element);
					}
				}
			}

			for (let i = 0, l = object.children.length; i < l; i++) {
				renderObject(object.children[i] as CSS3DObject, camera);
			}
		};
	}
}

export { CSS3DObject, CSS3DRenderer };
