import sort_closest_points from "./sortClosestPoint";
import * as utils from './mapUtils';
import compute_bounds from "./getBoundsMap";

function compute_height(coords, radius, mapData) {
	let height = Math.pow(radius, 2) -
			Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2);

	if (mapData.square_flattening === true)
		height = utils.square_flattening(height, coords, mapData); 
	if (mapData.sigmoid_flattening === true)
		height = utils.sigmoid_flattening(height, coords, mapData); 

	return height;
}

function decrease_radius(radius, coords, threshold, mapData) {
	//console.log('debut de decrease_radius r = ', radius);
	while (radius > 1) {
		radius--;
		let c_height = compute_height(coords, radius, mapData)
		if (c_height < threshold) break;
	}
	//console.log('fin de decrease_radius r = ', radius);
	return radius;
}

function get_biggest_distance(idx, closest_tab) {
	let biggest_dist = 0;

	for (let i = 0; i < closest_tab[0].length; i++) {
		if (closest_tab[idx][i].dist > biggest_dist) {
			biggest_dist = closest_tab[idx][i].dist;
		}
	}
	return  biggest_dist;
}

function increase_radius(radius, coords, max_height, mapData) {
	console.log('INCREASE RADIUS');
	let bound = utils.check_bounds(coords.i_ref, mapData);
	console.log('bound : ', bound);
	
	while (compute_height(coords, radius, mapData) < max_height - 1 && r < bound - 1 ) { // boucle inf
		radius++;
	console.log('radius', radius);
	}
	return radius;
}

function compute_radius(i, j, idx_cmp, closest_tab, mapData) {
	let radius = mapData.points[i][2];
	let coords = {
		x_comp: mapData.points[idx_cmp][0],
		y_comp: mapData.points[idx_cmp][1],
		i_cmp: idx_cmp,
		x_ref: mapData.points[i][0],
		y_ref: mapData.points[i][1],
		i_ref: i,
	};
	let height = compute_height(coords, radius, mapData);
	let max_height = mapData.points[idx_cmp][2] - 1;
	if (height > max_height) {
		radius = decrease_radius(radius, coords, max_height, mapData);
	}
	else {
		let max_radius = get_biggest_distance(i, closest_tab);
		console.log('max radius : ', max_radius);
	//	if (max_radius > radius) // a faire que si bounds map pas atteint
		increase_radius(radius, coords, max_height, mapData);
	}
	closest_tab[i][j].radius = radius;
}

function compute_all_radius(closest_tab, mapData) {
	for (let i = 0; i < mapData.points.length; i++) {
		for (let j = 0; j < closest_tab[0].length; j++) {
			let idx_cmp = closest_tab[i][j].idx;
			compute_radius(i, j, idx_cmp, closest_tab, mapData);
		}
	}
}

function create_map_dimensions(mapData) {
	compute_bounds(mapData);
	if (mapData.points.length === 1) {
		//mapData.size_map = mapData.points[0][2]; // a revoir
		return ;
	}
	// sorts input tab from lowest to highest
	utils.sort_input_tab(mapData);
	// computes each distance from each point omitting z
	let closest = sort_closest_points(mapData);
	compute_all_radius(closest, mapData);
	console.log('end of create_map_dimensions ');
	console.log(closest);
}

export default create_map_dimensions;
