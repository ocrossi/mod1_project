/*
function update_bounds(mapData) {
	let updated_bounds = [
		-mapData.size_max,
		-mapData.size_max,
		2 * mapData.size_max,
		2 * mapData.size_max
	];
	for (let i = 0; i < mapData.points.length; i++) {
		console.log('dans la boucle update bounds : ', updated_bounds);
		updated_bounds[0] = Math.max(updated_bounds[0], mapData.points[i][0] - mapData.points[i][3].radius);
		updated_bounds[1] = Math.max(updated_bounds[1], mapData.points[i][1] - mapData.points[i][3].radius);
		updated_bounds[2] = Math.min(updated_bounds[2], mapData.points[i][0] + mapData.points[i][3].radius);
		updated_bounds[3] = Math.min(updated_bounds[3], mapData.points[i][1] + mapData.points[i][3].radius);
	}
	console.log('end of updated bounds we have : ', updated_bounds);
	console.log('vs normal bounds : ', mapData.bounds);
	
	mapData.bounds = updated_bounds;
	return updated_bounds;
}
*/ 
function update_bounds(mapData) {
	let bounds = [
		mapData.points[0][0] - mapData.points[0][3].radius,
		mapData.points[0][1] - mapData.points[0][3].radius,
		mapData.points[0][0] + mapData.points[0][3].radius,
		mapData.points[0][1] + mapData.points[0][3].radius,
	];
	for (let i = 1; i < mapData.points.length; i++) {
		bounds[0] = Math.min(bounds[0], mapData.points[i][0] - mapData.points[i][3].radius);
		bounds[1] = Math.min(bounds[1], mapData.points[i][1] - mapData.points[i][3].radius);
		bounds[2] = Math.max(bounds[2], mapData.points[i][0] + mapData.points[i][3].radius);
		bounds[3] = Math.max(bounds[3], mapData.points[i][1] + mapData.points[i][3].radius);
		//console.count(bounds);
	}
	mapData.bounds = bounds;
	return bounds;
}

export default update_bounds;
