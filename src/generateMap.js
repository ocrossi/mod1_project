function get_poly_index(index, mapData) {
	return (
		3 *
		(mapData.points[index][0] * (mapData.size_map + 1) +
			mapData.points[index][1])
	);
}

function place_input_points(mapData, points) {
	for (let i = 0; i < mapData.points.length; i++) {
		//let polyIndex = mapData.points[i][0] * (mapData.size_map + 1) + mapData.points[i][1];
		let polyIndex = get_poly_index(mapData.points[i], mapData);

		points[polyIndex + 2] = mapData.points[i][2];
	}
}

let brushFallOff = 0.1;

function raise_terrain(mapData, index, points) {
	console.log(mapData);
	let radius = mapData.points[index][2];
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let targetHeight = radius;
	let deltaHeight = targetHeight - points[get_poly_index(index, mapData) + 2];
	let sqrRadius = Math.pow(radius, 2);

	for (let offsetY = -radius; offsetY <= radius; offsetY++){
		for (let offsetX = -radius; offsetX <= radius; offsetX++) {
			let sqrDstFromCenter = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);
			if (sqrDstFromCenter <= sqrRadius) {
				let dstFromCenter = Math.sqrt(sqrDstFromCenter);
				let t = dstFromCenter / radius;
				let brushWeight = Math.exp(-t * t / brushFallOff);

				let brushX = centreX + offsetX;
				let brushY = centreY + offsetY;

				points[3 * (brushX * (mapData.size_map + 1) + brushY) + 2] = deltaHeight * brushWeight;
			}
		}
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

	//console.log(mapData.points);
	for (let i = 0; i < mapData.points.length; i++) {
		raise_terrain(mapData, i, points);
	}
	//place_input_points(mapData, points);
	idx = 0;

	// links triangles
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
