var baustelle = $('#baustelle').HTMLLot({lang: 'html'});
baustelle.addUnitList(units);

baustelle.addChallenge(new htmlbChallenge('groundCount', units.ground, 'all', 1, 'exact'));
baustelle.addChallenge(new htmlbChallenge('doorCount', units.door, 'all', 2, 'exact'));
baustelle.addChallenge(new htmlbChallenge('groundWindowCount', units.window, 1, 3, 'exact'));

baustelle.addChallenge(new htmlbChallenge('levelCount', units.level, 'all', 4, 'exact'));

baustelle.addChallenge(new htmlbChallenge('thirdLevelWindow', units.window, 3, 1, 'minimum'));

baustelle.addChallenge(new htmlbChallenge('allWindowCount', units.window, 'all', 6, 'minimum'));

baustelle.addChallenge(new htmlbChallenge('roofCount', units.roof, 'all', 1, 'exact'));
baustelle.addChallenge(new htmlbChallenge('chimneyCount', units.chimney, 'all', 0, 'maximum'));