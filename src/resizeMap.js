function pgcd(a, b) {
	if (b) 
		return pgcd(b, a % b);
	return Math.abs(a);	
}

function find_tab_pgcd(coords) {
	let gcd = pgcd(coords[0], coords[1]);

	for (let i = 2; i < coords.length; i++)
		gcd = pgcd(gcd, coords[i]);

	return gcd;
}

function cd_closest(threshold, ceil, a, b) {
//	if (threshold % a === 0 && threshold % b === 0)
		
}

function find_cd_closest(threshold, ctab) {
	let cd = cd_closest(Math.round(threshold), ctab[0], ctab[1]);

	console.log(cd);
}

function update_map_boudaries(oversize, mapData) {
	console.log('debut de update map boundaries pts : ', mapData.points);
	let coords_tab = [];
	for (let i = 0; i < mapData.points.length; i++)
		coords_tab = coords_tab.concat(mapData.points[i].slice(0, 2));
	
	let threshold = oversize / mapData.resolution_max;
	let div = find_cd_closest(threshold, coords_tab);
	let pgcd = find_tab_pgcd(coords_tab); // la pgcd est trop grand c de la kick
	console.log('what is pgcd : ', pgcd); // pgcd peut etre trop frand, calcul de threshold

	// + 

	for (let i = 0; i < mapData.points.length; i++) {
		mapData.points[i][0] /= pgcd;
		mapData.points[i][1] /= pgcd;
		mapData.points[i][2] /= pgcd;
	}

	//console.log('in update_map_boudaries pgcd : ', pgcd);
	console.log('fin de update map boundaries pts : ', mapData.points);
}

function resize_map(mapData) {
	let max_oversize = Math.max(mapData.size_map, mapData.highest);

	console.log('highest : ', mapData.highest);
	console.log('size_map : ', mapData.size_map);
	console.log(mapData.points);

	if (max_oversize < mapData.resolution_max)
		return ;
	if (mapData.size_map > mapData.highest)
		update_map_boudaries(max_oversize, mapData);
	//else
	//	shrink_map_dimensions(mapData);

		/*
	let coords_tab = [];
	for (let i = 0; i < mapData.points.length; i++)
		coords_tab = coords_tab.concat(mapData.points[i].slice(0, 3));
	find_pgcd();
*/
	//console.log('res map ctab = ', coords_tab);
}

export default resize_map;
