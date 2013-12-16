(function ( $ ) {
    
    // HTML Baustelle Main Object
    $.fn.HTMLLot = function(options) {

        var o = $.extend({
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
        
        var houseStruct = [
            {
                tag: 'testabvc',
                subElements: [
                    {
                        tag: 'a'
                    }
                ]
            },
            {
                tag: 'test',
                subElements: [
                    {
                        tag: 'b'
                    }
                ]
            },
            {
                tag: 'b'
            },
            {
                tag: 'blub',
                subElements: [
                    {
                        tag: 'blub',
                        subElements: [
                            {
                                tag: 'blub',
                                subElements: [
                                    {
                                        tag: 'blub',
                                        subElements: [
                                            {
                                                tag: 'b'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

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
            codeBox = $('<div class="htmlb code-box">');
            codeBox.append(codeBoxElements.headline, codeBoxElements.text, codeBoxElements.editor);
            contentBox.append(codeBox);
            
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
            
        }
        
        this.getStage = function () {
            return contentBox;
        }
        
        this.addUnit = function (name, title) {
            var unit = new htmlbUnit(self, name, title);
            units.push(unit);
            elementList.append(unit.getIcon());
        }
        
        this.initEditor = function () {
            var editor = codeBoxElements.editor;
            $.each(houseStruct, function(index, value) {
               addTag(value, 0);
            });
        }
        
        function addTag (tagObject, level) {
            // Add Tabs that are needed
            var tabs = '';
            for (var i = level; i > 0; i--) {
                tabs += '\t';
            }
            
            codeBoxElements.editor.val(codeBoxElements.editor.val()+tabs+'<'+tagObject.tag+'>');
            if (typeof tagObject.subElements !== 'undefined' && tagObject.subElements.length > 0) {
                codeBoxElements.editor.val(codeBoxElements.editor.val()+"\n");
                $.each(tagObject.subElements, function(index, value) {
                   addTag(value, level+1);
                });
                codeBoxElements.editor.val(codeBoxElements.editor.val()+tabs);
            }
            codeBoxElements.editor.val(codeBoxElements.editor.val()+"</"+tagObject.tag+">\n");
        } 
        
        this.updateEditor = function () {
            
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
    htmlbUnit = function (lot, name, title) {
        
        var self = this;
        
        var unitIcon = $('<li class="htmlb unit-icon unit-'+name+'" data-unit-name="'+name+'" draggable="true" >'+title+'</li>');
        
        this.getIcon = function () {
            return unitIcon;
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