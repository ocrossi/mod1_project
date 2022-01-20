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

//function process_input()

function split_newline(text, charnl) {
	//let lineTab = text.split("\\n");
	let lineTab = text.split(charnl);
	if (lineTab[lineTab.length - 1] === "")
		lineTab.pop();
	return lineTab;
}

function trim_first_input(mapData) {
	const reg = new RegExp('".*"');
	const t1 = reg.exec(mapData.input); // takes everything in double quotes cozz for now fixed input
	const t2 = t1[0].substring(1, t1[0].length - 2); // suppress 1st and last double quote
	let lineTab = split_newline(t2, "\\n");

	if (lineTab.length < 1) return false;
	mapData.input = lineTab;
}

function check_new_input(mapData) {
	mapData.reset_map = false;
	mapData.points = [];
	let lname = mapData.file_name.length;
	let extension = mapData.file_name.substring(lname - 5, lname);


	mapData.input = split_newline(mapData.input, "\n");
	if (extension.localeCompare(".mod1") !== 0 || mapData.input.length === 0) 
		return -1;
	return 1;
}

// browse input file, divides it into chunks of points, checks points and
// stores them in global mapData.points variable

function all_heights_null(mapData) {
	for (let i = 0; i < mapData.points.length; i++) {
		if (mapData.points[i][2] !== 0) return false;
	}
	return true;
}

function parse_input(mapData) {
	const reg = new RegExp("([0-9]+,[0-9]+,[0-9]+)");

	if (mapData.reset_map === false) {
		if (trim_first_input(mapData) === -1) return false;
	}
	else {
		if (check_new_input(mapData) === -1) return false;
	}

	for (let i = 0; i < mapData.input.length; i++) {
		let pointsTab = mapData.input[i].split(" ");
		for (let j = 0; j < pointsTab.length; j++) {
			if (pointsTab[j].match(reg) === null) {
				console.log("FAILURE REGEXP");
				return false;
			}
			if (store_point(pointsTab[j], mapData) === false) return false;
		}
	}
	if (all_heights_null(mapData) === true) return false;
	return true;
}

export default parse_input;
