import generate_heat_map2 from './generateHeatMap2.js';
import generate_map2 from "./generateScaleMap2.js";
import change_map_dimensions from "./changeMapDimensions.js";
import create_map from "./createMap.js";
import parse_input from "./parsing.js";
import { l } from '@kitware/vtk.js/vendor/jszip/lib';

export function set_map_input(mapData) {
	if (parse_input(mapData) === false) {
		console.error("input parsing failure"); // faire affichage fail parser a l ecran
	}
	/*
	mapData.size_map = 0;
	mapData.size_world = 0;
	mapData.highest = 0;
	mapData.res_offset = 1;
	mapData.max_height = 0;
	*/
}

export function change_res(mapData) {
	const e = document.getElementById('resolution');
	mapData.resolution_max = e.value;
}

export function toggle_square_f(mapData) {
	const e = document.getElementById('square_f');
	mapData.square_flattening = e.checked;
}

export function toggle_sigmoid(mapData) {
	const e = document.getElementById('sigmo_f');
	mapData.sigmoid_flattening = e.checked;
}

export function toggle_heats(mapData) {
	const e = document.getElementById('comb_heat');
	mapData.combine_heats = e.checked;
}

export function toggle_noise(mapData) {
	const e = document.getElementById('add_noise');
	mapData.highest *= mapData.res_offset;
	mapData.noise_map = e.checked;
}

export function generate_new_map(polyData, mapData) {
	create_map(mapData);
	change_map_dimensions(mapData);
	generate_heat_map2(mapData);
	generate_map2(mapData, polyData);
}
