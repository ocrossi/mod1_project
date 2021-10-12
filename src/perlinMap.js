import SimplexNoise from 'simplex-noise';

function perlin_map(mapData) {
	let x = 10;
	let y = 4;
	let z = 12;
	let w = 8;
	const simplex = new SimplexNoise(),
    value2d = simplex.noise2D(x, y),
    value3d = simplex.noise3D(x, y, z),
    value4d = simplex.noise4D(x, y, z, w);
		console.log("2d", value2d);
		console.log("3d", value3d);
		console.log("4d", value4d);
}

export default perlin_map;
