import vtkTriangle from "@kitware/vtk.js/Common/DataModel/Triangle";

function compute_normal(tab, polyData) {
	let points = polyData.getPoints().getData();
	let p1 = [
		points[tab[0] * 3],
		points[tab[0] * 3 + 1],
		points[tab[0] * 3 + 2],
	];
	let p2 = [
		points[tab[1] * 3],
		points[tab[1] * 3 + 1],
		points[tab[1] * 3 + 2],
	];
	let p3 = [
		points[tab[2] * 3],
		points[tab[2] * 3 + 1],
		points[tab[2] * 3 + 2],
	];
	let normal = [0, 0, 0];
	vtkTriangle.computeNormal(p1, p2, p3, normal);
	return normal;
}

// creates normal tab for each triangle of terain
function store_normals(normal_index, poly_index, polyData, mapData) {
	let polys_tab = polyData.getPolys().getData();
	let idx_pts = [
			polys_tab[poly_index],
			polys_tab[poly_index + 1],
			polys_tab[poly_index + 3],
		];

	mapData.normals[normal_index] = {
		idx_points: idx_pts,
		normal: compute_normal(idx_pts, polyData),
	}
	idx_pts = [
			polys_tab[poly_index + 1],
			polys_tab[poly_index + 2],
			polys_tab[poly_index + 3],
		];

	mapData.normals[normal_index + 1] = {
			idx_points: idx_pts,
			normal: compute_normal(idx_pts, polyData),
	}
}

function change_resolution(mapData) {
	mapData.res_offset = mapData.size_map / mapData.resolution_max;
	while (mapData.res_offset % 1 !== 0) {
		mapData.resolution_max--;
		mapData.res_offset = mapData.size_map / mapData.resolution_max;
	}
}


// sets data height to display map
function generate_map(mapData, polyData) {
	let nbPoints = (mapData.size_map + 1) * (mapData.size_map + 1);
	let numPlanes = (mapData.size_map * mapData.size_map) / mapData.res_offset;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(5 * numPlanes);
	polyData.getPolys().setData(polys, 1);

	if (mapData.size_map > mapData.resolution_max && mapData.res_flag === true) {
		change_resolution(mapData);
	}
	mapData.normals = new Array(numPlanes * 2); // 1 plane composed of 2 triangles
	let idx = 0;
	let z_index = 2;
	// sets heights using heat map
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			points[idx * 3] = i;
			points[idx * 3 + 1] = j;
		//	points[idx * 3 + 2] = 0; // z coords
			points[z_index] = mapData.height_map[i][j];
			z_index += 3;
			idx++;
		}
	}
	idx = 0;
	let normal_idx = 0;
	// links points into rectangles
	for (let k = 0; k < mapData.size_map; k += mapData.res_offset) {
		for (let l = 0; l < mapData.size_map; l +=mapData.res_offset) {
			polys[idx * 5] = 4;
			polys[idx * 5 + 1] = k * (mapData.size_map + 1) + l; // ref
			polys[idx * 5 + 2] =  k * (mapData.size_map + 1) + l + mapData.res_offset; // right
			polys[idx * 5 + 3] = polys[idx * 5 + 2] + ((mapData.size_map + 1) * mapData.res_offset); // right bottom
			polys[idx * 5 + 4] = polys[idx * 5 + 1] + ((mapData.size_map + 1) * mapData.res_offset); // down
			store_normals(normal_idx, idx * 5 + 1, polyData, mapData);
			normal_idx+=2;
			idx++;
		}
	}
}

export default generate_map;
