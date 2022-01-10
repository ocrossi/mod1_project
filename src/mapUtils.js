export function sort_input_tab(mapData) {
	let sorted = 0;
	while (sorted != 1) {
		sorted = 1;
		for (let i = 0; i < mapData.points.length - 1; i++) {
			if (mapData.points[i][2] > mapData.points[i + 1][2]) {
				let tmp = mapData.points[i];
				mapData.points[i] = mapData.points[i + 1];
				mapData.points[i + 1] = tmp;
				sorted = 0;
			}
		}
	}
}

export function compute_height(coords, radius, c_factor) {
	return (
		(Math.pow(radius, 2) -
			(Math.pow(coords.x_comp - coords.x_ref, 2) +
				Math.pow(coords.y_comp - coords.y_ref, 2))) 
		* c_factor 
	);
}

export function translate_map(x, y, mapData) {
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] = mapData.points[i][0] + x;
		mapData.points[i][1] = mapData.points[i][1] + y;
	}
}

export function square_flattening(height, index, mapData) {
	if (mapData.points[index][2] === 0) return 0;
	height = height / mapData.points[index][2];
	height = Math.pow(height, 2);
	height *= mapData.points[index][2];
	return height;
}

export function sigmoid_flattening(height, index, mapData) {
	if (mapData.points[index][2] === 0) return 0;
	height /= mapData.points[index][2]; // range [0, max_height] to [0, 1]
	height = (height * 2) - 1; // swaps height from range [0, 1] to [-1, 1]
	height = 1 / (1 + Math.exp(-5 * height));
	height *= mapData.points[index][2]; // back to range [0, max]
	return height;
}

export function store_heat(x, y, index, newHeight, heat_map) {
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

