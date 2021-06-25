// sort tab from the smallest to the biggest z coord
function sort_input_tab(mapData) {
	while (1) {
		let isSorted = true;
		for (let i = 1; i < mapData.points.length; i++) {
			if (mapData.points[i][2] < mapData.points[i - 1][2]) {
				isSorted = false;
				let temp = mapData.points[i];
				mapData.points[i] = mapData.points[i - 1];
				mapData.points[i - 1] = temp;
			}
		}
		if (isSorted === true) break;
	}
}

// checks for points too high for their x,y coordinates to ensure a null altitude around the cube
function get_overlap(mapData) {
	let smallest = 0;
	let overlap = 0;
	let currentOverlap = 0;

	for (let i = 0; i < mapData.points.length; i++) {
		smallest =
			mapData.points[i][0] <= mapData.points[i][1]
				? mapData.points[i][0]
				: mapData.points[i][1];
		currentOverlap = mapData.points[i][2] - smallest;
		if (currentOverlap > overlap) overlap = currentOverlap;
	}
	return overlap;
}

// adds biggest overlap to every x,y point coordinates
function compute_overlap(mapData) {
	let overlap = get_overlap(mapData);
	console.log('in compute overlap', overlap);
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] += overlap;
		mapData.points[i][1] += overlap;
	}
}

// looks for the max size of the map
function get_farthest_corner(mapData) {
	let farthest = 0;
	let currentFarthest = 0;

	for (let i = 0; i < mapData.points.length; i++) {
		currentFarthest =
			mapData.points[i][0] >= mapData.points[i][1]
				? mapData.points[i][0]
				: mapData.points[i][1];
		if (currentFarthest > farthest) farthest = currentFarthest;
	}
	return farthest;
}


// transforms input coords 
function mapCoords_to_worldCoords(mapData) {
	let farthest = get_farthest_corner(mapData);

	console.log("map coords to world coords farthest : ", farthest);
	mapData.size_multiplier = mapData.size_map / farthest;
}

function resize_map(mapData) {
	console.log('hello');
	sort_input_tab(mapData);
	compute_overlap(mapData);
	mapCoords_to_worldCoords(mapData);

	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] = Math.round(mapData.points[i][0] * mapData.size_multiplier);
		mapData.points[i][1] = Math.round(mapData.points[i][1] * mapData.size_multiplier);
		mapData.points[i][2] = Math.round(mapData.points[i][2] * mapData.size_multiplier);
	}
}

export default resize_map;
