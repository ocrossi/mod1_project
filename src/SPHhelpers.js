import {Vector3} from './SPH2.js'

export function bounds_z(x, y, mapData) {
	//console.log('x', x);
	//console.log('y', y);
	if (x === 0) x++;
	if (y === 0) y++;
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

export function terrain_collision(cp, bounds_z, mapData) {
	if(cp.pos.x < 0) {
		cp.pos.x = 0;
		cp.force.x -= (cp.pos.x) / 8;
	}
	if (cp.pos.x > mapData.size_world) {
		cp.pos.x = mapData.size_world;
		cp.force.x -= (cp.pos.x - mapData.size_world) / 8;
	}
	if(cp.pos.y < 0) {
		cp.pos.y = 0;
		cp.force.y -= cp.pos.y  / 8;
	}
	if(cp.pos.y > mapData.size_world) {
		cp.force.y = mapData.size_world;
		cp.force.y -= (cp.pos.y - mapData.size_world) / 8;
	}
	bounds_z[1] = 20; // temp just for this test

	if (cp.pos.z < bounds_z[0]) {
		let z_sf = cp.pos.z / 8;
		console.count('ca creuse');
		console.log('pos', cp.pos);
		console.log('vel', cp.vel);
		console.log('spring force', z_sf);
		cp.force.z += z_sf;
	}//cp.pos.z = bounds_z[0]; // a revoir pour les bounds z axis
	//if (cp.pos.z > bounds_z[1]) {
	//	console.count('pete le plafond dis');
	//	cp.force.z -= (cp.pos.z - mapData.highest) / 8;
	//}// cp.pos.z = bounds_z[1]; // a revoir pour les bounds z axis

}
