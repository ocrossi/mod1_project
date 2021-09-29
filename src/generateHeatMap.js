import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";

function distanceBetween2Points(t1, t2) {
	return Math.sqrt(
		Math.pow(t2[0] - t1[0], 2) +
			Math.pow(t2[1] - t1[1], 2) +
			Math.pow(t1[2] - t2[2], 2)
	);
}

function get_closest_input_point2(x, y, mapData, index) {
	let dist = distanceBetween2Points(
		[0, 0, 0],
		[mapData.size_map, mapData.size_map, 0]
	);
	let ref = [x, y, 0];
	let ref_index = -1;

	for (let i = 0; i < mapData.points.length; i++) {
		let point = [mapData.points[i][0], mapData.points[i][1], mapData.points[i][2]];
		let curr_dist = distanceBetween2Points(ref, point);
		if (curr_dist < dist && i !== index) {
			ref_index = i;
			dist = curr_dist;
		}
	}
	return ref_index;
}

function store_heat(heat, heat_tab) {
	for (let i = 0; i < heat_tab.length; i++) {
		if (heat.coef > heat_tab[i].coef) {
			heat_tab.splice(i, 0, heat);
			return;
		}
	}
	heat_tab.push(heat);
}

let jm = 0;
function manage_overlapping_terrain(brushX, brushY, mapData, index, newHeight) {
	let index_closest_point = get_closest_input_point2(
		brushX,
		brushY,
		mapData,
		index
	);
	let dist_to_closest = distanceBetween2Points(
		[brushX, brushY, newHeight],
		mapData.points[index_closest_point]
	);
	let dist_to_current = distanceBetween2Points(
		[brushX, brushY, newHeight],
		mapData.points[index]
	);
	let height_closest = mapData.points[index_closest_point][1];
	let dist_current_closest = distanceBetween2Points(
		mapData.points[index],
		mapData.points[index_closest_point]
	);
	let coef = (1 - dist_to_current / mapData.points[index][2]) * 100;
	if (coef === 100) {
		console.log("IL CHEAT ZBI");
		console.log("allo", dist_to_current);
		console.log("alloa", mapData.points[index][2]);
		console.log("alloa", newHeight);
	}
	let height_point = {
		z: newHeight,
		coef: coef,
		index: index,
		index_closest: index_closest_point,
		height_closest: height_closest,
		no_height: 0,
	};
	if (mapData.heat_map[brushX][brushY][0].no_height === 1)
		mapData.heat_map[brushX][brushY][0] = height_point;
	else mapData.heat_map[brushX][brushY].push(height_point);
}

function get_shortest_boundary(mapData, index) {
	let bounds = [
		mapData.points[index][0],
		mapData.points[index][1],
		mapData.size_map - mapData.points[index][0],
		mapData.size_map - mapData.points[index][1],
	];
	let res = mapData.size_map;
	for (let i = 0; i < 4; i++) {
		res = bounds[i] < res ? bounds[i] : res;
	}
	return res;
}

function get_radius(mapData, index) {
	let radius = distanceBetween2Points(mapData.points[index], get_closest_input_point2());
	let shortest_boudary = get_shortest_boundary(mapData, index);
	radius = radius < shortest_boudary ? radius : shortest_boudary;
	console.log('get radius returns', radius);
	return radius;
}

function mark_terrain(mapData, index) {
	let radius = mapData.points[index][2];
	//let radius = get_radius(mapData, index);

	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let targetHeight = mapData.points[index][2];
	//let deltaHeight = targetHeight;
	let sqrRadius = Math.pow(radius, 2);

	for (let offsetY = -radius; offsetY <= radius; offsetY++) {
		for (let offsetX = -radius; offsetX <= radius; offsetX++) {
			let sqrDstFromCenter = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);
			if (sqrDstFromCenter <= sqrRadius) {
				let dstFromCenter = Math.sqrt(sqrDstFromCenter);
				let t = dstFromCenter / radius;
				let brushWeight = Math.exp((-t * t) / mapData.brushFallOff);

				let brushX = centreX + offsetX;
				let brushY = centreY + offsetY;
				let deltaHeight = targetHeight - get_highest_coef_height(brushX, brushY);
				if (brushX === centreX && brushY === centreY) continue;
				let newHeight = deltaHeight * brushWeight;
				manage_overlapping_terrain(brushX, brushY, mapData, index, newHeight);
			}
		}
	}
}

function diff_input_heights(h1, h2) {
	return Math.abs(h1 - h2);
}

function compute_heats2(heat_tab) {
	if (heat_tab[0].no_height === 1) return;
	let idx_highest_coef = 0;
	let idx_highest_point = 0;
	let hp = 0;
	for (let i = 0; i < heat_tab.length; i++) {
		idx_highest_coef =
			heat_tab[i].coef > idx_highest_coef ? i : idx_highest_coef;
		if (heat_tab[i].z > idx_highest_point) {
			idx_highest_point = i;
			hp = heat_tab[i].z
		}
	}
	heat_tab[0].z = heat_tab[idx_highest_coef].z + heat_tab[idx_highest_point].z * ((100 - heat_tab[idx_highest_coef].coef) / 100);
}

let test = 0;

function test_results(heat_tab, prev_heat) {
	if (heat_tab[0].z < prev_heat[0].z / 10 && prev_heat[0].z > 5) {
		console.group();
		console.log("hey wthell", ++test);
		console.log("gotcha");
		console.log(heat_tab);
		console.log(prev_heat);
		console.groupEnd();
	}
}

function generate_heat_map(mapData) {
	mapData.heat_map = new Array(mapData.size_map + 1);

	for (let i = 0; i <= mapData.size_map; i++) {
		mapData.heat_map[i] = new Array(mapData.size_map + 1);
		for (let j = 0; j <= mapData.size_map; j++) {
			mapData.heat_map[i][j] = new Array();
			mapData.heat_map[i][j][0] = { z: 0, no_height: 1 };
		}
	}
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.heat_map[mapData.points[i][0]][mapData.points[i][1]][0] = {
			z: mapData.points[i][2],
			coef: 100,
			index: i,
			no_height: 0,
			input: 1,
		};
		mark_terrain(mapData, i);
	}
	for (let i = 1; i < mapData.size_map; i++)
		for (let j = 1; j < mapData.size_map; j++) {
			compute_heats2(mapData.heat_map[i][j]);
			//test_results(mapData.heat_map[i][j], mapData.heat_map[i][j - 1]);
		}
}

export default generate_heat_map;
