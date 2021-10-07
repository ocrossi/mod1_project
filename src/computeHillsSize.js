import sort_closest_points from "./sortClosestPoint.js";

function compute_height(coords, radius) {
	let n_factor = radius / Math.pow(radius, 2);
	if (coords.y_ref === 150)  {
		console.log("wsh", n_factor)
		console.log('rad', radius);
	}
	return (
		(Math.pow(radius, 2) -
			(Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2))) * n_factor 
	);
}

function decrease_radius(point_ref, point_comp, max_height, coords, mapData) {
	let r = mapData.points[point_ref][2] - 1;
	let sqrt_max_height = Math.sqrt(max_height);
	let c_factor = 0;
	while (r > 1) {
		r--;
		//	c_factor = r / Math.pow(r, 2);
		/*else*/ c_factor = mapData.points[point_ref][2] / Math.pow(r, 2);
		let c_height = compute_height(coords, r, c_factor);
		console.log("cheight vs max_height : ", c_height, max_height);
		if (c_height < max_height) break;
	}	

	return [r, c_factor];
}

function increase_radius(mapData) {}

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
	if (height > max_height) {
	let res = decrease_radius(
			point_ref,
			point_comp,
			max_height,
			coords,
			mapData
		)
		mapData.closest_points[point_ref][idx_closest_tab].radius = res[0];
		mapData.closest_points[point_ref][idx_closest_tab].factor = res[1];
	}
	else {
		mapData.closest_points[point_ref][idx_closest_tab].radius = mapData.points[point_ref][2];
		mapData.closest_points[point_ref][idx_closest_tab].factor = mapData.points[point_ref][2] / Math.pow(mapData.points[point_ref][2], 2);
		console.log('ELSE');
		console.log(mapData.closest_points[point_ref][idx_closest_tab].radius);
		console.log(mapData.closest_points[point_ref][idx_closest_tab].factor);
	}
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
	//console.log('in compute biggest radius lets check closest points');
	//console.log(mapData.closest_points);
	//closest_point tabs all same length
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

function compute_hills_size(mapData) {
	// returns instantly classic radius because there is no other point to compare
	if (mapData.points.length === 1) {
		mapData.points[0].push(mapData.points[0][2]);
		return;
	}
	sort_closest_points(mapData);
	compute_biggest_radius(mapData);
}

export default compute_hills_size;
