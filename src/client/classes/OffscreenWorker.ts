// import * as THREE from "three";
// import { SimpleOrbitControls } from "../SimpleOrbitControls";

// const state = {
// 	width: 300, // canvas default
// 	height: 150, // canvas default
// };
// const fov = 75;
// const aspect = 2; // the canvas default
// const near = 0.1;
// const far = 100;
// const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// const orbitControls = new SimpleOrbitControls(camera);


// function main(data) {
// 	const { canvas } = data;
// 	const renderer = new THREE.WebGLRenderer({ canvas });

// 	state.width = canvas.width;
// 	state.height = canvas.height;


// 	camera.position.z = 4;

// 	const scene = new THREE.Scene();

// 	{
// 		const color = 0xf41fff;
// 		const intensity = 1;
// 		const light = new THREE.DirectionalLight(color, intensity);
// 		light.position.set(-1, 2, 4);
// 		scene.add(light);
// 	}

// 	const boxWidth = 1;
// 	const boxHeight = 1;
// 	const boxDepth = 1;
// 	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

// 	function makeInstance(geometry, color, x) {
// 		const material = new THREE.MeshPhongMaterial({
// 			color,
// 		});

// 		const cube = new THREE.Mesh(geometry, material);
// 		scene.add(cube);

// 		cube.position.x = x;

// 		return cube;
// 	}

// 	const cubes = [
// 		makeInstance(geometry, 0x44aa88, 0),
// 		makeInstance(geometry, 0x8844aa, -2),
// 		makeInstance(geometry, 0xaa8844, 2),
// 		makeInstance(geometry, 0x66a220, 0),
// 	];

// 	function resizeRendererToDisplaySize(renderer) {
// 		const canvas = renderer.domElement;
// 		const width = state.width;
// 		const height = state.height;
// 		const needResize = canvas.width !== width || canvas.height !== height;
// 		if (needResize) {
// 			renderer.setSize(width, height, false);
// 		}
// 		return needResize;
// 	}

// 	function render(time) {
// 		time *= 0.001;

// 		if (resizeRendererToDisplaySize(renderer)) {
// 			camera.aspect = state.width / state.height;
// 			camera.updateProjectionMatrix();
// 		}

// 		cubes.forEach((cube, ndx) => {
// 			const speed = 1 + ndx * 0.1;
// 			const rot = time * speed;
// 			cube.rotation.x = rot;
// 			cube.rotation.y = rot;
// 		});

// 		renderer.render(scene, camera);

// 		requestAnimationFrame(render);
// 	}

// 	requestAnimationFrame(render);
// }

// function size(data) {
// 	state.width = data.width;
// 	state.height = data.height;
// }

// function cameraupdate(data) {
// 	console.log("camera", data);
// 	camera.position.set(data.pos.x, data.pos.y, data.pos.z);
// 	camera.rotation.set(data.rotx, data.roty, data.rotz);

// }

// const handlers = {
// 	main,
// 	size,
// 	cameraupdate,
// };

// self.onmessage = function (e) {
// 	const fn = handlers[e.data.type];
// 	if (!fn) {
// 		throw new Error("no handler for type: " + e.data.type);
// 	}
// 	fn(e.data);
// };
