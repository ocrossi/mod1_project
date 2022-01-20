import { square_flattening, sigmoid_flattening, compute_height, store_heat } from "./mapUtils";
import {add_noise_heights} from "./perlinMap.js";


function mark_terrain(index, heat_map, mapData) {
	let radius = mapData.points[index][3].radius;
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let sqrRadius = Math.pow(radius, 2);
	let factor = mapData.points[index][3].factor;
	//console.log('radius', radius);

	for (let offsetY = -radius; offsetY <= radius; offsetY += mapData.res_offset) {
		while ((offsetY + centreY) % mapData.res_offset !== 0)
			offsetY++;
		for (let offsetX = -radius; offsetX <= radius; offsetX += mapData.res_offset) {
			while ((offsetX + centreX) % mapData.res_offset !== 0)
				offsetX++;
			let sqrDstFromCenter = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);
			if (sqrDstFromCenter <= sqrRadius) {
				let brushX = centreX + offsetX;
				let brushY = centreY + offsetY;
				let coords = {x_ref: centreX, y_ref: centreY, x_comp: brushX, y_comp: brushY };
				let newHeight = compute_height(coords, radius, factor);
				if (mapData.square_flattening === true)
					newHeight = square_flattening(newHeight, index, mapData);
				if (mapData.sigmoid_flattening === true)
					newHeight = sigmoid_flattening(newHeight, index, mapData);
				newHeight /= mapData.res_offset;
				store_heat((brushX / mapData.res_offset), (brushY / mapData.res_offset)
					, index, newHeight, heat_map);
			}
			if (offsetX + mapData.res_offset > radius)
				break;
		}
		if (offsetY + mapData.res_offset > radius)
			break;
	}
}

// adds height to overlapping hills 
function combine_heats(heat_map, mapData) {
	for (let i = 0; i < mapData.size_world; i++) {
		for (let j = 0; j < mapData.size_world; j++) {
			if (heat_map[i][j].length > 1) {
				for (let k = 1; k < heat_map[i][j].length; k++) {
					heat_map[i][j][0].z += heat_map[i][j][k].z;
				}
			}
		}
	}
}

function store_results(mapData, heat_map) {
	mapData.height_map = new Array(mapData.size_world + 1);

	for (let i = 0; i <= mapData.size_world; i++) {
		mapData.height_map[i] = new Array(mapData.size_world + 1);
		for (let j = 0; j <= mapData.size_world; j++) {
			mapData.height_map[i][j] = heat_map[i][j][0].z;
		}
	}
}

// compute each hill height to combine overlap results
function generate_heat_map2(mapData) {
	mapData.size_world = mapData.size_map / mapData.res_offset;
	mapData.highest /= mapData.res_offset;
	let heat_map = new Array(mapData.size_world + 1);


	// allocate a tab for each pair of x,y coords on the map
	for (let i = 0; i <= mapData.size_world; i++) {
		heat_map[i] = new Array(mapData.size_world + 1);
		for (let j = 0; j <= mapData.size_world; j++) {
			heat_map[i][j] = new Array();
			heat_map[i][j][0] = { x: i * mapData.res_offset, y: j * mapData.res_offset, z: 0, no_height: 1 };
		}
	}
	
	for (let i = 0; i < mapData.points.length; i++) {
		mark_terrain(i, heat_map, mapData);
	}
	if (mapData.noise_map === true) 
		add_noise_heights(heat_map, mapData);
	if (mapData.combine_heats === true)
		combine_heats(heat_map, mapData);
	store_results(mapData, heat_map);
}

export default generate_heat_map2;
