var baustelle = $('#baustelle').HTMLLot({lang: 'xml'});
baustelle.addUnitList(units);

baustelle.addChallenge(new htmlbChallenge('groundCount', units.ground, 'all', 1, 'exact'));
baustelle.addChallenge(new htmlbChallenge('doorCount', units.door, 1, 1, 'exact'));
baustelle.addChallenge(new htmlbChallenge('groundWindowCount', units.window, 1, 1, 'minimum'));

baustelle.addChallenge(new htmlbChallenge('levelCount', units.level, 'all', 2, 'exact'));

baustelle.addChallenge(new htmlbChallenge('allWindowCount', units.window, 'all', 4, 'minimum'));

baustelle.addChallenge(new htmlbChallenge('roofCount', units.roof, 'all', 1, 'exact'));
baustelle.addChallenge(new htmlbChallenge('chimneyCount', units.chimney, 'all', 1, 'exact'));