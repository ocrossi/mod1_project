import sort_closest_points from "./sortClosestPoint";
import * as utils from './mapUtils';
import compute_bounds from "./getBoundsMap";
import resize_map from "./resizeMap";

function compute_height(coords, radius, nfactor, mapData) {
	let height = (Math.pow(radius, 2) -
			(Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2))) *  nfactor;
/* le pb vient de la
	if (mapData.square_flattening === true)
		height = utils.square_flattening(height, coords, mapData); 
	if (mapData.sigmoid_flattening === true)
		height = utils.sigmoid_flattening(height, coords, mapData); 
*/
	return height;
}

function store_data(i, closest, mapData) {
	let radius_min = closest[i][0].radius;
	let factor = closest[i][0].factor;
	for (let j = 1; j < closest[i].length; j++) {
		if (radius_min > closest[i][j].radius) {
			radius_min = closest[i][j].radius;
			factor = closest[i][j].factor;
			console.log(closest[i][j]);
		} 
	}
	//console.log('stoer data rad : %d fac : %d', radius_min, factor);
	mapData.points[i][3].radius = radius_min;
	mapData.points[i][3].factor = factor;
}

function decrease_radius(coords, ctab, mapData) {
	let i = 1;
	let z_current_hill = mapData.points[coords.i_ref][2];
	//let radius = z_current_hill;
	let radius = mapData.points[coords.i_ref][2];
	let factor = 0;

	console.log('gimme coords');
	console.log(coords);

	while (radius > 1) {
		if (coords.i_ref === 0) {
			console.log('wsh');
			console.log('rad', radius);
			console.log('z cur', z_current_hill);
			console.log('factor', factor);
		}
		radius--;
		if (z_current_hill < Math.pow(radius, 2))
			i++;
		factor = (radius + i) / Math.pow(radius, 2);
		let c_height = compute_height(coords, radius, factor, mapData);
		if (c_height < coords.max_height) break;
	}
	if (factor > 1) {
		console.log('whyyyy');
		console.log(radius);
		console.log(factor);
	}
	//if (radius === 1) factor = 1;


	ctab[coords.i_ref][coords.j_ref].radius = radius;
	ctab[coords.i_ref][coords.j_ref].factor = factor;
}

function increase_radius(radius, coords, ctab, mapData) {
	let bound = utils.check_bounds(coords.i_ref, mapData);
	let z_current_hill = mapData.points[coords.i_ref][2];
	let factor = z_current_hill / Math.pow(radius, 2);

	while (radius < bound - 1) {
		radius++;
	}
	factor = z_current_hill / Math.pow(radius, 2);
	ctab[coords.i_ref][coords.j_ref].radius = radius;
	ctab[coords.i_ref][coords.j_ref].factor = factor;
}

function compute_radius(i, j, idx_cmp, closest_tab, mapData) {
	let radius = mapData.points[i][2];
	let nfactor = radius === 0 ?  1 : 1 / radius;
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
	console.log('dans compute radius height %d vs max_height %d', height, coords.max_height);
	if (height > coords.max_height) {
		decrease_radius(coords, closest_tab, mapData);
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
		store_data(i, closest_tab, mapData);
	}
}

function create_map_dimensions(mapData) {
	console.log(mapData.points);
	utils.sort_input_tab(mapData);
	if (mapData.points.length === 1) {
		mapData.size_map = mapData.points[0][2] * 2; // a revoir
		return ;
	}
	mapData.highest = mapData.points[mapData.points.length - 1][2];
	compute_bounds(mapData); // computes bounds with radius of a hill = height top of the hill
	resize_map(mapData);
	let closest = sort_closest_points(mapData);
	compute_all_radius(closest, mapData);
	compute_bounds(mapData); // recomputes map boundaries with updated radius
}

export default create_map_dimensions;
