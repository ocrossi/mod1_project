import {Ball, Vector3} from './SPH2.js'


function get_rand11() {
	return 2 * Math.random() - 1;
}

function init_particle_pos(mapData, n) {
	let pos = new Vector3(Math.round(mapData.size_world / (n + 1)), Math.round(mapData.size_world / (n + 1)), 20);
	let old_pos = new Vector3(pos.x, pos.y, pos.z);
	let ball = new Ball(pos, old_pos, 1, 0, 10);
	return (ball);
}

export function add_n_droplet(fluidData, mapData, n) {
	for (let i = 0; i < n; i++) {
		let waterDroplet = init_particle_pos(mapData, i);
		console.log('wD', waterDroplet);
		fluidData.fluid_array.push(waterDroplet);
	}

	fluidData.droplets.setNumberOfPoints(n);
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
