import {new_fluid_cube, display_water} from './fluidUtilities.js'
import compute_water_step from './computeWaterMovement.js'; 

function compute_wall_normal() {}

function allocate_wall(tab, mapData, fluidData) {
	console.log('coords square', tab);
	console.log('heat', mapData.heat_map[tab[1] - 1][tab[2] - 1][0]);

	let offset = 1; // a changer en fct de la reso du cube
	let x = tab[1] - 1;
	let y = tab[2] - 1;

	console.count('allocate_wall');
	console.log('x :', x);
	console.log('y :', y);

	let isWall = 0;
	for (let i = 0; i <= offset; i++) {
		for (let j = 0; j <= offset; j++) {
				if (mapData.heat_map[x + i][y + j][0].z > tab[0]) {
					//console.count('wall');
					isWall++;
				}
				//else
				//	console.count('WSH');
			}
		}

	if (isWall !== 0)
		return { type: "terrain limit" };
	return { type: "empty" };
}

// pour l instant carre de taille 1, on verra apres si ca pete
function allocate_water_grid(mapData, fluidData) {
	fluidData.height = mapData.points[mapData.points.length - 1][2];
		
	fluidData.fluid_array = new Array(fluidData.height + 2);
	for (let i = 0; i <= fluidData.height + 1; i++) {
		fluidData.fluid_array[i] =  new Array(mapData.size_map + 2)
		for (let j = 0; j <= mapData.size_map + 1; j++) {
			fluidData.fluid_array[i][j] =  new Array(mapData.size_map + 2)
			for (let k = 0; k <= mapData.size_map + 1; k++) {
				if (i === 0)
					fluidData.fluid_array[i][j][k] = { type: "floor" };
				else if (i === fluidData.height + 1)
					fluidData.fluid_array[i][j][k] = { type: "ceilling" };
				else if (j === 0 || j === mapData.size_map + 1 || k === 0 || k === mapData.size_map + 1)
					fluidData.fluid_array[i][j][k] = { type: "wall" };
				else
					fluidData.fluid_array[i][j][k] = allocate_wall([i, j, k], mapData, fluidData);
			}
		}
	}
}

function test_water_grid(fluidData, mapData) {
	for (let i = 0; i <= fluidData.height + 1; i++) {
		for (let j = 0; j <= mapData.size_map + 1; j++) {
			for (let k = 0; k <= mapData.size_map + 1; k++) {
				console.count('elem nb');
				console.log("i", i);
				console.log("j", j);
				console.log("k", k);
				console.log("elem type :", fluidData.fluid_array[i][j][k]);
			}
		}
	}

}

function generate_water(mapData, fluidData, waterPolyData) {
	allocate_water_grid(mapData, fluidData);
	test_water_grid(fluidData, mapData)
	console.log(fluidData.fluid_array);
	compute_water_step(mapData, fluidData);
	display_water(fluidData, waterPolyData);
}

export default generate_water;
