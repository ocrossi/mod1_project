function get_divider(mapData) {
	console.log('get divider', mapData.highest);
	let div = 1;
	while (mapData.highest / div  > mapData.resolution_max)
		div++;
	return (div);
}

function resize_map(mapData) {
	if (mapData.highest < mapData.resolution_max)
		return;
	let div  = get_divider(mapData);
	console.log('dans resize map', div);
	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] = Math.round(mapData.points[i][0] / div);
		mapData.points[i][1] = Math.round(mapData.points[i][1] / div);
		mapData.points[i][2] = Math.round(mapData.points[i][2] / div);
	}

}

export default resize_map;
