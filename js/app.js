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


// Request Animation Frame. Vielen Dank an Paul Irish (www.paulirish.com)
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


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
        var landside;
    
        var elementList;
        var units = [];
        
        // Gesetzte Assets
        clouds = [];
        var lastCloudAdded = 0;
        // Haus Datenstruktut
        houseStruct = [];
        // Codezeilen, die gehighlightet werden sollen
        var updatedLines = [];
        // Anzahl der Stockwerke, die von der Kamera aufgefasst werden sollen
        var maxLevels = 4;
        
        // Baueinheit, die grade gedragged wird
        var dragUnit = null;
        // bisheriges Stockwerk, das per dragover angewählt wurde
        var oldMouseLevel = 0;
        
        // Aufgabe um Level zu bestehen
        var challenges = [];
        
        // Aufgaben alle bestanden gewonnen?
        var challengesCompleted = false;
        
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
            landside = $('<div class="htmlb landside">');
            contentBox.append(landside);
            
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
            
            house[0].addEventListener('dragover', function(e){
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }, false);
                        
            house[0].addEventListener('drop', function(e){
            }, false);
            
            houseBox[0].addEventListener('dragenter', function(e){
                
            },false);
                        
            houseBox[0].addEventListener('dragover', function(e){
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // berechne die Mausposition relativ zur Position des Hauses
                var houseOffset = house.offset();
                var relX = e.pageX - houseOffset.left;
                var relY = e.pageY - houseOffset.top;
                
                // berechne, in welchem Stockwerk der Mauscursor sich grade befindet
                var levelHeight = house.height()/maxLevels; // Höhe eines Stockwerks
                var currentMouseLevel = Math.round((house.height()-relY) / (levelHeight-1));
                console.log(currentMouseLevel);
                
                // Anzeigen einer Vorschau des einzufügenden Stockwerks + Animation der restlichen Stockwerke
                // Wenn Maus innerhalb des Hauses und (zur Performanceverbesserung) Veränderung zwischen des ausgewählten Stockwerks stattgefunden hat
                if (relY >= 0 && relY <= house.height() && oldMouseLevel != currentMouseLevel && dragUnit.parentAllowed('root',o.lang)) {
                    house.find('.preview').remove(); // lösche alle allten Vorschau Objekte (max 1)
                    // Füge neues Vorschauelement an der gewünschten Stelle ein
                    house.append($('<div class="htmlb asset '+ dragUnit.getName() +' preview" style="bottom: '+(100/maxLevels*currentMouseLevel+3)+'%; height: '+(100/Math.max(maxLevels,4))+'%">'));
                    
                    // Durch gehe alle Stockwerke
                    self.changeLevelPos(currentMouseLevel);
                }
                oldMouseLevel = currentMouseLevel; 
              
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
                var currentMouseLevel = Math.round((house.height()-relY) / (levelHeight-1));
                self.addUnitToStruct('root', dragUnit, -currentMouseLevel);
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
            
            // Cloud add Loop mit request AnimFrame
            function cloudLoop(){
                requestAnimFrame(cloudLoop);
                var date = new Date;
                var currentTime = date.getTime();
                // Wenn weniger als 3 Wolken vorhanden sind und seit hinzufügen der letzter Wolke mindestens 3 Sekunden vergangen sind ...
                if (currentTime - lastCloudAdded > 12000 && clouds.length < 4) {
                    var scale = 0.3+0.7*Math.random();
                    var pos = 5+40*Math.random();
                    var speed = 60+20*(1-scale);
                    self.addCloud(1, pos+'%', scale, speed);
                    lastCloudAdded = currentTime;
                }
            }
            cloudLoop();
            
        }
        
        this.changeLevelPos = function (currentMouseLevel) {
            var houseLevels = house.children().not('.preview'); // erhalte die Stockwerke, die keine Vorschau sind
            for (var i = houseLevels.length-1; i >= 0; i--) {
                // Berechne die neue Position: Wenn Stockwerk über dem aktuellen Cursor liegt, schiebe ihn um eine Stockwerkhöhe hoch, ansonsten schiebe ihn runter oder lasse ihn bei dem alten Wert
                var bottom = (i >= currentMouseLevel && currentMouseLevel >= 0) ? ((100/maxLevels)*(i))+(100/maxLevels)+6 : (100/Math.max(maxLevels,4))*i;
                bottom = house.height()/100*bottom; // berechne Prozent in Pixel
                
                // Animiere das Stockwerk auf die neue Bottom Position und die richtige Höhe
                $(houseLevels[i]).css({
                    height: house.height()/100*(100/maxLevels)+'px',
                    bottom: bottom
                });
            }
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
                if (unit.parentAllowed('root', o.lang)) {
                    self.updateZoomLevel(2);
                }
            }, false);
            elementList[0].addEventListener('dragend', function(e){
                house.find('.preview').remove();
                self.updateZoomLevel(0);
                self.changeLevelPos(-1);
            },false);
        }
        
        this.addUnitList = function (unitList) {
            for (unitObj in unitList){
                self.addUnit(unitList[unitObj]);
            };
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
            pos = (pos == 0) ? houseStruct.length : pos;
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
        
        // Fügt eine Aufgabe hinzu
        // @param challenge Aufgabe, die hinzugefügt werden soll
        this.addChallenge = function (challenge) {
            challenges.push(challenge);
        }
        
        // Fügt eine Liste von Aufgaben hinzu
        // @param callengeList Aufgabenliste, die hinzugefügt werden soll
        this.addChallengeList = function (challengeList) {
            for (challenge in challengeList) {
                self.addChallenge(challengeList[challenge]);
            }
        }
        
        /// Aktualisiert das Rendering des Hauses
        this.updateRendering = function () {
            house.empty();
            removeDiffNotes(houseStruct);
            for (var i = houseStruct.length-1; i>=0; i--) {
                house.append($('<div class="htmlb asset '+houseStruct[i].unit.getName()+'" style="bottom: '+(house.height()/100*((100/Math.max(houseStruct.length,4))*(houseStruct.length-1-i)))+'px; height: '+(house.height()/100*(100/Math.max(houseStruct.length,4)))+'px">'));
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
        
        /// Entfernt gehighlightete Zeile in bestimmter Zeile (und entfernt die Zeile in updatedLines)
        /// @param line Zeilennummer
        function removeEditorHighlight (line) {
            codeBoxElements.editor.removeLineClass(line-1, 'background', 'line-highlight');
            for (var i = updatedLines.length-1; i >= 0; i--) {
                if (updatedLines[i] == line) {
                    updatedLines.splice(i,1);
                    break;
                }
            }   
        }
        
        /// Hebt neue Zeilen hervor und entfernt sie nach 3 Sekunden wieder
        this.highlightChangedLines = function () {
            for (var i = updatedLines.length-1; i>=0; i--) {
                codeBoxElements.editor.addLineClass(updatedLines[i]-1, 'background', 'line-highlight');
                var currentLinePos = i;
                window.setTimeout(function () {removeEditorHighlight(updatedLines[currentLinePos]) }, 3000);
            }
        }
        
        /// Löscht die diffState Einträge in der Datenstruktur
        function removeDiffNotes (struct) {
            for (var i = struct.length-1; i>=0; i--) {
                if (typeof struct[i].diffState !== 'undefined') {
                    // Wenn Diff State "deleted" ist, dann lösche den kompletten Node
                    if (struct[i]['diffState'] == 'deleted') {
                        struct.splice(i, 1);
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
                self.checkIfWon();
                self.updateRendering();
                
                
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
        
        // Prüft, ob Spiel gewonnen
        this.checkIfWon = function () {
            var challengesCompleted = 0;
            for ( c in challenges ) {
                var currentUnitCount = 0;
                
                // wenn Root Level Objekt ...
                if (challenges[c].getUnit().parentAllowed('root', o.lang)) {
                    for (u in houseStruct) {
                        // wenn Unit übereinstimmt ...
                        if (houseStruct[u].unit == challenges[c].getUnit()) {
                            currentUnitCount++; // ... erhöhe Anzahl
                        }
                    }
                // wenn Stockwerk egal ...
                } else if (challenges[c].getLevel() == 'all') {
                    // durchgehe alle Stockwerke
                    for (var i = houseStruct.length-1; i>= 0; i--) {
                        // durchgehe alle Baueinheiten innerhalb dieses Stockwerks
                        for (u in houseStruct[i].childNodes) {
                            // wenn diese Einheit übereinstimmt ...
                            if (houseStruct[i].childNodes[u].unit == challenges[c].getUnit()) {
                                currentUnitCount++; // ... erhöhe Anzahl
                            }
                        }
                    }
                // wenn Stockwerk vorhanden ist, also es mehr Stockwerke als das angegebene gibt
                } else if (houseStruct.length >= challenges[c].getLevel() && typeof houseStruct[challenges[c].getLevel()-1].childNodes !== 'undefined') {
                    
                    // durchgehe alle Baueinheiten innerhalb dieses Stockwerks
                    for (u in houseStruct[houseStruct.length-challenges[c].getLevel()].childNodes) {
                        // wenn diese Einheit übereinstimmt ...
                        if (houseStruct[houseStruct.length-challenges[c].getLevel()].childNodes[u].unit == challenges[c].getUnit()) {
                            currentUnitCount++; // ... erhöhe Anzahl
                        }
                    }
                    console.log('anzahl Elemente:' + currentUnitCount);
                }
                
        
                
                // Wenn Anzahl übereinstimmt ...
                if (( challenges[c].getType() == 'exact' && challenges[c].getCount() == currentUnitCount )        // Wenn genau so viele Elemente gebaut wurden
                    || ( challenges[c].getType() == 'minimum' && challenges[c].getCount() <= currentUnitCount )   // Wenn wenigstens so viele Elemente gebaut wurden
                    || ( challenges[c].getType() == 'maximum' && challenges[c].getCount() >= currentUnitCount )   // Wenn maximal so viele Elemente gebaut wurden
                ) {
                    challengesCompleted++; // erhöhe geschaffte Aufgaben
                }
                
            }
            
            // Wenn Anzahl komplettierter Aufgaben mit Anzahl Aufgaben übereinstimmt ...
            if (challengesCompleted == challenges.length) {
                challengesCompleted = true; // ... hat der Spieler gewonnen
                houseBox.append('<a href="#" class="htmlb complete-button">Spiel abschließen</a>');
            } else {
                challengesCompleted = false;
                houseBox.find('.complete-button').remove();
            }
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
                house.stop().find('.level, .ground, .roof').not('.preview').each(function () {
                    
                    var bottom = (100/maxLevels)*(i++);
                    bottom = house.height()/100*bottom; // berechne Prozent in Pixel
                    
                    $(this).css({
                        bottom: bottom+'px',
                        height: house.height/100*(100/maxLevels)+'px'
                    });
                });
            }
            landside.css({
                backgroundSize: (100+10*Math.max(0, 14-maxLevels))+'%'
            });
            house.css({
                width: newWidth,
                marginLeft: -newWidth*0.5
            });
        }
        
        this.addCloud = function (type, posY, scale, speed) {
            clouds.push(new htmlbCloud(self, type, posY, scale, speed));   
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
    
    // Aufgabe
    // @param interner Name Name der Aufgabe
    // @param unit Einheit, die in der Aufgabe gebaut werden soll
    // @param level Stockwerk, in das gebaut werden soll. 'all', wenn Stockwerk egal
    // @param count Anzahl der Elemente, die gebaut werden sollen
    // @param type Typ der Aufgabe: 'minimum', 'exact', 'maximum'
    htmlbChallenge = function( name, unit, level, count , type) {
        
        if (typeof type === 'undefined') {
            var type = 'minimum';
        }
        
        // Erhalte den Namen
        this.getName = function () {
            return name;
        }
        
        // Erhalte die Einheit
        this.getUnit = function () {
            return unit;
        }
        
        // Erhalte das Stockwerk, in dem das Objekt gebaut werden soll
        this.getLevel = function () {
            return level;
        }
        
        // Erhalte die Anzahl der zu bauenden Einheiten
        this.getCount = function () {
            return count;
        }
        
        // Erhalte dem Typ der Aufgabe
        this.getType = function () {
            return type;
        }
        
    }
    
    // Cloud
    htmlbCloud = function( lot, type, posY, scale, speed ) {
        
        var self = this;
        var assetDOM = $('<div class="htmlb asset cloud-'+type+'">');
        lot.getStage().append(assetDOM);
        
        assetDOM.css('top', posY);
        assetDOM.css('scale', scale)
        assetDOM.transition({x: lot.getStage().width()},speed*1000, "linear", function(){
            lot.removeCloud(self);
        });
        
        this.getDOM = function() {
            return assetDOM;
        }
        
        return this;
    }

}( jQuery ));