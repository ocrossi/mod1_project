import { writeSTL } from '@kitware/vtk.js/IO/Geometry/STLWriter';
import {Ball, Vector3} from './SPH2.js'
import * as sphelper from './SPHhelpers.js'



function simulate_water_step2(fluidData, mapData) {
	// limit balls for nezt iteration
	let dt = 0.005; // size of time step

	for (let i = 0; i < fluidData.fluid_array.length; ++i) {
		let cp = fluidData.fluid_array[i]; // cp --> current ball

		let begin = new Vector3(cp.position);
		// part 1 : forces & numerical integration
		let mass = cp.mass;
		/* Gravitational Force = mass * Constant * Direction */
		let g = new Vector3(0, 0, -1);
		let gravity = g.scale(mass * 0.0981 / 2);
		/** F will be a vector of all of our forces added together. */
		let totalForce = new Vector3(gravity.x, gravity.y, gravity.z);
		/** F = ma <===> Acceleration = Force / Mass. */
		let accel = totalForce.divide_scalar(mass);
		/** Verlet Integration */
		//console.log('before verlet pos : ', cp.pos);
		//console.log('before verlet oldpos : ', cp.old_pos);
		let temp = new Vector3(cp.pos.x, cp.pos.y, cp.pos.z);
		cp.pos = sphelper.compute_verlet_integration(cp.pos, cp.old_pos, accel, dt);
		//cp.pos = cp.pos.subtract(cp.old_pos.add(accel.multiply_this(dt * dt))); // comment c moche
		//cp.pos = cp.pos.scale_this(2).subtract(cp.old_position.add(accel.multiply_this(dt * dt))); // comment c moche
		cp.old_pos = temp;

		//console.log('after verlet pos : ', cp.pos);

		/** part 2 : CONSTRAINT RELAXATION */

		/**
			We would like to satisfy that balls that are close will collide. We 
			can enforce this by assuring that the distance between two centers
			is never less than the sum of their radii. Otherwise, they'd be intersecting!
		*/
		/*
		for (let j = 0; j < fluidData.fluid_array.length; ++j) {
			//console.log('mes couilles en ski') // a faire av plusieurs balls
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
		let bounds_z = sphelper.bounds_z([cp.pos.x, cp.pos.y], mapData);
		cp.pos.x = Math.min(Math.max(cp.pos.x, bounds_x[0] + cp.radius), bounds_x[1] - cp.radius);
		cp.pos.y = Math.min(Math.max(cp.pos.y, bounds_y[0] + cp.radius), bounds_y[1] - cp.radius);
		cp.pos.z = Math.min(Math.max(cp.pos.z, bounds_z[0] + cp.radius), bounds_z[1] - cp.radius);
	}
}

function simulate1(fluidData, mapData) {
	let ts = 0.01;

	for (let i = 0; i < fluidData.fluid_array.length; i++) {
		let cp = fluidData.fluid_array[i];

		let force = new Vector3(0, 0, -1); // direction of gravity
		//let mass = 1;

		force.scale_this(cp.mass * 0.981); // mass * gravity strength
		//console.log('force after g', force);
		// A little freebie: We'd also like to add some resistance to our system. We can 
		// create a "damping" force that acts in the direction opposite of our motion.
		//let vel = new (p.pos - p.old_pos) / h;		
		let vel = cp.pos.subtract(cp.old_pos);
		//console.log('vel', vel);
		vel.divide_scalar(ts);

		// Add our damping force
		let damp =  1;
		vel.scale_this(-damp);
		force.add_to_this(vel);

		//console.log('force 2', force);
		// Acceleration
		let accel = force.divide_scalar(cp.mass);

		//console.log('force 3', force);
		//console.log('vel', vel);
		//console.log('acce;', accel);
		// Use Verlet to movce the particle forward in time.
		// We have to store the current position like this
		// So that we can update the "old position" correctly afterwards.
		let temp = new Vector3(cp.pos.x, cp.pos.y, cp.pos.z);
		cp.pos = sphelper.compute_verlet_integration(cp.pos, cp.old_pos, accel, ts);
	
		//console.log('after verlet');
		//console.log(cp.pos);

		cp.old_pos = temp;
		//console.log()

		cp.vel = new Vector3(vel.x, vel.y, vel.z);
		let bounds_xy = [0, mapData.size_world];
		let bounds_z = sphelper.bounds_z(cp.pos.x, cp.pos.y, mapData);
		//console.log('boundsx', bounds_xy);
		//console.log('boundsy', bounds_xy);
		//console.log('boundsz', bounds_z);
	//	cp.pos.x = Math.max(Math.min(cp.pos.x, bounds_xy[1] + cp.radius), bounds_xy[0] - cp.radius);
	//	cp.pos.y = Math.max(Math.min(cp.pos.y, bounds_xy[1] + cp.radius), bounds_xy[0] - cp.radius);
	//	cp.pos.z = Math.max(Math.min(cp.pos.z, bounds_z[1] + cp.radius), bounds_z[0] - cp.radius);
		cp.pos.x = Math.max(cp.pos.x, bounds_xy[0] + cp.radius);
		cp.pos.y = Math.max(cp.pos.y, bounds_xy[0] + cp.radius);
		cp.pos.z = Math.max(cp.pos.z, bounds_z[0] + cp.radius);

		//console.log('end of  loop in simulate 1 :');
		//console.log(cp.pos);
		//console.log(cp.old_pos);
		//console.log(cp.vel);
		//console.log(cp.radius);
		//console.log(cp.mass);

	}
}

function update_water(fluidData, mapData) {
	//console.log('TBD', fluidData);
	//simulate_water_step(fluidData, mapData);
	simulate1(fluidData, mapData);

	//console.log('after simulate water step nb ', fluidData.anim_time);
	//console.log(fluidData.fluid_array[0]);
	//console.log(fluidData.fluid_array[0].pos);
	//console.log(fluidData.fluid_array[0].old_pos);

}

export default update_water;
