import {Vector3} from './SPH2.js'

export function bounds_z(x, y, mapData) {
	//console.log('x %d  y %d', x, y);
	let ground = mapData.height_map[x][y];
	let ceil = mapData.highest;

	//console.log('ground z : ', ground);
	//console.log('ceil :', ceil);

	return [ground, ceil];
}

export function compute_verlet_integration(pos, old_pos, accel, dt) {
	pos.scale_this(2);
	//console.log('pos1 :', pos);
	//console.log('oldpos1 :', old_pos);
	//pos = pos.subtract_from_this(old_pos);
	pos.subtract_from_this(old_pos);
	//console.log('pos2 :', pos);
	//console.log('accel1 :', accel);
//	accel.scale_this(dt * dt);
//	//console.log('accel2 :', accel);
//	//console.log('pos3 :', pos);
	accel.scale_this(dt * dt);
	pos.add_to_this(accel);
	//console.log('pos4 :', pos);

	//old_pos = new Vector3(temp.x, temp.y, temp.z);
	return pos;
}
