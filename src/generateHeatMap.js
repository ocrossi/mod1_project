import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";

function distanceBetween2Points(t1, t2) {
	return Math.sqrt(Math.pow(t2[0] - t1[0], 2) + Math.pow(t2[1] - t1[1], 2));
}

function get_closest_input_point2(x, y, mapData, index) {
	let dist = distanceBetween2Points(
		[0, 0, 0],
		[mapData.size_map, mapData.size_map, 0]
	);
	let ref = [x, y, 0];
	let ref_index = -1;

	for (let i = 0; i < mapData.points.length; i++) {
		let point = [mapData.points[i][0], mapData.points[i][1], 0];
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

function manage_overlapping_terrain(brushX, brushY, mapData, index, newHeight) {
	//console.log("X,Y:", brushX, brushY);
	let index_closest_point = get_closest_input_point2(
		brushX,
		brushY,
		mapData,
		index
	);
	let dist_to_closest = distanceBetween2Points(
		[brushX, brushY, 0],
		mapData.points[index_closest_point]
	);
	let dist_to_current = distanceBetween2Points(
		[brushX, brushY, 0],
		mapData.points[index]
	);
	let height_closest = mapData.points[index_closest_point][1];
	let dist_current_closest = distanceBetween2Points(
		mapData.points[index],
		mapData.points[index_closest_point]
	);
	let height_point = {
		z: newHeight,
		coef: (dist_to_current / mapData.points[index][2]) * 100,
		index: index,
	};
	//if (height_point.coef > 100) console.log("T BOURRE");
	//if (height_point.coef === 0) console.log("T PETE");

	if (mapData.heat_map[brushX][brushY].length === 0) {
		//	console.log("X,Y:", brushX, brushY);
		//	console.log(mapData.heat_map[brushX][brushY]);
		mapData.heat_map[brushX][brushY].push(height_point);
	} else {
		store_heat(height_point, mapData.heat_map[brushX][brushY]);
	}
}

function get_heat(mapData, index) {
	//console.log('DANS GET HEAT');
	//console.log(
	//	mapData.heat_map[mapData.points[index][0]][mapData.points[index][1]]
	//);
	if (
		mapData.heat_map[mapData.points[index][0]][mapData.points[index][1]]
			.length === 0
	) {
		console.log("ola");
		return 0;
	} else {
		let test =
			mapData.heat_map[mapData.points[index][0]][mapData.points[index][1]][0].z;
		//console.log('dans get heat return classique test = ', test);
		return mapData.heat_map[mapData.points[index][0]][
			mapData.points[index][1]
		][0].z;
	}
}

function mark_terrain(mapData, index) {
	let radius = mapData.points[index][2];
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let targetHeight = mapData.points[index][2];
	//let deltaHeight = targetHeight - get_heat(mapData, index);
	let deltaHeight = targetHeight;
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
				if (brushX === centreX && brushY === centreY) {
					continue;
				}
				let newHeight = deltaHeight * brushWeight;
				if (mapData.points.length > 1)
					manage_overlapping_terrain(brushX, brushY, mapData, index, newHeight);
			}
		}
	}
}

function test_coefs(mapData) {
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			for (let k = 0; k < mapData.heat_map[i][j].length - 1; k++) {
				if (
					mapData.heat_map[i][j][k].coef < mapData.heat_map[i][j][k + 1].coef
				) {
					console.log("wtf");
				}
			}
		}
	}
}

function generate_heat_map(mapData) {
	mapData.heat_map = new Array(mapData.size_map + 1);

	for (let i = 0; i <= mapData.size_map; i++) {
		mapData.heat_map[i] = new Array(mapData.size_map + 1);
		for (let j = 0; j <= mapData.size_map; j++) {
			mapData.heat_map[i][j] = new Array();
		}
	}
	for (let i = 0; i < mapData.points.length; i++) {
		let height_point = {
			z: mapData.points[i][2],
			coef: 100,
			index: i,
		};
		mapData.heat_map[mapData.points[i][0]][
			mapData.points[i][1]
		][0] = height_point;
		mark_terrain(mapData, i);
	}
	test_coefs(mapData);
}

export default generate_heat_map;
