function is_input_point(mapData, coords) {
	for (let i = 0; i < mapData.points.length; i++) {
		if (
			mapData.points[i][0] === coords[0] &&
			mapData.points[i][1] === coords[1]
		)
			return true;
	}
	return false;
}

function right(mapData, coords, lim) {
	while (coords[0] < lim) {
		if (is_input_point(mapData, coords)) return coords;
		coords[0]++;
	}
	if (is_input_point(mapData, coords)) return coords;
	return false;
}

function left(mapData, coords) {
	while (coords[0] > 0) {
		if (is_input_point(mapData, coords)) return coords;
		coords[0]--;
	}
	if (is_input_point(mapData, coords)) return coords;
	//if (is_input_point(mapData, coords)) return coords;
	return false;
}

function down(mapData, coords, lim) {
	while (coords[1] < lim) {
		if (is_input_point(mapData, coords)) return coords;
		coords[1]++;
	}

	if (is_input_point(mapData, coords)) return coords;
	return false;
}
function up(mapData, coords) {
	while (coords[1] > 0) {
		if (is_input_point(mapData, coords)) return coords;
		coords[1]--;
	}
	if (is_input_point(mapData, coords)) return coords;
	return false;
}

function get_closest_point_to_origin(mapData) {
	let ref = 1;
	let j = 0;
	let coords = [0, 0];
	let closest = [0, 0];

	if (is_input_point(mapData, coords)) closest = coords;
	//	console.log(coords[0], coords[1]);
	for (let index = 0; index < mapData.size_map; index++) {
		if (index % 2 === 0) {
			coords[0]++;
		if (is_input_point(mapData, coords))
			{
				console.log(coords);
				//return closest;
			}
		if (down(mapData, coords, index + 1) !== false)
			{
				console.log(coords);
				//return closest;
			}
		if (left(mapData, coords) !== false)
			{
				console.log(coords);
				//return closest;
			}

/*			if (
				is_input_point(mapData, coords) ||
				down(mapData, coords, index + 1) !== false ||
				left(mapData, coords) !== false
			) {
				closest = coords;
				console.count(coords);
			}
*/				
		} else {
			coords[1]++;
			if (is_input_point(mapData, coords))
			{
				console.log(coords);
				//return closest;
			}
		if (right(mapData, coords, index + 1) !== false)
			{
				console.log(coords);
				//return closest;
			}
		if (up(mapData, coords) !== false)
			{
				console.log(coords);
				//return closest;
			}


			/*
			if (
				is_input_point(mapData, coords) ||
				right(mapData, coords, index + 1) !== false ||
				up(mapData, coords) !== false
			) {
					closest = coords;
					console.count(coords);
			}
			*/
		}
	}
}

function add_points(mapData) {
	console.log(mapData.points);
	get_closest_point_to_origin(mapData);
}

export default add_points;
