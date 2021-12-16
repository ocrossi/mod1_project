import sort_closest_points from "./sortClosestPoint";
import * as utils from './mapUtils';
import compute_bounds from "./getBoundsMap";

/*
function get_biggest_distance(idx, closest_tab) {
	let biggest_dist = 0;

	for (let i = 0; i < closest_tab[0].length; i++) {
		if (closest_tab[idx][i].dist > biggest_dist) {
			biggest_dist = closest_tab[idx][i].dist;
		}
	}
	return  biggest_dist;
}

function resize_map(mapData) {
	let max_oversize = Math.max(mapData.highest, mapData.size_map);
	let div = 1;

	console.log('max oversize', max_oversize);

	while (max_oversize / div > mapData.resolution_max) {
		div++;
		console.log('div', div);
	}
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] = Math.round(mapData.points[i][0] / div);
		mapData.points[i][1] = Math.round(mapData.points[i][1] / div);
		mapData.points[i][2] = Math.round(mapData.points[i][2] / div);
	}
}
*/

function compute_height(coords, radius, mapData) {
	let nfactor = 1 / radius;
	let height = (Math.pow(radius, 2) -
			Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2)) *  nfactor;

	if (mapData.square_flattening === true)
		height = utils.square_flattening(height, coords, mapData); 
	if (mapData.sigmoid_flattening === true)
		height = utils.sigmoid_flattening(height, coords, mapData); 

	return height;
}
function store_data(closest, mapData) {
	let factor = -1;
	for (let i = 0; i < closest.length; i++) {
		let radius_min = closest[i][0].radius;
		for (let j = 1; j < closest[i].length; j++) {
			if (radius_min > closest[i][j].radius) {
				radius_min = closest[i][j].radius;
				factor = closest[i][j].factor;
			}
		}
		mapData.points[i][3].radius = radius_min;
		mapData.points[i][3].factor = factor;
	}
}

function decrease_radius(radius, coords, ctab, mapData) {
	let  i = 1;
	let z_current_hill = mapData.points[coords.i_ref][2];
	let factor = z_current_hill / radius * radius;

	while (radius > 1) {
		radius--;
		if (mapData.points[coords.i_ref][2] < Math.pow(radius, 2))
			i++;
		factor = z_current_hill + i / radius * radius;
		let c_height = compute_height(coords, radius, factor, mapData)
		if (c_height < coords.max_height) break;
	}
	ctab[coords.i_ref][coords.j_ref].radius = radius;
	ctab[coords.i_ref][coords.j_ref].factor = factor;
}

function increase_radius(radius, coords, ctab, mapData) {
	let bound = utils.check_bounds(coords.i_ref, mapData);
	let z_current_hill = mapData.points[coords.i_ref][2];
	let factor = z_current_hill / radius * radius;
	//console.log('bound : ', bound);
	
	while (radius < bound - 1) {
		radius++;
	}
	factor = z_current_hill / radius * radius;
	ctab[coords.i_ref][coords.j_ref].radius = radius;
	ctab[coords.i_ref][coords.j_ref].factor = factor;
}

function compute_radius(i, j, idx_cmp, closest_tab, mapData) {
	let radius = mapData.points[i][2];
	let nfactor = radius === 0 ?  1 : radius / radius * radius;
	let coords = {
		x_comp: mapData.points[idx_cmp][0],
		y_comp: mapData.points[idx_cmp][1],
		i_cmp: idx_cmp,
		x_ref: mapData.points[i][0],
		y_ref: mapData.points[i][1],
		i_ref: i,
		j_ref: j,
		max_height: mapData.points[idx_cmp][2] - 1,
	};
	let height = compute_height(coords, radius, nfactor, mapData);
	if (height > coords.max_height) {
		decrease_radius(radius, coords, closest_tab, mapData);
	}
	else {
		increase_radius(radius, coords, closest_tab, mapData);
	}
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
	utils.sort_input_tab(mapData);
	if (mapData.points.length === 1) {
		mapData.size_map = mapData.points[0][2] * 2; // a revoir
		return ;
	}
	mapData.highest = mapData.points[mapData.points.length - 1][2];
	compute_bounds(mapData);
	//resize_map(mapData); // not needed, on gerera la resolution au moment du display
	let closest = sort_closest_points(mapData);
	compute_all_radius(closest, mapData);
	store_data(closest, mapData);
	compute_bounds(mapData); // recomputes map boundaries with updated radius
}

export default create_map_dimensions;
