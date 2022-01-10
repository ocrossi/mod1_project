function one_point_map(mapData) {
	mapData.points[0][3] = {
		radius: mapData.points[0][2],
		factor: 1 / mapData.points[0][2]
	}
	mapData.size_map = 2 * mapData.points[0][2];
	mapData.points[0][0] = mapData.points[0][2];
	mapData.points[0][1] = mapData.points[0][2];
}

export default one_point_map;
