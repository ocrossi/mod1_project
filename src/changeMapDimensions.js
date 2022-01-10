import {translate_map} from './mapUtils.js'

function find_divider(mapData) {
	let div = 2;

	while (mapData.size_map / div > mapData.resolution_max)
		div++;
	return div;
}

function change_map_dimensions(mapData) {
	let margin = 0;
	while (mapData.size_map < mapData.highest) {
		mapData.size_map++;
		margin++;
	}
	if (margin === 0) {
		margin += Math.round(mapData.size_map / 10);
		mapData.size_map += margin;
	}
	if (mapData.size_map > mapData.resolution_max) {
		let div = find_divider(mapData);
		while (mapData.size_map % div !== 0) {
			mapData.size_map++;
			margin++;
		}
		mapData.res_offset = div;
	}
	margin = Math.round(margin / 2);
	translate_map(margin, margin, mapData);
}

export default change_map_dimensions;
