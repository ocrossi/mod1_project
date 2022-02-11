import {Particle, Particle2, Vector3} from './SPH2.js'


function get_rand11() {
	return 2 * Math.random() - 1;
}

function get_rand_int(size) {
	return Math.floor(Math.random() * size);
}

function init_particle_pos(mapData, n) {
	let x = Math.round(mapData.size_world / (n + 1));
	let y = Math.round(mapData.size_world / (n + 1));
	console.log('x', x);
	console.log('y', y);
	let pos = new Vector3(x, y, 20);
	console.log('pos', pos);
	let old_pos = new Vector3(x, y, 20);
	let ball = new Particle(pos, old_pos, 1, 0, 10);
	console.log('ball', ball);
	console.log('ball pos', ball.pos);
	return (ball);
}

function init_particle_pos_rand(mapData) {
	let x = get_rand_int(mapData.size_world);
	let y = get_rand_int(mapData.size_world);
	let pos = new Vector3(
		x,  
		y,  
		20);
	let old_pos = new Vector3(pos.x, pos.y, pos.z);
	let p = new Particle(pos, old_pos, 1, 0, 1);
	return p;
}

function init_particle_pos_rand2(mapData) {
	let x = get_rand_int(mapData.size_world);
	let y = get_rand_int(mapData.size_world);
	let pos = new Vector3(
		x,  
		y,  
		20);
	let old_pos = new Vector3((pos.x + 0.001 * Math.random()),
														(pos.y + 0.001 * Math.random()),
														(pos.z + 0.001 * Math.random()));
	let force = new Vector3(0, 0, 0);
	let vel = new Vector3(0, 0, 0);
	let sigma = 0.1;
	let beta = 0;
	let radius = 1;
	let p = new Particle2(pos, old_pos, vel, force, radius, 1, 0, 0, 0, 0, sigma, beta);
	return p;
}

function init_particle_pos2(mapData, n) {
	let x = Math.round(mapData.size_world / (n + 1));
	let y = Math.round(mapData.size_world / (n + 1));
	let pos = new Vector3(
		x,  
		y,  
		20);
	let old_pos = new Vector3((pos.x + 0.001 * Math.random()),
														(pos.y + 0.001 * Math.random()),
														(pos.z + 0.001 * Math.random()));
	let force = new Vector3(0, 0, 0);
	let vel = new Vector3(0, 0, 0);
	let sigma = 0.1;
	let beta = 0;
	let radius = 1;
	let p = new Particle2(pos, old_pos, vel, force, radius, 1, 0, 0, 0, 0, sigma, beta);
	return p;
}


export function add_rain(fluidData, mapData, intensity) {
	for (let i = 0; i < intensity; i++) {
		let waterDroplet = init_particle_pos_rand(mapData);
		fluidData.fluid_array.push(waterDroplet);
	}
}

export function add_rain2(fluidData, mapData, intensity) {
	for (let i = 0; i < intensity; i++) {
		let waterDroplet = init_particle_pos_rand2(mapData);
		fluidData.fluid_array.push(waterDroplet);
	}
}

export function add_n_droplet2(fluidData, mapData, n) {
	for (let i = 1; i <= n; i++) {
		let waterDroplet = init_particle_pos2(mapData, 2);
		fluidData.fluid_array.push(waterDroplet);
	}
}

export function add_n_droplet(fluidData, mapData, n) {
	for (let i = 1; i <= n; i++) {
		/*
		let waterDroplet = init_particle_pos(mapData, i);
		console.log('wD', waterDroplet);
		console.log('wD pos', waterDroplet.pos);
		fluidData.fluid_array.push(waterDroplet);
		*/
		fluidData.fluid_array.push(init_particle_pos(mapData, i));
	}
	/*
	let maxr = 0.1;
	let radius = maxr + maxr * (1 - get_rand11() * get_rand11());
	radius *= maxr * 2;
	let mass = 1000 * 2 * Math.PI * Math.pow(radius, 2);

	console.log('powf', Math.pow(radius, 2));

	let pos = new Vector3(10, 10, mapData.highest); // hardcoded for now, we just wanna test physics with 1 ball
	let old_pos = new Vector3(pos.x, pos.y, pos.z);

	*/

	console.log('dans add_1_d fluidArr : ', fluidData.fluid_array);
}
