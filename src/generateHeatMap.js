function store_heat(x, y, index, newHeight, heat_map) {
	let heat = {
		z: newHeight,
		index_origin: index,
		no_height: 0,
	};
	if (heat_map[x][y][0].no_height === 1)
		heat_map[x][y][0] = heat;
	else {
		if (heat_map[x][y][0].z < heat.z)
			heat_map[x][y].unshift(heat);
		else heat_map[x][y].push(heat);
	}
}

function square_flattening(height, index, mapData) {
	if (mapData.points[index][2] === 0) return 0;
	height = height / mapData.points[index][2];
	height = Math.pow(height, 2);
	height *= mapData.points[index][2];
	return height;
}

function sigmoid_flattening(height, index, mapData) {
	if (mapData.points[index][2] === 0) return 0;
	height /= mapData.points[index][2]; // range [0, max_height] to [0, 1]
	height = (height * 2) - 1; // swaps height from range [0, 1] to [-1, 1]
	height = 1 / (1 + Math.exp(-5 * height));
	height *= mapData.points[index][2]; // back to range [0, max]
	return height;
}

function mark_terrain(index, mapData, heat_map) {
	let radius = mapData.points[index][3].radius;
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let sqrRadius = Math.pow(radius, 2);
	let factor = mapData.points[index][3].factor;

	for (let offsetY = -radius; offsetY <= radius; offsetY++) {
		for (let offsetX = -radius; offsetX <= radius; offsetX++) {
			let sqrDstFromCenter = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);
			if (sqrDstFromCenter <= sqrRadius) {
				let brushX = centreX + offsetX;
				let brushY = centreY + offsetY;

				let newHeight =
					Math.pow(radius, 2) -
					(Math.pow(brushX - centreX, 2) + Math.pow(brushY - centreY, 2));
				newHeight *= factor;
				if (mapData.square_flattening === true)
					newHeight = square_flattening(newHeight, index, mapData);
				if (mapData.sigmoid_flattening === true)
					newHeight = sigmoid_flattening(newHeight, index, mapData);
				store_heat(brushX, brushY, index, newHeight, heat_map);
			}
		}
	}
}

// adds height to overlapping hills 
function combine_heats(mapData, heat_map) {
	for (let i = 0; i < mapData.size_map; i++) {
		for (let j = 0; j < mapData.size_map; j++) {
			if (heat_map[i][j].length > 1) {
				let index = heat_map[i][j][0].index_origin;
				for (let k = 1; k < heat_map[i][j].length; k++) {
					heat_map[i][j][0].z += heat_map[i][j][k].z;
					heat_map[i][j][0].z =
						heat_map[i][j][0].z > mapData.points[index][2]
							? mapData.points[index][2]
							: heat_map[i][j][0].z;
				}
			}
		}
	}
}

function store_results(mapData, heat_map) {
	mapData.height_map = new Array(mapData.size_map + 1);

	for (let i = 0; i <= mapData.size_map; i++) {
		mapData.height_map[i] = new Array(mapData.size_map + 1);
		for (let j = 0; j <= mapData.size_map; j++) {
			mapData.height_map[i][j] = heat_map[i][j][0].z;
		}
	}
}

// compute each hill height to combine overlap results
function generate_heat_map(mapData) {
	let heat_map = new Array(mapData.size_map + 1);

	// allocate a tab for each pair of x,y coords on the map
	for (let i = 0; i <= mapData.size_map; i++) {
		heat_map[i] = new Array(mapData.size_map + 1);
		for (let j = 0; j <= mapData.size_map; j++) {
			heat_map[i][j] = new Array();
			heat_map[i][j][0] = { z: 0, no_height: 1 };
		}
	}
	for (let i = 0; i < mapData.points.length; i++) {
		// sets input points
		heat_map[mapData.points[i][0]][mapData.points[i][1]][0] = {
			z: mapData.points[i][2],
			index_origin: i,
			no_height: 0,
		};
		// marks heights of hills for each input point
		mark_terrain(i, mapData, heat_map);
	}
	if (mapData.combine_heats === true)
		combine_heats(mapData, heat_map);
	store_results(mapData, heat_map);
	console.log(mapData.height_map);
}

export default generate_heat_map;
