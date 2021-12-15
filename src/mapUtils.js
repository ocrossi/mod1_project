export function check_bounds(index, mapData) {
	let bounds = [
		mapData.points[index][0],
		mapData.points[index][1],
	];
	let min = mapData.size_map;

	for (let i = 0; i < 4; i++) {
		min = bounds[i] < min ? bounds[i] : min;
	}
	return min;
}

export function square_flattening(height, coords, mapData) {
	if (mapData.points[coords.i_ref][2] === 0) return 0;

	height = height / mapData.points[coords.i_ref][2];
	height = Math.pow(height, 2);
	height *= mapData.points[coords.i_ref][2];
	return height;
}

export function sigmoid_flattening(height, coords, mapData) {
	if (mapData.points[coords.i_ref][2] === 0) return 0;
	height /= mapData.points[coords.i_ref][2]; // range [0, max_height] to [0, 1]
	height = (height * 2) - 1; // swaps height from range [0, 1] to [-1, 1]
	height = 1 / (1 + Math.exp(-5 * height));
	height *= mapData.points[coords.i_ref][2]; // back to range [0, max]
	return height;
}

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
