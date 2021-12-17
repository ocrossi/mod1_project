function setBounds(bounds, mapData, index) {
	bounds.xmin = (mapData.points[index][0] - mapData.points[index][3].radius);
	bounds.xmax = (mapData.points[index][0] + mapData.points[index][3].radius);
	bounds.ymin = (mapData.points[index][1] - mapData.points[index][3].radius);
	bounds.ymax = (mapData.points[index][1] + mapData.points[index][3].radius);
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
	console.log('dans wold coords ');
	print(mapData.points);
}

function compute_bounds(mapData) {
	console.log(mapData.points)
	let bounds = {};
	setBounds(bounds, mapData, 0);
	//console.log('bounds', bounds);
	for (let i = 1; i < mapData.points.length; i++) {
		update_bounds(bounds, mapData, i);
	}
	mapData.size_map = Math.max(bounds.xmax - bounds.xmin, bounds.ymax - bounds.ymin);
	mapCoords_to_worldCoords(mapData, bounds);

}



export default compute_bounds;
