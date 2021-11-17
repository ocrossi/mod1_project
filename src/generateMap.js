import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";
import SimplexNoise from 'simplex-noise';

function get_poly_index(index, mapData) {
	return (
		3 *
		(mapData.points[index][0] * (mapData.size_map + 1) +
			mapData.points[index][1])
	);
}

function check_validity(mapData, points) {
	for (let i = 0; i < mapData.points.length; i++) {
		let pi = get_poly_index(i, mapData);
		let z_input = mapData.points[i][2];
		let z_map = points[pi + 2];
		if (z_input !== z_map) {
			console.count("mayday");
			if (mapData.points[i][2] < points[pi + 2]) console.log("Upper");
			else console.log("Lower");
			
			console.log("input z : ", mapData.points[i][2]);
			console.log("output z : ", points[pi + 2]);
			// console.group("input");
			console.log("x : ", mapData.points[i][0]);
			console.log("y : ", mapData.points[i][1]);
			console.groupEnd();

			console.group("map");
			console.log("x : ", points[pi]);
			console.log("y : ", points[pi + 1]);
			console.log("z : ", points[pi + 2]);
			console.groupEnd(); /**/
		}
	}
}



function generate_map(mapData, polyData) {
	let nbPoints = (mapData.size_map + 1) * (mapData.size_map + 1);
	let numTriangles = mapData.size_map * mapData.size_map * 2;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(4 * numTriangles);
	polyData.getPolys().setData(polys, 1);

	let idx = 0;
	// sets points to a flat surface
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			points[idx * 3] = i;
			points[idx * 3 + 1] = j;
			points[idx * 3 + 2] = 0; // z coords
			idx++;
		}
	}

	const simplex = new SimplexNoise();
	// elevates z coords using heat map
	let z_index = 2;
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			var randnoise = simplex.noise3D(i, j, mapData.heat_map[i][j][0].z);
			//console.log(randnoise);
			//if (mapData.heat_map[i][j][0].no_height === 0)
			//	points[z_index] = mapData.heat_map[i][j][0].z + 2 * randnoise;
			//else
				points[z_index] = mapData.heat_map[i][j][0].z;
			//points[z_index] = randnoise * 3;
			z_index += 3;
		}
	}
	idx = 0;
	// links points into triangles
	for (let k = 0; k < mapData.size_map; k++) {
		for (let l = 0; l < mapData.size_map; l++) {
			polys[idx * 8] = 3;
			polys[idx * 8 + 1] = k * (mapData.size_map + 1) + l; // ref
			polys[idx * 8 + 2] = polys[idx * 8 + 1] + 1; // down
			polys[idx * 8 + 3] = polys[idx * 8 + 1] + (mapData.size_map + 1); // right

			polys[idx * 8 + 4] = 3;
			polys[idx * 8 + 5] = polys[idx * 8 + 2];
			polys[idx * 8 + 6] = polys[idx * 8 + 3];
			polys[idx * 8 + 7] = polys[idx * 8 + 3] + 1;
			idx++;
		}
	}
	check_validity(mapData, points);
}

export default generate_map;
