function place_input_points(mapData, points) {
	console.group();
	console.log("input vs map");
	console.log(mapData.points);
	console.log(points)
	console.groupEnd();

	/* tests petage de cable */
	//mapData.points.push([20, 20, 3]);

	for (let i = 0; i < mapData.points.length; i++) {
		let tst = mapData.points[i][0] * mapData.size_map + mapData.points[i][1];
		console.group();
		console.log("le point en question", mapData.points[i]);
		console.log("l indice du pt dans le tableau 1d de points du polyData", tst);
		console.groupEnd();
		points[tst] = mapData.points[i][2];		
		console.log('index?', tst * 3 + 2);
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
			points[idx * 3] = mapData.size_map - i;
			points[idx * 3 + 1] = mapData.size_map - j;
			points[idx * 3 + 2] = 0; // z coords
			idx++;
		}
	}

	place_input_points(mapData, points);
	//console.log(points);
	idx = 0;

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
	//console.log(polys);
}

export default generate_map;
