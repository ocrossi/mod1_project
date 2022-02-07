import {Neighbor, Particle, Vector3} from './SPH2.js'
import * as sphelper from './SPHhelpers.js'

function compute_gravity(cp) {
	let force = new Vector3(0, 0, -1); // direction of gravity

	force.scale_this(cp.mass * 0.981);
	return force;
}

function simulate1(fluidData, mapData) {
	let ts = 0.01;

	for (let i = 0; i < fluidData.fluid_array.length; i++) {
		let cp = fluidData.fluid_array[i];

		let force = compute_gravity(cp);
 // mass * gravity strength
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

		// Acceleration
		let accel = force.divide_scalar(cp.mass);

		//console.log('force 3', force);
		//console.log('vel', vel);
		//console.log('acce;', accel);
		// Use Verlet to movce the particle forward in time.
		// We have to store the current position like this
		// So that we can update the "old position" correctly afterwards.
		let temp = new Vector3(cp.pos.x, cp.pos.y, cp.pos.z);
		sphelper.compute_verlet_integration(cp.pos, cp.old_pos, accel, ts);
	
		//console.log('after verlet');
		//console.log(cp.pos);

		cp.old_pos = temp;
		//console.log()

		cp.vel = new Vector3(vel.x, vel.y, vel.z);
		let bounds_xy = [0, mapData.size_world];
		//console.log('boundsx', bounds_xy);
		//console.log('boundsy', bounds_xy);
		//console.log('boundsz', bounds_z);
	//	cp.pos.x = Math.max(Math.min(cp.pos.x, bounds_xy[1] + cp.radius), bounds_xy[0] - cp.radius);
	//	cp.pos.y = Math.max(Math.min(cp.pos.y, bounds_xy[1] + cp.radius), bounds_xy[0] - cp.radius);
	//	cp.pos.z = Math.max(Math.min(cp.pos.z, bounds_z[1] + cp.radius), bounds_z[0] - cp.radius);
		//cp.pos.y = Math.max(Math.min(cp.pos.y, bounds_xy[1] - cp.radius), bounds_xy[0] + cp.radius);
		cp.pos.x = Math.floor(Math.min(Math.max(cp.pos.x, bounds_xy[0] + 1), bounds_xy[1] - 1));
		cp.pos.y = Math.floor(Math.min(Math.max(cp.pos.y, bounds_xy[0] + 1), bounds_xy[1] - 1));
		let bounds_z = sphelper.bounds_z(cp.pos.x, cp.pos.y, mapData);
		cp.pos.z = Math.max(cp.pos.z, bounds_z[0] + cp.radius);

		//console.log('end of  loop in simulate 1 :');
		//console.log(cp.pos);
		//console.log(cp.old_pos);
		//console.log(cp.vel);
		//console.log(cp.radius);
		//console.log(cp.mass);

	}
}

function quick_sqrt(a, x) {
	return (x + (a - x*x) / (2*x))
}

