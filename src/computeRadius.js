function compute_height(idx, idx_comp, mapData, cradius) {
	let p1 = mapData.points[idx];
	let p2 = mapData.points[idx_comp];
	//let height = 

}

function compute_radius(mapData, index) {
	let radius = mapData.points[index][2];
	let idx_possible_overlap = -1;
	
	if (idx_possible_overlap === -1 || mapData.points.length < 2)
		return radius;
	for (let i = 0; i < mapData.closest_points[index].length; i++) {
		let height = compute_height(index, mapData.closest_points[i].idx, mapData, cradius);
	}
}

export default compute_radius;
