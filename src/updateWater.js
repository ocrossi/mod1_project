import {Ball, Vector3} from './SPH2.js'
import * as sphelper from './SPHhelpers.js'



function simulate_water_step(fluidData, mapData) {
	// limit balls for nezt iteration
	let dt = 0.005; // size of time step

	for (let i = 0; i < fluidData.fluid_array.length; ++i) {
		let cb = fluidData.fluid_array[i]; // cb --> current ball

		let begin = new Vector3(cb.position);
		// part 1 : forces & numerical integration
		let mass = cb.mass;
		/* Gravitational Force = mass * Constant * Direction */
		let g = new Vector3(0, 0, -1);
		let gravity = g.scale(mass * 0.0981 / 2);
		/** F will be a vector of all of our forces added together. */
		let totalForce = new Vector3(gravity.x, gravity.y, gravity.z);
		/** F = ma <===> Acceleration = Force / Mass. */
		let accel = totalForce.divide_scalar(mass);
		/** Verlet Integration */
		//console.log('before verlet pos : ', cb.pos);
		//console.log('before verlet oldpos : ', cb.old_pos);
		let temp = new Vector3(cb.pos.x, cb.pos.y, cb.pos.z);
		cb.pos = sphelper.compute_verlet_integration(cb.pos, cb.old_pos, accel, dt);
		//cb.pos = cb.pos.subtract(cb.old_pos.add(accel.multiply_this(dt * dt))); // comment c moche
		//cb.pos = cb.pos.scale_this(2).subtract(cb.old_position.add(accel.multiply_this(dt * dt))); // comment c moche
		cb.old_pos = temp;

		//console.log('after verlet pos : ', cb.pos);

		/** part 2 : CONSTRAINT RELAXATION */

		/**
			We would like to satisfy that balls that are close will collide. We 
			can enforce this by assuring that the distance between two centers
			is never less than the sum of their radii. Otherwise, they'd be intersecting!
		*/
		/*
		for (let j = 0; j < fluidData.fluid_array.length; ++j) {
			console.log('mes couilles en ski') // a faire av plusieurs balls
			if (i === j)
				continue;
		//	let comp_ball = fluidData.fluid_array[j];
			//	let cpb // cpb ---> comp ball
		}*/
		/** 
			Now we can enforce the constraint that particles are within the world
			by making sure their current position is projected onto the boundary
			if they are outside. 
		*/
		let bounds_x = [0, mapData.size_world];
		let bounds_y = [0, mapData.size_world];
		let bounds_z = sphelper.bounds_z([cb.pos.x, cb.pos.y], mapData);
		cb.pos.x = Math.min(Math.max(cb.pos.x, bounds_x[0] + cb.radius), bounds_x[1] - cb.radius);
		cb.pos.y = Math.min(Math.max(cb.pos.y, bounds_y[0] + cb.radius), bounds_y[1] - cb.radius);
		cb.pos.z = Math.min(Math.max(cb.pos.z, bounds_z[0] + cb.radius), bounds_z[1] - cb.radius);
	}
}

function update_water(fluidData, mapData) {
	//console.log('TBD', fluidData);
	simulate_water_step(fluidData, mapData);

	console.log('after simulate water step nb ', fluidData.anim_time);
	console.log(fluidData.fluid_array[0].pos);
	console.log(fluidData.fluid_array[0].old_pos);

}

export default update_water;
