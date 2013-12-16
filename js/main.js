baustelle = $('#baustelle').HTMLLot({codeBoxHeadline: "test"});
baustelle.addUnit('level', 'Stockwerk');
baustelle.addUnit('roof', 'Dach');
baustelle.addUnit('window', 'Fenster');
baustelle.addUnit('door', 'Tür');

// Drag and Drop handler
function handleDragStart(e) {
		console.log("DragStart");
		e.dataTransfer.setData('text/html', this.innerHTML);
	}
	function handleDragOver(e) {
		$('.house').animate({
		bottom: "10px"
		});
	}
	function handleDragLeave(e) {
		$('.house').animate({
		bottom: "0px"
		});
	}
	function handleDrop(e) {
		console.log("Drop");
	}
	function handleDragEnd(e) {
		$('.house').animate({
		bottom: "0px"
		});
	}
	// Drag and Drop
	$('.unit-icon').each(function() {
		this.addEventListener('dragstart', handleDragStart, false);
		this.addEventListener('drop', handleDrop, false);
		this.addEventListener('dragend', handleDragEnd, false);
	});
	
	$('.house')[0].addEventListener('dragover', handleDragOver, false);
	$('.house')[0].addEventListener('dragleave', handleDragLeave, false);