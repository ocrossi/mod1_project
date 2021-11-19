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

export {new_fluid_cube, fluid_cube_add_velocity, fluid_cube_add_density};

