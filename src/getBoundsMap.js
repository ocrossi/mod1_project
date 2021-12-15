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

function mapCoords_to_worldCoords(mapData, bounds) {
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] -= bounds.xmin;
		mapData.points[i][1] -= bounds.ymin;
	}
}

function compute_bounds(mapData) {
	let bounds = {};
	setBounds(bounds, mapData, 0);
	for (let i = 1; i < mapData.points.length; i++) {
		update_bounds(bounds, mapData, i);
	}
	console.log('b4 mapCoords_to_worldCoords', mapData.points);
	console.log('bounds', bounds);
	mapCoords_to_worldCoords(mapData, bounds);
	console.log('after ', mapData.points);
}

export default compute_bounds;
