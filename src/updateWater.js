import {Ball, Vector3} from './SPH2.js'

function add_ball(fluiData) {
	let v3 = new Vector3(10, 10, 10); 
	let vel = 0;
	let mass = 0;

	let waterDroplet = new Ball(v3, v3, 1, vel, mass);
	
}

function update_water(fluidData) {
	//console.log('TBD', fluidData);
}

export default update_water;
