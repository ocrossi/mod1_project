// checks corner coords of unit voxel to determine terrain type
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

function unit_voxel_intersection2(coords, mapData) {
	let isWall = 0;
	let ul = mapData.unit_length;
	let c_z = mapData.heat_map[coords[1]][coords[2]][0].z;

	console.log('COORDS', coords);

	console.log("x: ", coords[1]);
	console.log("y: ", coords[2]);
	console.log("z: ", coords[0]);
	console.log("cz1 :", c_z);

	if (c_z >= coords[0] * ul && c_z !== 0)
		isWall++;
	c_z = mapData.heat_map[coords[1]][coords[2] + ul][0].z;
	console.log("x: ", coords[1]);
	console.log("y: ", coords[2] + ul);
	console.log("z: ", coords[0]);
	console.log("cz2 :", c_z);

	if (c_z >= coords[0] && c_z !== 0)
		isWall++;
	c_z = mapData.heat_map[coords[1] + ul][coords[2]][0].z;

	console.log("x: ", coords[1] + ul);
	console.log("y: ", coords[2]);
	console.log("z: ", coords[0]);
	console.log("cz3 :", c_z);
	if (c_z >= coords[0] && c_z !== 0)
		isWall++;
	c_z = mapData.heat_map[coords[1] + ul][coords[2] + ul][0].z;
	console.log("x: ", coords[1] + ul);
	console.log("y: ", coords[2] + ul);
	console.log("z: ", coords[0]);
	console.log("cz4 :", c_z);
	if (c_z >= coords[0] && c_z !== 0)
		isWall++;
	console.log('isWall ', isWall);
	if (isWall === 4)
		return 2; // current unit square below terrain
	if (isWall !== 0)
		return { type: 1, particles: [], size: 0 }; // terrain intersection, do we have to add normal tab?
	return { type: 0, particles: [], size: 0 }; // empty, could be water in future
}

function check_intersection(x, y, z, floor) {
	if (c_z > floor)
		return 1;
	return 0;
}

function unit_voxel_intersection3(coords, mapData) {
	let isWall = 0;
	let ul = mapData.unit_length;
	let c_z = mapData.heat_map[coords[1]][coords[2]][0].z; //

	isWall += check_height(coords[1], coords[2], c_z, coords[0]);
	isWall += check_height(coords[1], coords[2], c_z, coords[0]);
}

let test = 0;
let test1 = 0;

// browse map with a unit voxel to detect empty space, walls and terrain
function allocate_terrain_topography(fluidData, mapData) {
	fluidData.map_topo = new Array(fluidData.height);
	fluidData.length_one_floor = Math.pow((mapData.size_map / mapData.res_offset), 2);
	for (let i = 0; i < fluidData.height ; i++) {
		fluidData.map_topo[i] = new Array(fluidData.length_one_floor);
		for (let j = 0; j < fluidData.length_one_floor; j++) {
			fluidData.map_topo[i][j] = unit_voxel_intersection(i, j, mapData);
			if (typeof fluidData.map_topo[i][j] === 'object')
				test1++;
		}
	}
}

function allocate_terrain_topography2(mapData, fluidData) {
	fluidData.map_topo = new Array(fluidData.height);
	fluidData.length = mapData.size_map / mapData.unit_length;
	for (let i = 0; i < fluidData.height; i++) {
		fluidData.map_topo[i] = new Array(fluidData.length);
		for (let j = 0; j < fluidData.length; j++) {
			fluidData.map_topo[i][j] = new Array(fluidData.length);
			for (let k = 0; k < fluidData.length; k++) {
				fluidData.map_topo[i][j][k] = unit_voxel_intersection2([i, j, k], mapData);
				if (typeof fluidData.map_topo[i][j][k] === 'object' && fluidData.map_topo[i][j][k].type === 0)
					test++;
			}
		}
	}
}


// preps data for water computation
function generate_water_grid(mapData, fluidData) {
	fluidData.height = mapData.points[mapData.points.length - 1][2] / mapData.unit_length;
	allocate_terrain_topography2(mapData, fluidData);
	//allocate_terrain_topography(fluidData, mapData);
	console.log('how much empty squares topo: ', test1);
	console.log('how much empty squares topo2 : ', test);
}

export default generate_water_grid;
