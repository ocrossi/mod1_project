function test_memory() {
	let big_tab = new Array(1000000);

	for (let i  = 0; i < 1000000; i++) {
		big_tab[i] = () => ( {
			isTerrain: 0,
			test_water: new Array(5),
			isOuterWall: 0,
		}
		);
	}
	console.log('wsh');
	console.log('BIGTAB 0 ', big_tab[0]);
}

export default test_memory;
