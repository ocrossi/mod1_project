import {Ball, Vector3} from './SPH2.js'


function get_rand11() {
	return 2 * Math.random() - 1;
}

export function add_one_droplet(fluiData, mapData) {
	//let v3 = new Vector3(10, 10, 10); 
	//let vel = 0;
	//let mass = 0;
	//
	let maxr = 0.1;
	let radius = maxr + maxr * (1 - get_rand11() * get_rand11());
	radius *= maxr * 2;
	let mass = 1000 * 2 * Math.PI * Math.pow(radius, 2);

	console.log('powf', Math.pow(radius, 2));

	let pos = new Vector3(10, 10, mapData.highest); // hardcoded for now, we just wanna test physics with 1 ball
	let old_pos = new Vector3(pos.x, pos.y, pos.z);

	let waterDroplet = new Ball(pos, old_pos, radius, 0, mass);
	fluiData.fluid_array.push(waterDroplet);

	console.log('dans add_1_d fluidArr : ', fluiData.fluid_array);
}
