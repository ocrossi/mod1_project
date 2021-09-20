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

function manage_overlapping_terrain(brushX, brushY, mapData, index, newHeight) {
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
		coef: ((dist_to_current / dist_current_closest) * 100),
		index: index
	}

	if (mapData.height_map[brushX][brushY] !== undefined && mapData.height_map[brushX][brushY].coef !== 100) {
		// ici faut les trier direct plutot que de push a la zb
		console.log(mapData.height_map[brushX][brushY]);
		mapData.height_map[brushX][brushY].push(height_point);
	}
	else mapData.height_map[brushX][brushY] = height_point;
}

function mark_terrain(mapData, index) {
	let radius = mapData.points[index][2];
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let targetHeight = mapData.points[index][2];
	let deltaHeight = targetHeight - mapData.height_map[mapData.points[index][0], mapData.points[index][1]].z;
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
				let newHeight = deltaHeight * brushWeight;
				manage_overlapping_terrain(brushX, brushY, mapData, index, newHeight);
			}
		}
	}
}

function generate_height_map(mapData) {
	mapData.height_map = new Array(mapData.size_map);

	for (let i = 0; i < mapData.size_map; i++) {
		mapData.height_map[i] = new Array(mapData.size_map);
	}
	for (let i = 0; i < mapData.points.length; i++) {
		console.log(mapData.points[i]);
		let height_point = {
			z: mapData.points[i][2],
			coef: 100,
			index: i,
		};
	
		console.log(mapData.height_map[mapData.points[i][0]][
			mapData.points[i][1]
		]);
		mapData.height_map[mapData.points[i][0]][
			mapData.points[i][1]
		] = height_point;
		mark_terrain(mapData, i)
	}
}

export default generate_height_map;
