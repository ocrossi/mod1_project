import SimplexNoise from 'simplex-noise';
import { store_heat } from "./mapUtils";

export function add_noise_heights(heat_map, mapData) {
	let simplex = new SimplexNoise();
	for (let i = 0; i <= mapData.size_world; i++) {
		for (let j = 0; j <= mapData.size_world; j++) {
			let nx = i / mapData.size_world - 0.5;
			let ny = j / mapData.size_world - 0.5;
			let scaler = mapData.highest / 2;	
			let height = (simplex.noise2D(nx, ny) + 1) * scaler;
			store_heat(i, j, -2, height, heat_map);
		}
	}
}