function simulate2(fluidData, mapData) { // eclate
	// limit balls for next iteration
	let dt = 0.005; // size of time step

	for (let i = 0; i < fluidData.fluid_array.length; ++i) {
		let cp = fluidData.fluid_array[i]; // cp --> current ball

		let begin = new Vector3(cp.pos.x, cp.pos.y, cp.pos.z);
		// part 1 : forces & numerical integration
		let mass = 2;
		cp.mass = mass; //mmouais
		/* Gravitational Force = mass * Constant * Direction */
		let force = compute_gravity(cp);
		force.divide_scalar_this(2); //apparament sa div par 2 ici jsp pq		
		//let g = new Vector3(0, 0, -1);
		//let gravity = g.scale(mass * 0.0981 / 2);
		/** F will be a vector of all of our forces added together. */
		let tF = new Vector3(force.x, force.y, force.z);
		/** F = ma <===> Acceleration = Force / Mass. */
		let accel = tF.divide_scalar(mass);
		/** Verlet Integration */
		let temp = new Vector3(cp.pos.x, cp.pos.y, cp.pos.z);
		cp.pos = sphelper.compute_verlet_integration(cp.pos, cp.old_pos, accel, dt);
		cp.old_pos = temp;

		/** part 2 : CONSTRAINT RELAXATION */

		/**
			We would like to satisfy that balls that are close will collide. We 
			can enforce this by assuring that the distance between two centers
			is never less than the sum of their radii. Otherwise, they'd be intersecting!
		*/

		for (let j = 0; j < fluidData.fluid_array.length; ++j) {
			if (i === j)
				continue; // a particle doesnt interact with itself
			//console.log('cp', cp);
			let op = fluidData.fluid_array[j]; // other particle
			let delta = cp.pos.subtract(op.pos);
			let dist2 = delta.magnitude_squared();
			let radii = cp.radius + op.radius;
			let radii2 = radii * radii;
			if (dist2 <  radii2) {
				let mass_tot = op.mass + cp.mass;
				/** This is the actual distance between the two balls. */
				// Optimization using the taylor series expansion.
				let dist = quick_sqrt(dist2, radii);
				// float dist = sqrt(dist2); // This is the slower, yet more correct line.

				/** We will move them both half the penetration depth away from each other. */
				let penetration = radii - dist;
				let proj_dist = penetration * 0.5;

				/** Perform the before mentioned moving along the vector between the two. */
				//Vec2 move = delta / dist * proj_dist;
				let move = delta.divide_scalar(dist * proj_dist);
				
				// Mass-Weighted correction. (Small balls hitting a big ball has little effect)
				move.scale_this(1 - cp.mass / mass_tot);

				cp.pos = move.add(cp.pos);
				op.pos = move.subtract(op.pos);
			}
		}

		/** 
			Now we can enforce the constraint that fluidData.fluid_array are within the world
			by making sure their current position is projected onto the boundary
			if they are outside. 
		*/
		let bounds_xy = [0, mapData.size_world];
		cp.pos.x = Math.floor(Math.min(Math.max(cp.pos.x, bounds_xy[0] + 1), bounds_xy[1] - 1));
		cp.pos.y = Math.floor(Math.min(Math.max(cp.pos.y, bounds_xy[0] + 1), bounds_xy[1] - 1));
		let bounds_z = sphelper.bounds_z(cp.pos.x, cp.pos.y, mapData);
		cp.pos.z = Math.max(cp.pos.z, bounds_z[0] + cp.radius);

	}
}

let G = 0.2 * 0.25;						// gravitationnal constant?
let spacing = 2;							// Spacing of fluidData.fluid_array
let k  = spacing / 1000;			// Far pressure weight
let k_near = k * 10;					// Near pressure weight
let rest_density = 3;					// Rest density
let r = spacing * 1.25;				// Radius of support
let rsq = r*r;





