function fluid_cube_add_density() {}


function fluid_cube_add_velocity() {}

function new_fluid_cube() {
let fluidCube = {
		size: 1,
		// timestep: a voir
		diffusion: 0,
		viscosity: 0,
		density: 0,
	
		temp: new Array(),
		vX:new Array(),
		vY:new Array(),
		vZ:new Array(),
		vX0:new Array(),
		vY0:new Array(),
		vZ0:new Array(),
	};
	return fluidCube;
}

function fluid_cube_get(fluidData, coords) {
	return ;
}

function display_water(fluidData, waterPolyData) {
	let nbPoints = 8;
	let numTriangles = 12;

//	let points = new Float64Array(nbPoints * 3);
		let points = [
			0, 0, 0 + fluidData.anim_time,
			0, 0, 0.5 + fluidData.anim_time,
			0, 0.5, 0 + fluidData.anim_time,
			0, 0.5, 0.5 + fluidData.anim_time,
			0.5, 0, 0 + fluidData.anim_time,
			0.5, 0, 0.5 + fluidData.anim_time,
			0.5, 0.5, 0 + fluidData.anim_time,
			0.5, 0.5, 0.5 + fluidData.anim_time
		];
		console.log(points);

	waterPolyData.getPoints().setData(points, 3);
	//let polys = new Uint32Array(4 * numTriangles);
	
	//let polys = new Uint32Array(4 * numTriangles);
/*
	let polys = [
		4, 1, 2, 6, 5,
		4, 1, 2, 4, 3,
		4, 3, 4, 6, 7,
		4, 5, 6, 8, 7,
		4, 2, 4, 8, 6,
		4, 1, 3, 7, 5,
	];
	*/
	let polys = [
		3, 0, 1, 5,
		3, 0, 5, 4,
		3, 0, 1, 3,
		3, 0, 3, 2,
		3, 2, 3, 7,
		3, 2, 7, 6,
		3, 4, 5, 7,
		3, 7, 4, 6,
		3, 1, 3, 5,
		3, 1, 5, 7,
		3, 0, 2, 4,
		3, 2, 4, 6,
	];
	waterPolyData.getPolys().setData(polys, 1);
}

export {new_fluid_cube, fluid_cube_add_velocity, fluid_cube_add_density, display_water};

