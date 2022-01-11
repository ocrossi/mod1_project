import sort_closest_points from "./sortClosestPoint2.js";
import manage_one_point_map from "./onePointMap.js";
import compute_radius_using_neighbors from "./radiusWithNeighbors.js";
import update_bounds from "./updateBounds.js"
import resize_map from './resizeMap.js';

function compute_radius_simple(i, j, closest_tab, mapData) {
	closest_tab[i][j].radius = mapData.points[i][2];
	closest_tab[i][j].x_min = mapData.points[i][0] - mapData.points[i][2];
	closest_tab[i][j].x_max = mapData.points[i][0] + mapData.points[i][2];
	closest_tab[i][j].y_min = mapData.points[i][1] - mapData.points[i][2];
	closest_tab[i][j].y_max = mapData.points[i][1] + mapData.points[i][2];
}

function set_hill_limits(closest_tab, max) {
	let bounds = [-max, -max, 2 * max, 2 * max];
	for (let i = 0; i < closest_tab.length; i++) {
		for (let j = 0; j < closest_tab[0].length; j++) {
			closest_tab[i][j].x_min = Math.max(closest_tab[i][j].x_min, bounds[0]);
			closest_tab[i][j].y_min = Math.max(closest_tab[i][j].y_min, bounds[1]);
			closest_tab[i][j].x_max = Math.min(closest_tab[i][j].x_max, bounds[2]);
			closest_tab[i][j].y_max = Math.min(closest_tab[i][j].y_max, bounds[3]);
		}
	}
}

function get_map_bounds(closest_tab, max) {
	let gbounds = [-max, -max, 2 * max, 2 * max];

	for (let i = 0; i < closest_tab.length; i++) {
		let cbounds = [-max, -max, 2 * max, 2 * max];
		for (let j = 0; j < closest_tab[0].length; j++) {
			cbounds[0] = Math.max(closest_tab[i][j].x_min, cbounds[0]);
			cbounds[1] = Math.max(closest_tab[i][j].y_min, cbounds[1]);
			cbounds[2] = Math.min(closest_tab[i][j].x_max, cbounds[2]);
			cbounds[3] = Math.min(closest_tab[i][j].y_max, cbounds[3]);
		}
		gbounds[0] = Math.max(cbounds[0], gbounds[0]);
		gbounds[1] = Math.max(cbounds[1], gbounds[1]);
		gbounds[2] = Math.min(cbounds[2], gbounds[2]);
		gbounds[3] = Math.min(cbounds[3], gbounds[3]);
	}
	return gbounds;
}

function compute_simple_bounds(closest_tab, mapData) {
	for (let i = 0; i < closest_tab.length; i++) {
		for (let j = 0; j < closest_tab[0].length; j++)
			compute_radius_simple(i, j, closest_tab, mapData);
	}
	set_hill_limits(closest_tab, mapData.size_max);
	return get_map_bounds(closest_tab, mapData.size_max);
}

function stock_radius(closest_tab, mapData) {
	let temp = 0;

	for (let i = 0; i < mapData.points.length; i++) {
		let radius = mapData.size_max;
		for (let j = 0; j < closest_tab[0].length; j++) {
			if (closest_tab[i][j].radius < radius) {
				j = temp;
				radius = closest_tab[i][j].radius;
			}
		}
		mapData.points[i][3] = { radius: closest_tab[i][temp].radius, factor: closest_tab[i][temp].factor };
	}
}

function translate_map(mapData) {
	console.log('before translate', mapData.points);

	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] = mapData.points[i][0] - mapData.bounds[0];
		mapData.points[i][1] = mapData.points[i][1] - mapData.bounds[1];
	}
	console.log('eof translate map les points');
	console.log(mapData.points)
}

function set_size_map(mapData) {
	let x_width = mapData.bounds[2] - mapData.bounds[0];
	let y_width = mapData.bounds[3] - mapData.bounds[1];

	console.log('set size_map x width', x_width);
	console.log('set size_map y wdth', y_width);

	mapData.size_map = Math.max(x_width, y_width);

	console.log('eof setsizemap : ', mapData.size_map);
}

function create_map(mapData) {
	if (mapData.points.length === 1) {
		return manage_one_point_map(mapData);
	}
	let closest_tab = sort_closest_points(mapData);

	mapData.bounds = compute_simple_bounds(closest_tab, mapData);
	compute_radius_using_neighbors(closest_tab, mapData);
	stock_radius(closest_tab, mapData);
	update_bounds(mapData);
	set_size_map(mapData);
	translate_map(mapData); // moves points into whole natural numbers system

//	resize_map(mapData);
}

export default create_map;
