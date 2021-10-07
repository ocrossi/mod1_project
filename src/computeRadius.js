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
		min = bounds[i] < min ? bounds[i] : min;
	}
	/*
	for (let i = 0; i < mapData.closest_points[index].length; i++) {
		let dist = mapData.closest_points[index][i].dist;
		min = (dist < min) ? Math.round(dist) : min;
	}
	*/
	radius = radius > min ? min : radius;
	//console.log('conprends po', radius);
	return radius;
}



// i_r for index reference, i_c c for comparaison, icp for index closest_points
function modify_radius(i_r, i_c, i_cp, mapData, height) {
	//console.log('beginning of modify_radius');
	let r_x = mapData.points[i_r][0];
	let r_y = mapData.points[i_r][1];
	let c_x = mapData.points[i_c][0];
	let c_y = mapData.points[i_c][1];
	let cradius = mapData.points[i_r][2];

	//console.log('height : ', height);
	if (height > mapData.points[i_c][2]) {
		console.log("radius too big");
		while (cradius > 1) {
			cradius--;
			let c_height =
				(Math.pow(cradius, 2) -
					(Math.pow(r_x - c_x, 2) + Math.pow(r_y - c_y, 2))) *
				(cradius / Math.pow(cradius, 2));
			if (c_height < mapData.points[i_c][2]) {
				cradius--;
				mapData.closest_points[i_r][i_cp].radius = cradius;
				return;
			}
		}
	} else if (height < mapData.points[i_c][2]) {
		console.log("radius too small");
		console.log("height :", height);
		console.log("input height :", mapData.points[i_c][2]);
		while (1) {
			cradius++;
			let c_height =
				(Math.pow(cradius, 2) -
					(Math.pow(r_x - c_x, 2) + Math.pow(r_y - c_y, 2))) *
				(cradius / Math.pow(cradius, 2));
			if (c_height > mapData.points[i_c][2]) {
				cradius--;
				cradius = check_bounds(cradius, i_r, mapData);
				console.log("CRADIUS CON DE TA M", cradius);
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

function check_bounds2(index, mapData) {
	let bounds = [
		mapData.points[index][0],
		mapData.points[index][1],
		mapData.size_map - mapData.points[index][0],
		mapData.size_map - mapData.points[index][1],
	];
	//console.log('bounds', bounds);
	let min = mapData.size_map;

	for (let i = 0; i < 4; i++) {
		min = bounds[i] < min ? bounds[i] : min;
	}
	return min;
}



function increase_radius(radius, i_current, mapData) {
	let bound = check_bounds2(i_current, mapData);
	while (radius < 5 * radius && radius < bound) radius++;
	console.log('radius end of increase_radius : ', radius);
	console.log('ah et index current : ', i_current);
	return  radius;
}

function decrease_radius(radius, i_current, i_comp, height, coords, mapData) {
	let threshold = mapData.points[i_comp][2];
	let factor = radius / Math.pow(radius, 2);

	while (height > threshold) {
		height =
			(Math.pow(radius, 2) -
			(Math.pow(coords[0] - coords[2], 2) +
				Math.pow(coords[1] - coords[2], 2))) * factor;
		radius--;
		console.log('height', height);
		console.log('threshold', threshold);
		console.log('factor', factor);
	}
	radius -= 6;
	console.log('end of decrease_radius radius : ', radius);
	console.log('ah et index current : ', i_current);
	return radius;
}

function modify_radius2(i_current, i_comp, mapData) {
	let radius = mapData.points[i_current][2];
	let coords = [
		mapData.points[i_current][0],
		mapData.points[i_current][1],
		mapData.points[i_comp][0],
		mapData.points[i_comp][1],
	];
	let factor = radius / Math.pow(radius, 2);
	let height =
		(Math.pow(radius, 2) -
			(Math.pow(coords[0] - coords[2], 2) +
				Math.pow(coords[1] - coords[2], 2))) *
		factor;

	let nradius = 0;
	if (height <= mapData.points[i_comp][2]) {
		nradius = increase_radius(radius, i_current, mapData);
		console.log('radius end of increase_radius : ', nradius);
		console.log('ah et index current : ', i_current);
	}
	else nradius = decrease_radius(radius, i_current, i_comp, height, coords, mapData);
	for (let i = 0; i < mapData.closest_points[i_current].length; i++) {
		if (mapData.closest_points[i_current][i].idx === i_comp) var i_radius = i;
	}
	console.log('before', mapData.closest_points[i_current][i_radius].radius);
	mapData.closest_points[i_current][i_radius].radius = nradius;
	console.log('after', mapData.closest_points[i_current][i_radius].radius);
	console.log(i_radius);
	console.log(mapData.closest_points[i_current]);
}

function compute_radius(index, mapData) {
	//console.log('hehe', mapData.closest_points);
	let base_radius = mapData.points[index][2];
	let factor = base_radius / Math.pow(base_radius, 2);
	let r_x = mapData.points[index][0];
	let r_y = mapData.points[index][1];
	let nradius = 0;

	if (base_radius === 0) {
		mapData.points[index].push(0);
		return;
	}
	for (let i = 0; i < mapData.closest_points[index].length; i++) {
		let idx_closest = mapData.closest_points[index][i].idx;
		//modify_radius2(index, idx_closest, mapData);
		
		let c_x = mapData.points[idx_closest][0];
		let c_y = mapData.points[idx_closest][1];
		let c_height =
			(Math.pow(base_radius, 2) -
			(Math.pow(r_x - c_x, 2) + Math.pow(r_y - c_y, 2))) * factor;
		modify_radius(index, idx_closest, i, mapData, c_height);
		
	}

	nradius = get_smallest_radius(index, mapData);
	console.log("old radius", base_radius);
	console.log("new radius", nradius);
	mapData.points[index].push(nradius);
}

export default compute_radius;
