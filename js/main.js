
var baustelle = $('#baustelle').HTMLLot({lang: 'xml'});
baustelle.addUnitList(units);
baustelle.addChallenge(new htmlbChallenge('levelCount', units.level, 'all', 3, 'minimum'));
baustelle.addChallenge(new htmlbChallenge('roofCount', units.roof, 'all', 1, 'exact'));
baustelle.addChallenge(new htmlbChallenge('windowCountLevel2', units.window, 2, 2, 'minimum'));