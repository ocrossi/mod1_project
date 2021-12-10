// checks corner coords of unit voxel to deterine terrain type
function unit_voxel_intersection(floor, index_1D, mapData) {
	let x = Math.trunc(index_1D / (mapData.size_map / mapData.unit_length)) * mapData.unit_length;
	let y = (index_1D  % (mapData.size_map / mapData.unit_length)) * mapData.unit_length;
	let isWall = 0;
	let ul = mapData.unit_length;

	let c_height = mapData.heat_map[x][y][0].z;
	if (c_height >= floor * ul && c_height !== 0)
		isWall++;
	c_height = mapData.heat_map[x][y + ul][0].z;
	if (c_height >= floor * ul && c_height !== 0)
		isWall++;
	c_height = mapData.heat_map[x + ul][y][0].z;
	if (c_height >= floor * ul && c_height !== 0)
		isWall++;
	c_height = mapData.heat_map[x + ul][y + ul][0].z;
	if (c_height >= floor * ul && c_height !== 0)
		isWall++;

	if (isWall === 4)
		return 3; // current unit square below terrain
	if (isWall !== 0)
		return 2; // terrain intersection
	return { type: 0, particles: [], size: 0 }; // empty, could be water in future
// particle tab?	
}

let test = 0;

// browse map with a unit voxel to detect empty space, walls and terrain
function allocate_terrain_topography(fluidData, mapData) {
	fluidData.map_topo = new Array(fluidData.height);
	fluidData.length_one_floor = Math.pow((mapData.size_map / mapData.res_offset), 2);
	for (let i = 0; i < fluidData.height ; i++) {
		fluidData.map_topo[i] = new Array(fluidData.length_one_floor);
		for (let j = 0; j < fluidData.length_one_floor; j++) {
			fluidData.map_topo[i][j] = unit_voxel_intersection(i, j, mapData);
			if (typeof fluidData.map_topo[i][j] === 'object')
				test++;
		}
	}
}


// preps data for water computation
function generate_water_grid(mapData, fluidData) {
	fluidData.height = mapData.points[mapData.points.length - 1][2] / mapData.unit_length;
	allocate_terrain_topography(fluidData, mapData);
	console.log('how much empty squares : ', test);
}

export default generate_water_grid;
