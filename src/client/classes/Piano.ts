// var dae;

// //create a 3 d cube and add it to the scene
// // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// // var cube = new THREE.Mesh( geometry, material );

// loader.load(
// 	// resource URL
// 	"resources/Objects/piano.dae",

// 	// Function when resource is loaded
// 	function (collada) {
// 		dae = collada.scene;
// 		collada.scene.traverse(function (child) {
// 			keys_obj.push(child);
// 			child.rotation.x = -Math.PI / 4.0;
// 			child.rotation.y = 0;
// 			child.rotation.z = 0;
// 			child.keyState = keyState.unpressed;
// 			child.clock = new THREE.Clock(false);
// 			child.castShadow = true;
// 			child.receiveShadow = true;

// 			// only add meshes in the material redefinition (to make keys change their color when pressed)
// 			if (child.isMesh) {
// 				old_material = child.material;
// 				child.material = new THREE.MeshPhongMaterial({
// 					color: old_material.color,
// 				});
// 				child.material.shininess = 35.0;
// 				child.material.specular = new THREE.Color().setRGB(0.25, 0.25, 0.25);
// 				child.material.note_off = child.material.color.clone();
// 			}
// 		});
// 		dae.scale.x = dae.scale.y = 2;
// 		dae.scale.z = 2;
// 		dae.rotation.x = +Math.PI / 4.0;
// 		dae.position.z = 150;
// 		dae.position.y = -500;
// 		dae.position.x = -1100;
// 		dae.updateMatrix();

// 		scene.add(dae);
// 	},
// 	// Function called when download progresses
// 	function (xhr) {
// 		console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
// 	}
// );
