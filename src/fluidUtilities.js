import vtkSphere from '@kitware/vtk.js/Common/DataModel/Sphere';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';

export function display_water_cube(fluidData, waterPolyData) {
	let nbPoints = 8;
	let numTriangles = 12;

//	let points = new Float64Array(nbPoints * 3);
		let points = [
			0, 0, 0 + fluidData.anim_time,
			0, 0, 1 + fluidData.anim_time,
			0, 1, 0 + fluidData.anim_time,
			0, 1, 1 + fluidData.anim_time,
			1, 0, 0 + fluidData.anim_time,
			1, 0, 1 + fluidData.anim_time,
			1, 1, 0 + fluidData.anim_time,
			1, 1, 1 + fluidData.anim_time,
			// try adding another cube for discontinuity
/*			5, 0, 0 + fluidData.anim_time,
			5, 0, 1 + fluidData.anim_time,
			5, 1, 0 + fluidData.anim_time,
			5, 1, 1 + fluidData.anim_time,
			6, 0, 0 + fluidData.anim_time,
			6, 0, 1 + fluidData.anim_time,
			6, 1, 0 + fluidData.anim_time,
			6, 1, 1 + fluidData.anim_time*/
		];
		console.log(points);

	waterPolyData.getPoints().setData(points, 3);
	//let polys = new Uint32Array(4 * numTriangles);
	
	//let polys = new Uint32Array(4 * numTriangles);
/*
	let polys = [
		4, 1, 2, 6, 5,
		4, 1, 2, 4, 3,
		4, 3, 4, 6, 7,
		4, 5, 6, 8, 7,
		4, 2, 4, 8, 6,
		4, 1, 3, 7, 5,
	];
	*/
	let offset = 8;
	let polys = [
		3, 0, 1, 5,
		3, 0, 5, 4,
		3, 0, 1, 3,
		3, 0, 3, 2,
		3, 2, 3, 7,
		3, 2, 7, 6,
		3, 4, 5, 7,
		3, 7, 4, 6,
		3, 1, 3, 5,
		3, 1, 5, 7,
		3, 0, 2, 4,
		3, 2, 4, 6,
		// 
/*		3, 0 + offset, 1 + offset, 5 + offset,
		3, 0 + offset, 5 + offset, 4 + offset,
		3, 0 + offset, 1 + offset, 3 + offset,
		3, 0 + offset, 3 + offset, 2 + offset,
		3, 2 + offset, 3 + offset, 7 + offset,
		3, 2 + offset, 7 + offset, 6 + offset,
		3, 4 + offset, 5 + offset, 7 + offset,
		3, 7 + offset, 4 + offset, 6 + offset,
		3, 1 + offset, 3 + offset, 5 + offset,
		3, 1 + offset, 5 + offset, 7 + offset,
		3, 0 + offset, 2 + offset, 4 + offset,
		3, 2 + offset, 4 + offset, 6 + offset,*/
	];
	waterPolyData.getPolys().setData(polys, 1);
}


export function display_water_sphere(fluidData, waterPolyData) {
	//return new vtkSphere(0, 0, 10 + fluidData.anim_time);
	let center = [fluidData.fluid_array[0].pos.x, fluidData.fluid_array[0].pos.y, fluidData.fluid_array[0].pos.y];
	

	let waterDroplet = vtkSphereSource.newInstance();
	waterDroplet.setCenter(center);

	return waterDroplet;
}
