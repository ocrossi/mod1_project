import sort_closest_points from "./sortClosestPoint.js";

function compute_height(coords, radius, c_factor) {
	return (
		(Math.pow(radius, 2) -
			(Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2))) 
		* c_factor 
	);
}

function decrease_radius(point_ref, max_height, coords, mapData) {
	let r = mapData.points[point_ref][2] - 1;
	let c_factor = 0;
	let i = 1;
	
	while (r > 1) {
		r--;
		if (mapData.points[point_ref][2] < Math.pow(r, 2))
			i++;
		c_factor = (r + i) / Math.pow(r, 2);
		let c_height = compute_height(coords, r, c_factor);
		if (c_height < max_height) break;
	}	
	return [r, c_factor];
}

function check_bounds(index, mapData) {
	let bounds = [
		mapData.points[index][0],
		mapData.points[index][1],
		mapData.size_map - mapData.points[index][0],
		mapData.size_map - mapData.points[index][1],
	];
	let min = mapData.size_map;

	for (let i = 0; i < 4; i++) {
		min = bounds[i] < min ? bounds[i] : min;
	}
	return min;
}

function increase_radius(point_ref, coords, mapData) {
	console.log('INCREASE RADIUS ALGO CLASSIQUE');
	let r = mapData.points[point_ref][2];
	let bound = check_bounds(point_ref, mapData);
	let c_factor = 1;

	while (r < bound - 1 && r < mapData.closest_points[point_ref][0].dist - 1)
		r++;
	c_factor = mapData.points[point_ref][2] / Math.pow(r, 2);
	return [r, c_factor];
}

function modify_radius(point_ref, idx_closest_tab, point_comp, mapData) {
	let radius = mapData.points[point_ref][2];
	let coords = {
		x_comp: mapData.points[point_comp][0],
		y_comp: mapData.points[point_comp][1],
		x_ref: mapData.points[point_ref][0],
		y_ref: mapData.points[point_ref][1],
	};
	let normalisation_factor = radius === 0 ? 1 : radius / Math.pow(radius, 2);
	let height =
		(Math.pow(radius, 2) -
			(Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2)))
		* normalisation_factor; // height of current hill at (x,y) for comp point
	let max_height = mapData.points[point_comp][2] - 1;
	let res = 0;
	if (height > max_height) {
	res = decrease_radius(
			point_ref,
			max_height,
			coords,
			mapData
		)
	}
	else res = increase_radius(point_ref, coords, mapData);	
	mapData.closest_points[point_ref][idx_closest_tab].radius = res[0];
	mapData.closest_points[point_ref][idx_closest_tab].factor = res[1];
}

function get_smallest_radius(index, mapData) {
	let radius = mapData.size_map;
	let factor = 1;

	for (let i = 0; i < mapData.closest_points[index].length; i++) {
		let cradius = mapData.closest_points[index][i].radius;
		if (radius > cradius && cradius !== -1) {
			radius = cradius;
			factor = mapData.closest_points[index][i].factor;
		}
	}
	return [radius, factor];
}


function compute_biggest_radius(mapData) {
	for (let i = 0; i < mapData.points.length; i++) {
		for (let j = 0; j < mapData.closest_points[0].length; j++) {
			let idx_comp = mapData.closest_points[i][j].idx;
			modify_radius(i, j, idx_comp, mapData);
		}
		let res = get_smallest_radius(i, mapData);
		mapData.points[i].push(res[0]);
		mapData.points[i].push(res[1]);
	}
}

// check each hill with its surroundings to determine a radius that avoids overlap
// on other input points
function compute_hills_size(mapData) {
	if (mapData.points.length === 1) {
		let factor = mapData.points[0][2] / Math.pow(mapData.points[0][2], 2);
		mapData.points[0].push(mapData.points[0][2]);
		mapData.points[0].push(factor);
		return;
	}
	mapData.closest_points = sort_closest_points(mapData);
	compute_biggest_radius(mapData);
	if (mapData.size_map % 2 === 1)
		mapData.size_map++;
}

export default compute_hills_size;