function simulate3(fluidData, mapData) {
// UPDATE
	//
	// This modified verlet integrator has dt = 1 and calculates the velocity
	// For later use in the simulation. 

	// For each fluidData.fluid_array i ...
	for(let i = 0; i < fluidData.fluid_array.length; ++i)
	{
		// Normal verlet stuff
		fluidData.fluid_array[i].old_pos = fluidData.fluid_array[i].pos;
		fluidData.fluid_array[i].pos += fluidData.fluid_array[i].vel;

		// Apply the currently accumulated forces
		fluidData.fluid_array[i].pos += fluidData.fluid_array[i].force;

		// Restart the forces with gravity only. We'll add the rest later.
		fluidData.fluid_array[i].force = new Vector3(0, 0, -G);

		// Calculate the velocity for later.
		fluidData.fluid_array[i].vel = fluidData.fluid_array[i].pos - fluidData.fluid_array[i].old_pos;

		// If the velocity is really high, we're going to cheat and cap it.
		// This will not damp all motion. It's not physically-based at all. Just
		// a little bit of a hack.
		let max_vel = 2;
		let vel_mag = fluidData.fluid_array[i].vel.len2();
		// If the velocity is greater than the max velocity, then cut it in half.
		if(vel_mag > max_vel*max_vel)
			fluidData.fluid_array[i].vel = fluidData.fluid_array[i].vel.scale_this(0.5);

		// If the particle is outside the bounds of the world, then
		// Make a little spring force to push it back in.
		if(fluidData.fluid_array[i].pos.x < 0) fluidData.fluid_array[i].force.x -= (fluidData.fluid_array[i].pos.x) / 8;
		if(fluidData.fluid_array[i].pos.x >  mapData.size_world) fluidData.fluid_array[i].force.x -= (fluidData.fluid_array[i].pos.x - mapData.size_world) / 8;
		if(fluidData.fluid_array[i].pos.y < 0) fluidData.fluid_array[i].force.y -= (fluidData.fluid_array[i].pos.y) / 8;
		if(fluidData.fluid_array[i].pos.y > mapData.size_world) fluidData.fluid_array[i].force.y -= (fluidData.fluid_array[i].pos.y - mapData.size_world * 2) / 8;

		if (fluidData.fluid_array[i].pos.z < 0) fluidDatafluid_array[i].pos.z = 0; // a revoir pour les bounds z axis
		// Handle the mouse attractor. 
		// It's a simple spring based attraction to where the mouse is.
		// 
		 /*
		float attr_dist2 = (fluidData.fluid_array[i].pos - attractor).len2();
		const float attr_l = SIM_W/4;
		if( attracting )
			if( attr_dist2 < attr_l*attr_l )
				fluidData.fluid_array[i].force -= (fluidData.fluid_array[i].pos - attractor) / 256;
	
		*/
		// Reset the nessecary items.
		fluidData.fluid_array[i].rho = fluidData.fluid_array[i].rho_near = 0;
		fluidData.fluid_array[i].neighbors = [];
	}
    
	// DENSITY 
	//
	// Calculate the density by basically making a weighted sum
	// of the distances of neighboring fluidData.fluid_array within the radius of support (r)

	// For each particle ...
	for(let i=0; i < fluidData.fluid_array.length; ++i)
	{
		fluidData.fluid_array[i].rho = fluidData.fluid_array[i].rho_near = 0;

		// We will sum up the 'near' and 'far' densities.
		let d = 0;
		let dn = 0;

		// Now look at every other particle
		for(let j=0; j < fluidData.fluid_array.length; ++j)
		{
			// We only want to look at each pair of fluidData.fluid_array just once. 
			// And do not calculate an interaction for a particle with itself!
			if(j >= i) continue;

			// The vector seperating the two fluidData.fluid_array
			let rij = fluidData.fluid_array[j].pos.subtract(fluidData.fluid_array[i].pos);

			// Along with the squared distance between
			let rij_len2 = rij.magnitude_squared();            

			// If they're within the radius of support ...
			if(rij_len2 < rsq)
			{
				// Get the actual distance from the squared distance.
				let rij_len = Math.sqrt(rij_len2);

				// And calculated the weighted distance values
				let q = 1 - rij_len / r;
				let q2 = q*q;
				let q3 = q2*q;

				d += q2;
				dn += q3;

				// Accumulate on the neighbor
				fluidData.fluid_array[j].rho += q2;
				fluidData.fluid_array[j].rho_near += q3;

				// Set up the neighbor list for faster access later.
				let n = new Neighbor();
				n.i = i; 
				n.j = j;
				n.q = q; 
				n.q2 = q2;              
				fluidData.fluid_array[i].neighbors.push_back(n);
			}
		}

		fluidData.fluid_array[i].rho        += d;
		fluidData.fluid_array[i].rho_near   += dn;
	}

	// PRESSURE
	//
	// Make the simple pressure calculation from the equation of state.
	for(let i = 0; i < fluidData.fluid_array.length; ++i)
	{
		fluidData.fluid_array[i].press = k * (fluidData.fluid_array[i].rho - rest_density);
		fluidData.fluid_array[i].press_near = k_near * fluidData.fluid_array[i].rho_near;
	}

	// PRESSURE FORCE
	//
	// We will force fluidData.fluid_array in or out from their neighbors
	// based on their difference from the rest density.

	// For each particle ...
	for(let i=0; i < fluidData.fluid_array.length; ++i)
	{
		let dX = new Vector3();

		// For each of the neighbors
		let ncount = fluidData.fluid_array[i].neighbors.length;
		for(let ni=0; ni < ncount; ++ni)
		{
			let cn = fluidData.fluid_array[i].neighbors[ni];
			let n = new Neighbor(cn.i, cn.j, cn.q1, cn.q2);
			let j = n.j;
			let q = n.q;
			let q2 = n.q2;       

			// The vector from particle i to particle j
			let rij = fluidData.fluid_array[j].pos.subtract(fluidData.fluid_array[i].pos);

			// calculate the force from the pressures calculated above
			let dm = (fluidData.fluid_array[i].press + fluidData.fluid_array[j].press) * q +
				(fluidData.fluid_array[i].press_near + fluidData.fluid_array[j].press_near) * q2;

			// Get the direction of the force
			let nl = rij.normal();
			let D =  nl.scale(dm);
			dX.add_to_this(D);
			fluidData.fluid_array[j].force.add_to_this(D);
		}

		fluidData.fluid_array[i].force.subtract_to_this(dX);
	}

	// VISCOSITY
	//
	// This simulation actually may look okay if you don't compute 
	// the viscosity section. The effects of numerical damping and 
	// surface tension will give a smooth appearance on their own.
	// Try it.

	// For each particle
	for(let i=0; i < fluidData.fluid_array.length; ++i)
	{
		// For each of that fluidData.fluid_array neighbors
		for(let ni=0; ni < fluidData.fluid_array[i].neighbors.length; ++ni)
		{
			let cn = fluidData.fluid_array[i].neighbors[ni];
			let n = new Neighbor(cn.i, cn.j, cn.q1, cn.q2);

			let rij = fluidData.fluid_array[n.j].pos.subtract(fluidData.fluid_array[i].pos);
			let l = rij.distance_from(rij);
			let q = l / r;

			let rijn = rij.divide_scalar(l);
			// Get the projection of the velocities onto the vector between them.
			let tempu = fluidData.fluid_array[n.i].vel.multiply(fluidData.fluid_array[n.j].vel);
			let u = tempu.multiply(rijn);
			if(u > 0)
			{
				// Calculate the viscosity impulse between the two fluidData.fluid_array
				// based on the quadratic function of projected length
				let t1 = u.multiply(fluidData.fluid_array[n.j].sigma);
				let usq = u.multiply(u);
				let t2 = usq.multiply(fluidData.fluid_array[n.j].beta);
				t2.add_to_this(t1);
				t2.scale_this(1 - q);
				let I = t2.multiply(rijn);
				
				// Apply the impulses on the two fluidData.fluid_array
				I.scale_this(0.5);
				fluidData.fluid_array[n.i].vel.subtract_to_this(I);
				fluidData.fluid_array[n.j].vel.add_to_this(I);
			}

		}
	}
}


function update_water(fluidData, mapData) {
	//console.log('TBD', fluidData);
	//simulate1(fluidData, mapData);
	simulate2(fluidData, mapData);

	//console.log('after simulate water step nb ', fluidData.anim_time);
	//console.log(fluidData.fluid_array[0]);
	//console.log(fluidData.fluid_array[0].pos);
	//console.log(fluidData.fluid_array[0].old_pos);

}

export default update_water;
