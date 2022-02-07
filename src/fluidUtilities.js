export function add_water_data(fluidData, wpd) {
	let nbParticles = fluidData.fluid_array.length;
	let points = new Float32Array(nbParticles * 3);
	const cells = new Uint32Array(nbParticles + 1);
	
	for (let i = 0; i < nbParticles; i++) {
		points[i * 3] = fluidData.fluid_array[i].pos.x;
		points[i * 3 + 1] = fluidData.fluid_array[i].pos.y;
		points[i * 3 + 2] = fluidData.fluid_array[i].pos.z;
		cells[1 + i] = i;
	}
	cells[0] = nbParticles;
	wpd.getPoints().setData(points,  3);
	wpd.getVerts().setData(cells, 1);
	wpd.modified();
}

export function render_waters(data, mapper, actor, filter) {
	filter.setInputData(data);
	mapper.setInputData(filter.getOutputData());
	actor.setMapper(mapper);
	mapper.setRadius(1);
}

