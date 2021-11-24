import {new_fluid_cube, display_water} from './fluidUtilities.js'
import compute_water_step from './computeWaterMovement.js'; 

function allocate_water_grid(mapData, fluidData) {
	fluidData.height = mapData.points[mapData.points.length - 1][2];
	fluidData.length = mapData.size_map;

	fluidData.fluid_array = new Array(fluidData.length * fluidData.length * fluidData.height);
	fluidData.fluid_array[0] = new_fluid_cube();
}


function generate_water(mapData, fluidData, waterPolyData) {
	allocate_water_grid(mapData, fluidData);
	console.log(fluidData.fluid_array);
	compute_water_step(mapData, fluidData);
	display_water(fluidData, waterPolyData);
}

export default generate_water;
