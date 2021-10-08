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

function get_tenth_vector(mapData, idx1, idx2) {
	let vec = [0, 0, 0];

	vec[0] = Math.round((mapData.points[idx1][0] - mapData.points[idx2][0]) / 10);
	vec[1] = Math.round((mapData.points[idx1][1] - mapData.points[idx2][1]) / 10);
	vec[2] = (mapData.points[idx1][2] - mapData.points[idx2][2]) / 10;

	console.log('in tenth vec we have', vec);
	return vec;
}

function add_points(mapData) {
	let dist = Math.sqrt(vtkMath.distance2BetweenPoints(mapData.points[0], mapData.points[1]));
	//const vec = [5, 5, 0];
	const vec = get_tenth_vector(mapData, 0, 1);
	raise_ridge(mapData, mapData.points[1], vec, 10);
	console.log("end of addPoints", mapData.points);
}

export default add_points;
