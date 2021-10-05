function check_bounds(radius, index, mapData) {
	let bounds = [
		mapData.points[index][0],
		mapData.points[index][1],
		mapData.size_map - mapData.points[index][0],
		mapData.size_map - mapData.points[index][1],
	];
	//console.log('bounds', bounds);
	let min = mapData.size_map;

	for (let i = 0; i < 4; i++) {
		min = (bounds[i] < min) ? bounds[i] : min;
	}
	radius = (radius > min) ? min : radius;
	//console.log('conprends po', radius);
	return radius;
}

// r for reference c for comparaison, icp for index closest_points
function modify_radius(i_r, i_c, i_cp, mapData, height) {
	//console.log('beginning of modify_radius');
	let r_x = mapData.points[i_r][0];
	let r_y = mapData.points[i_r][1];
	let c_x = mapData.points[i_c][0];
	let c_y = mapData.points[i_c][1];
	let cradius = mapData.points[i_r][2];

	//console.log('height : ', height);
	if (height > mapData.points[i_c][2]) {
		console.log('radius too big');
		while (cradius > 0) {
			cradius--;
			let c_height =
				(Math.pow(cradius, 2) -
				(Math.pow(r_x - c_x, 2) + Math.pow(r_y - c_y, 2))) * (cradius / Math.pow(cradius, 2));
			if (c_height < mapData.points[i_c][2]) {
				cradius++;
				mapData.closest_points[i_c][i_cp].radius = cradius;
				if (cradius < Math.sqrt(mapData.points[i_r][2])) {
					let test = Math.sqrt(mapData.points[i_r][2]);
					//console.log("AYAAAA", cradius, test);
				}
				return;
			}
		}
	} else if (height < mapData.points[i_c][2]) {
		
		while (1) {
			cradius++;
			let c_height =
				(Math.pow(cradius, 2) -
				(Math.pow(r_x - c_x, 2) + Math.pow(r_y - c_y, 2))) * (cradius / Math.pow(cradius, 2));
			if (c_height  > mapData.points[i_c][2]) {
				cradius = check_bounds(cradius, i_r, mapData);
				//console.log('CRADIUS CON DE TA M', cradius);
				mapData.closest_points[i_r][i_cp].radius = cradius;
				return;
			}
		}
	}
}

function get_smallest_radius(index, mapData) {
	let radius = mapData.size_map;

	for (let i = 0; i < mapData.closest_points[index].length; i++) {
		let cradius = mapData.closest_points[index][i].radius;
		if (radius > cradius && cradius !== -1) {
			radius = cradius;
		}
	}
	return radius;
}

function compute_radius(index, mapData) {
	//console.log('hehe', mapData.closest_points);
	let base_radius = mapData.points[index][2];
	let factor = base_radius / Math.pow(base_radius, 2);
	let r_x = mapData.points[index][0];
	let r_y = mapData.points[index][1];
	let nradius = 0;

	for (let i = 0; i < mapData.closest_points[index].length; i++) {
		let idx_closest = mapData.closest_points[index][i].idx;
		let c_x = mapData.points[idx_closest][0];
		let c_y = mapData.points[idx_closest][1];
		let c_height =
			(Math.pow(base_radius, 2) -
			(Math.pow(r_x - c_x, 2) + Math.pow(r_y - c_y, 2))) * factor;
		modify_radius(index, idx_closest, i, mapData, c_height);
	}
	nradius = get_smallest_radius(index, mapData);
	//console.log('new radius', nradius);
	mapData.points[index].push(nradius);
}

export default compute_radius;
