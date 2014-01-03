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
        
        var houseStruct = [];
        
        var updatedLines = [1,3];

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
              theme: "lesser-dark"
            });
                        
            codeBoxElements.headline.html(o.codeBoxHeadline);
            codeBoxElements.text.html(o.codeBoxText);
        
            // Haus
            houseBox = $('<div class="htmlb house-box">');
            contentBox.append(houseBox);
            
            house = $('<div class="htmlb house">');
            houseBox.append(house);
            house.append($('<div class="htmlb asset level">'));
            house.append($('<div class="htmlb asset level" style="bottom: 25%">'));
            house.append($('<div class="htmlb asset level" style="bottom: 50%">'));
            house.append($('<div class="htmlb asset roof" style="bottom: 75%">'));
            
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
                elementList.append(unit.getIcon());
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
        
        this.updateEditor = function () {
            var editor = codeBoxElements.editor;
            var editorText = "";
            $.each(houseStruct, function(index, value) {
               var textToAdd = addTagToEditor(value, 0);
               editorText += textToAdd;
               
            });
            editorText = editorText.substr(0, editorText.length-1);
            editor.setValue(editorText);
        }
        
        function addTagToEditor (tagObject, level) {
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
            // Definiert selbstschließenden Tag, wenn XML Mode und Element keine Kindelemente haben kann
            var selfclose = (o.lang == 'xml' && !canHaveChildNodes) ? '/' : '';
            
            // Fügt Code hinzu
            editorText += tabs+'<'+tag+attributes+selfclose+'>'; // start Tag
            if (typeof tagObject.childNodes !== 'undefined' && tagObject.childNodes.length > 0) {
                editorText += "\n"; // neue Zeile
                // Durchgeht alle Kind Nodes
                $.each(tagObject.childNodes, function(index, value) {
                   var textToAdd = addTagToEditor(value, level+1); // Rekursiv neuen Code hinzufügen, level+1 für nächste Tab Reihe
                   editorText += textToAdd;
                });
                editorText += tabs; // Tab für schließenden Tag oder nachfolgenden Code
            }
            
            // Schließender Tag, wenn Element Kindelemente haben kann und wenn kein SGML Mode
            if (o.lang != 'sgml' && canHaveChildNodes) {
                editorText += "</"+tag+">\n"; // End Tag
            } else {
                editorText += "\n";
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
    
        /// Funktion, die aufgerufen wird, wenn neuer Inhalt in Code Editor eingegeben wird
        this.checkEditor = function () {
            // Exception Handling, damit Browser nicht abstürzen, wenn Tags nicht erkann werden
            try {
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
                houseStruct = convertDomToStruct(editorDOM, 'root');
                
            } catch (e) {
                console.log(e.name +"==> "+ e.message);
            }
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
    
        /// Gibt Icon für die Bauteil Auswahl zurück
        this.getIcon = function () {
            return $('<li class="htmlb unit-icon unit-'+name+'" data-unit-name="'+name+'" draggable="true" >'+title+'</li>');
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