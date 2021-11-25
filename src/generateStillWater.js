import {new_fluid_cube, display_water} from './fluidUtilities.js'
import compute_water_step from './computeWaterMovement.js'; 

function compute_wall_normal() {}

function allocate_water_grid(mapData, fluidData) {
	fluidData.height = mapData.points[mapData.points.length - 1][2] + 2; // adding walls to contain water

	fluidData.length_stage = (mapData.size_map * mapData.size_map) + 2; // adding walls to contain water

	fluidData.fluid_array = new Array(fluidData.height);
	
	for (let i = 0; i < fluidData.height; i++) {
		fluidData.fluid_array[i] = new Array(fluidData.length_stage);
		for (let j = 0; j < fluidData.length; j++) {
			if (i === 0)
				fluidData.fluid_array[i][j] = {z: 0, isFloor: 1};

			else if (mapData.heat_map[j / mapData.size_map][j % size_map].z < i)
				fluidData.fluid_array[i][j] = {z: i, isEmpty: 1};
				
				// is empty, wait for water
			else if (mapData.heat_map[j / mapData.size_map][j % size_map].z < i + 1)
				fluidData.fluid_array[i][j] = compute_wall_normal();
				// is wall
			else
				// is full terrain
				fluidData.fluid_array[i][j] = { isTerrain: 1 };
		}
	}


	fluidData.fluid_array[0] = new_fluid_cube();
}


function generate_water(mapData, fluidData, waterPolyData) {
	allocate_water_grid(mapData, fluidData);
	console.log(fluidData.fluid_array);
	compute_water_step(mapData, fluidData);
	display_water(fluidData, waterPolyData);
}

export default generate_water;
