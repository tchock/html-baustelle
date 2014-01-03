<<<<<<< HEAD
baustelle = $('#baustelle').HTMLLot({codeBoxHeadline: "test"});
baustelle.addUnit('level', 'Stockwerk');
baustelle.addUnit('roof', 'Dach');
baustelle.addUnit('window', 'Fenster');
baustelle.addUnit('door', 'Tür');

// Drag and Drop handler
function handleDragStart(e) {
		this.classList.add('dragstart');
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
	}
	function handleDragOver(e) {
		$('.house').css('border', 'solid 2px');
	}
	function handleDragLeave(e) {
		$('.house').css('border', 'none');
	}
	function handleDrop(e) {
		$('.house').css('background-color', 'red');
		if (e.stopPropagation) {
			e.stopPropagation();
		}
  }
	function handleDragEnd(e) {
		this.classList.remove('dragstart');
	}
	// Drag and Drop
	$('.unit-icon').each(function() {
		this.addEventListener('dragstart', handleDragStart, false);
		this.addEventListener('dragend', handleDragEnd, false);
		this.addEventListener('drop', handleDrop, false);
	});
	
	$('.house')[0].addEventListener('dragover', handleDragOver, false);
	$('.house')[0].addEventListener('dragleave', handleDragLeave, false);
=======
var baustelle = $('#baustelle').HTMLLot({lang: 'xml'});
baustelle.addUnitList(units);
>>>>>>> origin/master
