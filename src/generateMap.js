function get_poly_index(index, mapData) {
	return (
		3 *
		(mapData.points[index][0] * (mapData.size_map + 1) +
			mapData.points[index][1])
	);
}

function raise_terrain(mapData, index, points) {
	let radius = Math.round(mapData.points[index][2]);
	// if (radius < 10) {
	// 	console.log('ALLO');
	// 	radius = 20;
	// }
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let targetHeight = mapData.points[index][2];
	let deltaHeight = targetHeight - points[get_poly_index(index, mapData) + 2];
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

				let z_coord = 3 * (brushX * (mapData.size_map + 1) + brushY) + 2;
				let newHeight = deltaHeight * brushWeight;
				if (points[z_coord] < newHeight) {
					points[z_coord] = (points[z_coord] + newHeight) / 2;
				}
			}
		}
	}
}

function get_max_height(mapData) {
	for (let i = 0; i < mapData.points.length; i++) {
		if (mapData.points[i][2] > mapData.max_height)
			mapData.max_height = mapData.points[i][2];
	}
}

function generate_map(mapData, polyData) {
	let nbPoints = (mapData.size_map + 1) * (mapData.size_map + 1);
	let numTriangles = mapData.size_map * mapData.size_map * 2;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(4 * numTriangles);
	polyData.getPolys().setData(polys, 1);

	let idx = 0;
	// sets points to a flat surface
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			points[idx * 3] = i;
			points[idx * 3 + 1] = j;
			points[idx * 3 + 2] = 0; // z coords
			idx++;
		}
	}

	
	// elevates terrain with input points

	for (let i = 0; i < mapData.points.length; i++) {
		if (mapData.points[i][2] !== 0) raise_terrain(mapData, i, points);
	}
	get_max_height(mapData);

	idx = 0;
	// links points into triangles
	for (let k = 0; k < mapData.size_map; k++) {
		for (let l = 0; l < mapData.size_map; l++) {
			polys[idx * 8] = 3;
			polys[idx * 8 + 1] = k * (mapData.size_map + 1) + l; // ref
			polys[idx * 8 + 2] = polys[idx * 8 + 1] + 1; // down
			polys[idx * 8 + 3] = polys[idx * 8 + 1] + (mapData.size_map + 1); // right

			polys[idx * 8 + 4] = 3;
			polys[idx * 8 + 5] = polys[idx * 8 + 2];
			polys[idx * 8 + 6] = polys[idx * 8 + 3];
			polys[idx * 8 + 7] = polys[idx * 8 + 3] + 1;
			idx++;
		}
	}
}

export default generate_map;
