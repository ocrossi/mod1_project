function distanceBetweenTwoPointsFlat(t1, t2) {
	return Math.sqrt(Math.pow(t2[0] - t1[0], 2) + Math.pow(t2[1] - t1[1], 2));
}

function sort_distance_tab(mapData, idx) {
	let sorted = 0;
	while (sorted != 1) {
		sorted = 1;
		for (let i = 0; i < mapData.closest_points[idx].length - 1; i++) {
			if (mapData.closest_points[idx][i].dist > mapData.closest_points[idx][i + 1].dist) {
				let tmp = mapData.closest_points[idx][i];
				mapData.closest_points[idx][i] = mapData.closest_points[idx][i + 1];
				mapData.closest_points[idx][i + 1] = tmp;
				sorted = 0;
			}
		}
	}
}


function map_points_with_distance(mapData, idx) {
	mapData.closest_points[idx] = new Array();
	for (let i = 0; i < mapData.points.length; i++) {
		if (i === idx) continue;
		let dist_to_current = {
			idx: i,
			dist: distanceBetweenTwoPointsFlat(mapData.points[idx], mapData.points[i]),
			radius: -1,
			factor: -1,
		};
		mapData.closest_points[idx].push(dist_to_current);
	}
}

function sort_closest_points(mapData) {
	if (mapData.points.length < 2)
		return;
	for (let i = 0; i < mapData.points.length; i++) {
		map_points_with_distance(mapData, i);
		sort_distance_tab(mapData, i);
	}
}

export default sort_closest_points;
