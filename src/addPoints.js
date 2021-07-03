import * as vtkMath from '@kitware/vtk.js/Common/Core/Math';

function add_step(p1, vec) {
	let ret = new Array(3);

	ret[0] = p1[0] + vec[0];
	ret[1] = p1[1] + vec[1];
	ret[2] = p1[2] + vec[2];
	return ret;
}

function raise_ridge(mapData, p1, vec, step) {
	console.log(step);
	if (step === 0)
		return;
	const newPoint = add_step(p1, vec);
	mapData.points.push(newPoint);
	step--;
	raise_ridge(mapData, newPoint, vec, step);
}

function check_overlap(p1, ref) {
	 
}

function add_points(mapData) {
	let dist = Math.sqrt(vtkMath.distance2BetweenPoints(mapData.points[0], mapData.points[1]));
	console.log(mapData.points);
	console.log(mapData.size_map);
	console.log(dist);
	const vec = [5, 5, 0];
	raise_ridge(mapData, mapData.points[0], vec, 12);
	console.log(mapData.points);
}

export default add_points;
