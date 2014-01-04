// Thanks to Stack Overflow user "sbgoran" for the basis of this deepDiffMapper
var deepDiffMapper = function() {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                var output = obj1 || obj2;
                output.diffState = this.compareValues(obj1, obj2);
                return output;
            }
            
            if (this.isArray(obj1) && this.isArray(obj2)) {
                var diff = [];
            } else {
                var diff = {};
            }
            
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }
                
                if (key == 'unit')
                    diff[key] = obj1[key];

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }
                
                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (key == 'unit')
                    diff[key] = obj2[key];
                
                if (this.isFunction(obj2[key]) || key == 'unit' || ('undefined' != typeof(diff[key]))) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                return this.VALUE_DELETED;
            }

            return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
            return toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
            return toString.apply(obj) === '[object Array]';
        },
        isObject: function(obj) {
            return toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    }
}();

(function ( $ ) {
    
    // HTML Baustelle Main Object
    $.fn.HTMLLot = function(options) {

        var o = $.extend({
            lang: 'sgml', // Sprache
            codeBoxHeadline: 'Schreibe deinen Code',
            codeBoxText: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.'
        }, options );

        var self = this;
        
        // Wrapper Klasse hinzufügen
        self.addClass('htmlb wrapper');
        
        // DOM Elemente
        var contentBox;
        var codeBox;
        // Einzelne Elemente der Code Box
        var codeBoxElements = {
            headline: $('<h3 class="htmlb"></h3>'),
            text: $('<p class="htmlb info-text">'),
            editor: $('<textarea class="htmlb editor">')
        };
        var houseBox;
        var house;
    
        var elementList;
        var units = [];
        
        // Gesetzte Assets
        var clouds = [];
        // Haus Datenstruktut
        houseStruct = [];
        // Codezeilen, die gehighlightet werden sollen
        var updatedLines = [];
        // Anzahl der Stockwerke, die von der Kamera aufgefasst werden sollen
        var maxLevels = 4;
		
		var dragUnit = null;
		
        ///
        /// Initialization
        ///
        function init () {
            // Coontent Box
            contentBox = $('<div class="htmlb content">');
            self.append(contentBox);
            
            // Sky
            contentBox.append('<div class="htmlb sky">');
            
            // Landside
            contentBox.append('<div class="htmlb landside">');
            
            // Code Box
            
            // Editor: Sprachspezifische Optionen
            var indent = (o.lang != 'sgml') ? 2 : 0;
            var autoClose = (o.lang != 'sgml');
            
            codeBox = $('<div class="htmlb code-box">');
            codeBox.append(codeBoxElements.headline, codeBoxElements.text);
            contentBox.append(codeBox);
            codeBoxElements.editor = CodeMirror(codeBox[0], {
              mode:  "text/html",
              lineNumbers: true,
              indentUnit: indent,
              autoCloseTags: autoClose,
              autoCloseBrackets: true,
              theme: "lesser-dark"
            });
                        
            codeBoxElements.headline.html(o.codeBoxHeadline);
            codeBoxElements.text.html(o.codeBoxText);
        
            // Haus
            houseBox = $('<div class="htmlb house-box">');
            contentBox.append(houseBox);
            
            house = $('<div class="htmlb house">');
            houseBox.append(house);
            
            houseBox[0].addEventListener('dragenter', function(e){
                if (e.stopPropagation) {
                    e.stopPropagation ();
                }
                else {
                    e.cancelBubble = true;
                }
                self.updateZoomLevel(1);
            },false);
            
            houseBox[0].addEventListener('dragover', function(e){
                e.preventDefault();
                
                var houseOffset = house.offset();
                var relX = e.pageX - houseOffset.left;
                var relY = e.pageY - houseOffset.top;
                
                e.dataTransfer.dropEffect = 'move';
                
                if (relY >= 0 && relY <= house.height()) {
                    var levelHeight = house.height()/maxLevels;
                    var currentMouseLevel = Math.round((house.height()-relY) / (levelHeight-1));
                    house.find('.preview').remove();
                    house.append($('<div class="htmlb asset '+ dragUnit.getName() +' preview" style="bottom: '+100/maxLevels*currentMouseLevel+'%; height: '+(100/Math.max(maxLevels,4))+'%">'));
                    var houseLevels = house.children().not('.preview');
                    for (var i = houseLevels.length-1; i >= 0; i--) {
                        var bottom = (i >= currentMouseLevel) ? ((100/maxLevels)*(i))+(100/maxLevels) : (100/Math.max(maxLevels,4))*i;
                        $(houseLevels[i]).stop().animate({
                            height: (100/maxLevels)+"%",
                            bottom : bottom+"%"
                        },20);
                    }
                } 
			  
			}, false);
			
			houseBox[0].addEventListener('drop', function(e){
                var houseOffset = house.offset();
			  var relX = e.pageX - houseOffset.left;
			  var relY = e.pageY - houseOffset.top;
			  
			  if (e.stopPropagation) {
				e.stopPropagation();
			  }
			  
			  if (relY >= 0 && relY <= house.height()) {
				var levelHeight = house.height()/maxLevels;
				var currentMouseLevel = Math.round((house.height()-relY) / levelHeight);
				self.addUnitToStruct('root', dragUnit, maxLevels - houseStruct.length -1 - currentMouseLevel);
				house.find('.preview').remove();
			  }
			});
			
            // Element Selection
            elementList = $('<ul class="htmlb element-list">');
            self.append(elementList);
            
            // Editor Change Event
            codeBoxElements.editor.on('change', function(e){
                self.checkEditor();
            });
        }
        
        this.getStage = function () {
            return contentBox;
        }
        
        this.addUnit = function (unit) {
            units.push(unit);
            // Füge zu Element Auswahl hinzu, wenn Spec für Sprache vorhanden ist
            if (unit.getSpec(o.lang) != null)
                addIcon(unit);
        }
		
        function addIcon (unit) {
            elementList.append(unit.getIcon());
            unit.getIcon()[0].addEventListener('dragstart', function(e){
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('unit', unit);
				dragUnit = unit;
			}, false);
            elementList[0].addEventListener('dragend', function(e){
                house.find('.preview').remove();
			},false);
        }
        
        this.addUnitList = function (unitList) {
            $.each(unitList, function(unitName,unitObj){
                self.addUnit(unitObj);
            });
        }
        
        /// Gibt die Unit zurück, die zu einem angegebenen Tag passt
        /// @param tag Tag, nach dem gesucht wird
        this.getUnitByTag = function (tag) {
            for (var i = units.length-1; i>=0; i--) {
                if (units[i].getSpec(o.lang).tag == tag)
                    return units[i];
            }
            return null;
        }
        
        /// Gibt die Unit zurück, die zu einem angegebenen Namen passt
        /// @param name Name des gesuchten Objektes
        this.getUnitByName = function (name) {
            for (var i = units.length-1; i>=0; i--) {
                if (units[i].getName() == name)
                    return units[i];
            }
            return null;
        }
        
        this.addUnitToStruct = function (parent, unit, pos) {
            var struct = (parent == 'root') ? houseStruct : parent.childNodes;
            struct.splice(pos, 0, {
                unit: unit,
                attributes: (typeof unit.getSpec(o.lang).defaultAttributes !== 'undefined') ? unit.getSpec(o.lang).defaultAttributes : {},
                childNodes: [],
                diffState: 'created'
            });
            self.updateEditor();
            self.highlightChangedLines();
        }
        
        /// Aktualisiert das Rendering des Hauses
        this.updateRendering = function () {
            
            house.empty();
            for (var i = houseStruct.length-1; i>=0; i--) {
                house.append($('<div class="htmlb asset '+houseStruct[i].unit.getName()+'" style="bottom: '+((100/Math.max(houseStruct.length,4))*(houseStruct.length-1-i))+'%; height: '+(100/Math.max(houseStruct.length,4))+'%">'));
            }
            self.updateZoomLevel(0);
        }
        
        this.updateEditor = function () {
            var editor = codeBoxElements.editor;
            var editorText = "";
            var lineCount = {value: 1};
            $.each(houseStruct, function(index, value) {
               var textToAdd = addTagToEditor(value, 0, lineCount);
               editorText += textToAdd;
               
            });
            editorText = editorText.substr(0, editorText.length-1);
            editor.setValue(editorText);
        }
        
        function addTagToEditor (tagObject, level, lineCount) {
            var editorText = '';
            
            // Fügt Tabs hinzu, wenn gebraucht
            var tabs = '';
            for (var i = level; i > 0; i--) {
                tabs += '\t';
            }
            
            // Fügt Attribute hinzu, wenn benötigt
            var attributes = '';
            $.each(tagObject.attributes, function(key, value) {
                attributes += ' '+key+'="'+value+'"';
            });
            // Liest Tag Bezeichner aus
            var tag = tagObject.unit.getSpec(o.lang).tag;
            // liest aus, ob Element Kindelemente haben kann
            var canHaveChildNodes = tagObject.unit.getSpec(o.lang).allowChildNodes;
            // checkt, ob neues Objekt, oder vor neuer Generierung bereits vorhanden gewesen
            var isNewNode = (tagObject.diffState == 'created');
            // Fügt Zeile als neu hinzu, falls sie wirklich neu ist
            if (isNewNode) { 
                updatedLines.push(lineCount.value) 
            };
            // Definiert selbstschließenden Tag, wenn XML Mode und Element keine Kindelemente haben kann
            var selfclose = (o.lang == 'xml' && !canHaveChildNodes) ? '/' : '';
            
            // Fügt Code hinzu
            editorText += tabs+'<'+tag+attributes+selfclose+'>'; // start Tag
            if (typeof tagObject.childNodes !== 'undefined' && tagObject.childNodes.length > 0) {
                editorText += "\n"; // neue Zeile
                ++lineCount.value;
                // Durchgeht alle Kind Nodes
                $.each(tagObject.childNodes, function(index, value) {
                   var textToAdd = addTagToEditor(value, level+1, lineCount); // Rekursiv neuen Code hinzufügen, level+1 für nächste Tab Reihe
                   editorText += textToAdd;
                });
                editorText += tabs; // Tab für schließenden Tag oder nachfolgenden Code
            }
            
            // Schließender Tag, wenn Element Kindelemente haben kann und wenn kein SGML Mode
            if (o.lang != 'sgml' && canHaveChildNodes) {
                // Fügt Zeile als neu hinzu, falls sie wirklich neu ist
                if (isNewNode && updatedLines.indexOf(lineCount.value) <= -1) updatedLines.push(lineCount.value);
                editorText += "</"+tag+">\n"; // End Tag
                ++lineCount.value;
            } else {
                editorText += "\n";
                ++lineCount.value;
            }
            
            return editorText;
        }
        
        /// Entfernt alle gehighlighteten Zeilen und leert updatedLines
        function removeEditorHighlights () {
            for (var i = updatedLines.length-1; i>=0; i--) {
                codeBoxElements.editor.removeLineClass(updatedLines[i]-1, 'background', 'line-highlight');
            }
            updatedLines = [];
        }
        
        /// Hebt neue Zeilen hervor und entfernt sie nach 3 Sekunden wieder
        this.highlightChangedLines = function () {
            for (var i = updatedLines.length-1; i>=0; i--) {
                codeBoxElements.editor.addLineClass(updatedLines[i]-1, 'background', 'line-highlight');
            }
            window.setTimeout(function () {removeEditorHighlights() }, 3000);
        }
        
        /// Löscht die diffState Einträge in der Datenstruktur
        function removeDiffNotes (struct) {
            for (var i = struct.length-1; i>=0; i--) {
                if (typeof struct[i].diffState !== 'undefined') {
                    // Wenn Diff State "deleted" ist, dann lösche den kompletten Node
                    if (struct[i]['diffState'] == 'deleted') {
                        struct.splice(i--, 1);
                        continue;
                    }
                    // ansonsten lösche einfach den diffState Eintrag
                    delete struct[i]['diffState'];
                }
                if (typeof struct[i].childNodes !== 'undefined' && struct[i].childNodes.length > 0) {
                    removeDiffNotes(struct[i].childNodes);
                }
            }
        }
    
        /// Funktion, die aufgerufen wird, wenn neuer Inhalt in Code Editor eingegeben wird
        this.checkEditor = function () {
            // Exception Handling, damit Browser nicht abstürzen, wenn Tags nicht erkann werden
            //try {
                var editorValue = codeBoxElements.editor.getValue();
                // SGML Mode Only!
                if (o.lang == 'sgml') {
                    // Entferne alle New Lines, damit auch bei Zeilenumbrüchen in Tags RegExp funktionieren
                    editorValue = editorValue.replace("\n","");
                    // Schließt alle Tags, damit beim Umwandeln in DOM keine Verschachtelung vorgenommen wird
                    editorValue = editorValue.replace(/\<(.*?)\>/g, "<$1></$1>");
                }
                // Wandelt String in DOM um
                var editorDOM = $(editorValue);
                // Convertiert DOM in Haus-Struktur und speichert diese
                var newStruct = convertDomToStruct(editorDOM, 'root');
                
                houseStruct = deepDiffMapper.map(houseStruct, newStruct);
                /*console.log(newStruct);
                console.log(diffStruct);
                */
                removeDiffNotes(houseStruct); // rauslöschen! Muss in die Render Update Methode benutzen, nachdem neu gezeichnet wurde
                self.updateRendering();
                
                
                /* TO KILL START */
                var editorText = "";
                $.each(houseStruct, function(index, value) {
                   var textToAdd = addTagToEditor(value, 0, {value: 0});
                   editorText += textToAdd;
                   
                });
                editorText = editorText.substr(0, editorText.length-1);
                $('#debug-output').html(editorText);
                /* TO KILL END */
            /*
            } catch (e) {
                console.log(e.name +"==> "+ e.message);
            }*/
        }
        
        /// Konvertiert DOM in eigene Datenstruktur
        /// @param dom DOM, der umgewandelt werden soll
        /// @param parentName Name des Elternelements, "root" wenn oberste ebene
        function convertDomToStruct (dom, parentName) {
            var struct = [];
            // durchgehe alle DOM Nodes
            $.each(dom, function(index, value) {
                // filtere textnodes heraus
                if (value.nodeName != '#text') {
                    var unit = self.getUnitByTag(value.nodeName.toLowerCase());
                    // Füge Tag nur hinzu, wenn er unter den erlaubten Tags ist
                    if (unit != null && unit.parentAllowed(parentName, o.lang)) {
                        
                        var attributes = value.attributes;
                        var childNodes = value.childNodes;
                        
                        var tempAttributes = {};
                        $.each(attributes, function(index, value) {
                            
                            // Füge Attribut hinzu, wenn es erlaubt ist
                            if (unit.attributeAllowed(value.name, o.lang)) {
                                tempAttributes[value.name] = value.value;
                            }
                        });
                        
                        // Node Objekt, das hinzugefügt werden soll
                        var tempNode = {
                            unit: unit,
                            attributes: tempAttributes
                        }
                        
                        // checke die Childnodes, wenn Childnodes in der Unit erlaubt sind
                        if (unit.childnodesAllowed(o.lang))
                            tempNode.childNodes = convertDomToStruct(value.childNodes, unit.getName());
                        
                        // Fügt Nodes zur bisherigen Struktur hinzu
                        struct.push(tempNode);
                    }
                }
            });
            return struct;
        }
        
        this.getStruct = function () {
            return houseStruct;
        }
        
        /// Aktualisiert das Zoomlevel und ändert daraufhin die Größe des Hauses
        /// @param diff Differenz zur Anzahl der Werte in der Datenstruktur (z.B. 1, wenn ein neues Stockwerk bei DragDrop hinzugefügt werden soll)
        this.updateZoomLevel = function (diff) {
            var oldLevel = maxLevels;
            maxLevels = Math.max(houseStruct.length+diff, 4);
            var oldSideRatio = 2.488888888888889;//house.width()/(house.height()/oldLevel);
            var newWidth = (house.height()/maxLevels)*oldSideRatio;
            if (diff > 0) {
				var i = 0;
                house.stop().find('.level, .ground, .roof').each(function () {
					$(this).stop().animate({
						bottom: ((100/maxLevels)*(i++))+'%',
						height: (100/maxLevels)+'%'
					},400);
				});
            }
            house.stop().animate({
                width: newWidth,
                marginLeft: -newWidth*0.5
            },400);
        }
        
        this.addCloud = function (type, posY, speed) {
            clouds.push(new htmlbCloud(self, type, posY, speed));   
        }
        
        this.removeCloud = function (cloud) {
            for (var i = clouds.length-1; i >= 0; i--) {
                if (clouds[i] == cloud) {
                    clouds.splice(i, 1);
                    cloud.getDOM().remove();
                }
            }
        }
        


        init();
        return this;
    };
    
    // Unit
    htmlbUnit = function (name, title, sgmlSpecs, xmlSpecs, htmlSpecs) {
        
        // Spezifikationen der Einheit
        // null, wenn für Sprache nicht vorhanden
        var specs = {
            sgml: sgmlSpecs,        // SGML Specs
            xml: xmlSpecs,          // XML Specs
            html: htmlSpecs         // HTML Specs
        };
        
        var self = this;
    
        var icon = $('<li class="htmlb unit-icon unit-'+name+'" data-unit-name="'+name+'" draggable="true" >'+title+'</li>');;
    
        /// Gibt Icon für die Bauteil Auswahl zurück
        this.getIcon = function () {
            return icon;
        }
        
        /// Gibt die Spezifikation des Elements zurück
        /// @param type sgml,xml oder html für die gewünsche Sprachspezifikation
        this.getSpec = function (type) {
            return specs[type];
        }
        
        /// Gibt aus, ob ein Attribut in der gegebenen Sprache erlaubt ist
        /// @param attr Attribut Name
        /// @param lang Sprachdefinition
        this.attributeAllowed = function (attr, lang) {
            var isAllowed = false;
            
            // Duchgeht alle Attribute der definierten Sprache
            for (var i = specs[lang].allowedAttributes.length-1; i>= 0; i--) {
                // Wenn Attribute übereinstimmen, ist es vorhanden, also erlaubt 
                if (specs[lang].allowedAttributes[i] == attr)
                    return true;
            }
                        
            return false;
        }
        
        /// Gibt aus, ob KindNodes in der gewünschten Sprache erlaubt sind
        /// @param lang Sprachdefinition
        this.childnodesAllowed = function (lang) {
            if (lang == 'sgml') {
                return false;
            } else {
                return specs[lang].allowChildNodes;
            }
        }
        
        /// Gibt aus, ob das Element in dem gegebenen Parent Tag erlaubt ist
        /// @param parent Name des Elternelements
        /// @param lang Sprachdefinition
        this.parentAllowed = function (parent, lang) {
            // Wenn nicht definiert oder Array leer, ist Tag an gegebener Stelle erlaubt,
            // da leerer Array oder keine Definition keine Vorschriften über Position geben
            if (typeof specs[lang].allowedParentNodes === 'undefined' || specs[lang].allowedParentNodes.length == 0) {
                return true;
                
            // Wenn das nicht der fall ist...
            } else {
                // ... durchgehe die erlaubten Namen der Elternknoten ...
                for (var i = specs[lang].allowedParentNodes.length-1; i>=0; i--) {
                    // ... und überprüfe, ob aktueller Knotenname mit übergebenen Parent Namen übereinstimmt
                    if (specs[lang].allowedParentNodes[i] == parent)
                        return true;
                }
                // ansonsten ist Knoten an gegebener Stelle nicht erlaubt
                return false;
            }
        }
        
        this.getName = function () {
            return name;
        }
    }
    
    // Cloud
    htmlbCloud = function(lot, type, posY, speed) {
        
        var self = this;
        var assetDOM = $('<div class="htmlb asset cloud-'+type+'">');
        lot.getStage().append(assetDOM);
        
        assetDOM.css('top', posY);
        assetDOM.animate({left: lot.getStage().width()+assetDOM.width()},speed*1000, function(){
            lot.removeCloud(self);
        });
        
        this.getDOM = function() {
            return assetDOM;
        }
        
        return this;
    }

}( jQuery ));