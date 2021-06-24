// returns length of a given number
function digitCount(num) {
	if (num === 0) return 1;
	return Math.floor(Math.log10(Math.abs(num))) + 1;
}

// transforms point string into coord tab
function store_point(text, mapData) {
	const point = new Array(3);

	text = text.substr(1, text.length);
	point[0] = parseInt(text, 10);
	text = text.substr(digitCount(point[0]) + 1, text.length);
	point[1] = parseInt(text, 10);
	text = text.substr(digitCount(point[1]) + 1, text.length);
	point[2] = parseInt(text, 10);
	if (
		point[0] > mapData.size_max ||
		point[1] > mapData.size_max ||
		point[2] > mapData.size_max
	)
		return false;
	mapData.points.push(point);
	return true;
}

// browse input file, divides it into chunks of points, checks points and
// stores them in global mapData.points variable
function parse_input(mapData) {
	const reg1 = new RegExp('".*"');
	const reg2 = new RegExp("([0-9]+,[0-9]+,[0-9]+)");

	const t1 = reg1.exec(mapData.input); // takes everything in double quotes cozz for now fixed input
	const t2 = t1[0].substr(1, t1[0].length - 2); // suppress 1st and last double quote

	let lineTab = t2.split("\\n");
	if (lineTab.length <= 1) return false;
	for (let i = 0; i < lineTab.length - 1; i++) {
		let pointsTab = lineTab[i].split(" ");
		for (let j = 0; j < pointsTab.length; j++) {
			if (pointsTab[j].match(reg2) === null) {
				console.log("FAILURE REGEXP");
				return false;
			}
			if (store_point(pointsTab[j], mapData) === false) return false;
		}
	}
	return true;
}

export default parse_input;
