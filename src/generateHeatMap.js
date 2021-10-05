import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";
import compute_radius from "./computeRadius.js";
import sort_closest_points from "./sortClosestPoint.js";

function store_heat(x, y, index, newHeight, mapData) {
	let heat = {
		z: newHeight,
		index_origin: index,
		no_height: 0,
	};
	if (mapData.heat_map[x][y][0].no_height === 1)
		mapData.heat_map[x][y][0] = heat;
	else {
		if (mapData.heat_map[x][y][0].z < heat.z)
			mapData.heat_map[x][y].unshift(heat);
		else mapData.heat_map[x][y].push(heat);
	}
}

function mark_terrain(index, mapData) {
	let radius = mapData.points[index][3];
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let sqrRadius = Math.pow(radius, 2);
	let factor_complement =
		radius / Math.pow(radius, 2) > mapData.points[index][2]
			? 1 / (Math.pow(radius, 2) * mapData.points[index][2])
			: 1;

	console.group();
	console.log('FACTOR COMPLEMENT', factor_complement);
	console.count('mark terrain');
	console.log('input point', mapData.points[index]);
	console.log('radius', radius);
	console.log('celui qu on aurait pris de base', mapData.points[index][2]);
	console.groupEnd();
	/*
*/
	for (let offsetY = -radius; offsetY <= radius; offsetY++) {
		for (let offsetX = -radius; offsetX <= radius; offsetX++) {
			let sqrDstFromCenter = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);
			if (sqrDstFromCenter <= sqrRadius) {
				let brushX = centreX + offsetX;
				let brushY = centreY + offsetY;

				let newHeight =
					Math.pow(radius, 2) -
					(Math.pow(brushX - centreX, 2) + Math.pow(brushY - centreY, 2));
				let factor = radius / Math.pow(radius, 2);
				newHeight *= factor;
				newHeight = Math.round(newHeight * factor_complement);
				store_heat(brushX, brushY, index, newHeight, mapData);
			}
		}
	}
}

function generate_heat_map(mapData) {
	mapData.heat_map = new Array(mapData.size_map + 1);

	// allocate a tab for each pair of x,y coords on the map
	for (let i = 0; i <= mapData.size_map; i++) {
		mapData.heat_map[i] = new Array(mapData.size_map + 1);
		for (let j = 0; j <= mapData.size_map; j++) {
			mapData.heat_map[i][j] = new Array();
			mapData.heat_map[i][j][0] = { z: 0, no_height: 1 };
		}
	}
	sort_closest_points(mapData);
	for (let i = 0; i < mapData.points.length; i++) {
		
		// sets input points
		mapData.heat_map[mapData.points[i][0]][mapData.points[i][1]][0] = {
			z: mapData.points[i][2],
			index_origin: i,
			no_height: 0,
		};

		// get biggest radius possible for each input point to prevent hills overriding input values
		compute_radius(i, mapData);
		// marks heights of hills for each point
		mark_terrain(i, mapData);
	}
	console.log("end of breaked generate heat map");
	console.log(mapData.closest_points);
}

export default generate_heat_map;
