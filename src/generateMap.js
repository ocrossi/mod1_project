import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";

function get_poly_index(index, mapData) {
	return (
		3 *
		(mapData.points[index][0] * (mapData.size_map + 1) +
			mapData.points[index][1])
	);
}

// only compares x and y coordinates for 2 points, no z value included

function sort_input_tab(mapData) {
	let sorted = 0;
	while (sorted != 1) {
		sorted = 1;
		for (let i = 0; i < mapData.points.length - 1; i++) {
			if (mapData.points[i][2] > mapData.points[i + 1][2]) {
				let tmp = mapData.points[i];
				mapData.points[i] = mapData.points[i + 1];
				mapData.points[i + 1] = tmp;
				sorted = 0;
			}
		}
	}
}

function distanceBetweenTwoPoints(t1, t2) {
	return Math.sqrt(Math.pow(t2[0] - t1[0], 2) + Math.pow(t2[1] - t1[1], 2));
}

function get_closest_input_point(x, y, mapData, index) {
	let dist = distanceBetweenTwoPoints(
		[0, 0, 0],
		[mapData.size_map, mapData.size_map, 0]
	);
	let ref = [x, y, 0];
	let ref_index = -1;

	for (let i = 0; i < mapData.points.length; i++) {
		let point = [mapData.points[i][0], mapData.points[i][1], 0];
		let curr_dist = distanceBetweenTwoPoints(ref, point);
		if (curr_dist < dist && i !== index) {
			ref_index = i;
			dist = curr_dist;
		}
	}
	return ref_index;
}

function manage_overlapping_hills(brushX, brushY, mapData, index, newHeight) {
	let index_closest_point = get_closest_input_point(
		brushX,
		brushY,
		mapData,
		index
	);
	let dist_to_closest = distanceBetweenTwoPoints(
		[brushX, brushY, 0],
		mapData.points[index_closest_point]
	);
	let dist_to_current = distanceBetweenTwoPoints(
		[brushX, brushY, 0],
		mapData.points[index]
	);
	let height_closest = mapData.points[index_closest_point][1];
	let dist_current_closest = distanceBetweenTwoPoints(
		mapData.points[index],
		mapData.points[index_closest_point]
	);
	if (
		dist_to_closest < height_closest &&
		dist_current_closest > dist_to_current &&
		dist_to_closest > 1
	) {
		newHeight = newHeight * (dist_to_closest / height_closest);
		/*
		console.group();
		console.log("newHeight", newHeight);
		console.log('dist_to_closest', dist_to_closest);
		console.log('height_closest', height_closest);
		console.log('dist_to_current', dist_to_current);
		console.log('dist_current_closest', dist_current_closest);
		console.groupEnd();
		*/
	}
}

function raise_terrain(mapData, index, points) {
	let radius = mapData.points[index][2];
	let centreX = mapData.points[index][0];
	let centreY = mapData.points[index][1];
	let targetHeight = mapData.points[index][2];
	let deltaHeight = targetHeight - points[get_poly_index(index, mapData) + 2];
	let sqrRadius = Math.pow(radius, 2);

	for (let offsetY = -radius; offsetY <= radius; offsetY++) {
		for (let offsetX = -radius; offsetX <= radius; offsetX++) {
			let sqrDstFromCenter = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);
			if (sqrDstFromCenter <= sqrRadius) {
				let dstFromCenter = Math.sqrt(sqrDstFromCenter);
				let t = dstFromCenter / radius;
				let brushWeight = Math.exp((-t * t) / mapData.brushFallOff);

				let brushX = centreX + offsetX;
				let brushY = centreY + offsetY;

				let z_coord = 3 * (brushX * (mapData.size_map + 1) + brushY) + 2;
				let newHeight = deltaHeight * brushWeight;

				if (mapData.points.length > 1)
					manage_overlapping_hills(brushX, brushY, mapData, index, newHeight);

				if (newHeight < points[z_coord]) {
					/*
					console.group();
					console.count("no one like you");
					console.log("x : ", brushX);
					console.log("y : ", brushY);
					console.log("curr z", points[z_coord]);
					console.log("newHeight", newHeight);
					console.groupEnd();
					*/
				}
				if (newHeight + points[z_coord] < newHeight) newHeight = 0;
				points[z_coord] += newHeight;
			}
		}
	}
}

function get_max_height(mapData) {
	for (let i = 0; i < mapData.points.length; i++) {
		if (mapData.points[i][2] > mapData.max_height)
			mapData.max_height = mapData.points[i][2];
	}
}

function check_validity(mapData, points) {
	for (let i = 0; i < mapData.points.length; i++) {
		let pi = get_poly_index(i, mapData);
		let z_input = mapData.points[i][2];
		let z_map = points[pi + 2];
		if (z_input !== z_map) {
			console.count("mayday");
			if (mapData.points[i][2] < points[pi + 2]) console.log("Upper");
			else console.log("Lower");
			
			console.log("input z : ", mapData.points[i][2]);
			console.log("output z : ", points[pi + 2]);
			// console.group("input");
			console.log("x : ", mapData.points[i][0]);
			console.log("y : ", mapData.points[i][1]);
			console.groupEnd();

			console.group("map");
			console.log("x : ", points[pi]);
			console.log("y : ", points[pi + 1]);
			console.log("z : ", points[pi + 2]);
			console.groupEnd(); /**/
		}
	}
}



function generate_map(mapData, polyData) {
	let nbPoints = (mapData.size_map + 1) * (mapData.size_map + 1);
	let numTriangles = mapData.size_map * mapData.size_map * 2;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(4 * numTriangles);
	polyData.getPolys().setData(polys, 1);

	let idx = 0;
	// sets points to a flat surface
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			points[idx * 3] = i;
			points[idx * 3 + 1] = j;
			points[idx * 3 + 2] = 0; // z coords
			idx++;
		}
	}

	// elevates z coords using heat map
	let z_index = 2;
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			//console.log(mapData.heat_map[i][j]);
			points[z_index] = mapData.heat_map[i][j][0].z;
			z_index += 3;
		}
	}

	/*
	sort_input_tab(mapData);
	for (let i = 0; i < mapData.points.length; i++) {
		if (mapData.points[i][2] !== 0) raise_terrain(mapData, i, points);
	}
	get_max_height(mapData);
*/
	idx = 0;
	// links points into triangles
	for (let k = 0; k < mapData.size_map; k++) {
		for (let l = 0; l < mapData.size_map; l++) {
			polys[idx * 8] = 3;
			polys[idx * 8 + 1] = k * (mapData.size_map + 1) + l; // ref
			polys[idx * 8 + 2] = polys[idx * 8 + 1] + 1; // down
			polys[idx * 8 + 3] = polys[idx * 8 + 1] + (mapData.size_map + 1); // right

			polys[idx * 8 + 4] = 3;
			polys[idx * 8 + 5] = polys[idx * 8 + 2];
			polys[idx * 8 + 6] = polys[idx * 8 + 3];
			polys[idx * 8 + 7] = polys[idx * 8 + 3] + 1;
			idx++;
		}
	}
	check_validity(mapData, points);
}

export { generate_map, sort_input_tab }; // un peu sale, sortir input tab de la au moment de la refacto
