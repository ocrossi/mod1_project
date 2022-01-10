import {compute_height} from './mapUtils.js'

function check_bounds(r, iref, mapData) {
	let cbounds = [
		mapData.points[iref][0] - r,
		mapData.points[iref][1] - r,
		mapData.points[iref][0] + r,
		mapData.points[iref][1] + r
	];

	if (cbounds[0] < mapData.bounds.x_min || cbounds[1] < mapData.bounds.x_min ||
		cbounds[2] > mapData.bounds.xmax || cbounds[3] > mapData.bounds.y_max)
		return 0;
	return 1;
}

function decrease_radius(iref, coords,cobj, mapData) {
	let r = cobj.radius;
	let c_factor = 0;
	let i = 1;
	let max_height = mapData.points[cobj.idx][2];
	
	while (r > 1) {
		r--;
		if (mapData.points[iref][2] < Math.pow(r, 2))
			i++;
		c_factor = (r + i) / Math.pow(r, 2);
		let c_height = compute_height(coords, r, c_factor);
		if (c_height < max_height) break;
	}	
	cobj.radius =  r;
	cobj.factor = c_factor;
}

function increase_radius(iref, coords, cobj, mapData) {
	let max_height = mapData.points[cobj.idx][2];
	let r = cobj.radius;
	let factor = cobj.radius === 0 ? 1 : 1 / r;

	while (check_bounds(r, iref, mapData) && compute_height(coords, r, factor) < max_height) {
			r++;
			factor = cobj.radius === 0 ? 1 : 1 / r;
	}
	factor = mapData.points[iref][2] / Math.pow(r, 2);
	cobj.radius =  r;
	cobj.factor = factor;
}

function compute_biggest_radius_with_closest(iref, compobj, mapData) {
	let coords = {
		x_ref: mapData.points[iref][0],
		y_ref: mapData.points[iref][1],
		x_comp: mapData.points[compobj.idx][0],
		y_comp: mapData.points[compobj.idx][1],
	}
	let factor = compobj.radius === 0 ? 1 : 1 / compobj.radius;
	let height_hill = compute_height(coords, compobj.radius, factor);
	if (height_hill > mapData.points[compobj.idx][2])
		decrease_radius(iref, coords, compobj, mapData);
	else
		increase_radius(iref, coords, compobj, mapData);
}

function compute_radius_using_neighbors(closest_tab, mapData) {
	for (let i = 0; i < closest_tab.length; i++) {
		for (let j = 0; j < closest_tab[0].length; j++) {
			compute_biggest_radius_with_closest(i, closest_tab[i][j], mapData);
		}
	}
}

export default compute_radius_using_neighbors;
