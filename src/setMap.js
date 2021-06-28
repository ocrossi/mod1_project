function setBounds(bounds, mapData, index) {
	bounds.xmin = (mapData.points[index][0] - mapData.points[index][2]) * mapData.bounds_multiplier;
	bounds.xmax = (mapData.points[index][0] + mapData.points[index][2]) * mapData.bounds_multiplier;
	bounds.ymin = (mapData.points[index][1] - mapData.points[index][2]) * mapData.bounds_multiplier;
	bounds.ymax = (mapData.points[index][1] + mapData.points[index][2]) * mapData.bounds_multiplier;
}

function update_bounds(bounds, mapData, index) {
	let localBounds = {};
	setBounds(localBounds, mapData, index);
	bounds.xmin = Math.min(bounds.xmin, localBounds.xmin);
	bounds.ymin = Math.min(bounds.ymin, localBounds.ymin);
	bounds.xmax = Math.max(bounds.xmax, localBounds.xmax);
	bounds.ymax = Math.max(bounds.ymax, localBounds.ymax);
}

function grow_map(mapData) {
	while (mapData.size_map > 100) {
		mapData.size_map *= 10;
		mapData.size_multiplier *= 10;
	}
}

function shrink_map(mapData) {
	while (mapData.size_map >= 1000) {
		mapData.size_map /= 10;
		mapData.size_multiplier /= 10;
	}
	mapData.size_map = Math.round(mapData.size_map);
}


function resize_map(mapData, bounds) {
	if (mapData.size_map < 100) grow_map(mapData);
	if (mapData.size_map > 1000) shrink_map(mapData);
	bounds.ymin = Math.round(bounds.ymin * mapData.size_multiplier);
	bounds.xmin = Math.round(bounds.xmin * mapData.size_multiplier);
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] = Math.round(
			mapData.points[i][0] * mapData.size_multiplier
		);
		mapData.points[i][1] = Math.round(
			mapData.points[i][1] * mapData.size_multiplier
		);
		mapData.points[i][2] = Math.round(
			mapData.points[i][2] * mapData.size_multiplier
		);
	}
}

function mapCoords_to_worldCoords(mapData, bounds) {
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] -= bounds.xmin;
		mapData.points[i][1] -= bounds.ymin;
	}
}



function set_size_map(mapData) {
	let bounds = {};
	setBounds(bounds, mapData, 0);
	for (let i = 1; i < mapData.points.length; i++) {
		update_bounds(bounds, mapData, i);
	}
	mapData.size_map = Math.max(bounds.xmax - bounds.xmin, bounds.ymax - bounds.ymin);
	resize_map(mapData, bounds);
	mapCoords_to_worldCoords(mapData, bounds);
}

export default set_size_map;
