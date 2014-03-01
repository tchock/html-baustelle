///////////////////////////////////////////////
// UNIT LISTE
//////////////////////////////////////////////

var units = {
    
    // Stockwerk
    level: new htmlbUnit(
        'level', 'Stockwerk',
        // SGML Spec
        /*{
            type: 'tag',
            tag: 'level',
            allowedAttributes: ['windowtype', 'windowcount'],
            defaultAttributes: {
                windowtype: 'simple'
            }
        },*/
        // XML Spec
        {
            tag: 'level',
            allowedAttributes: [],
            allowChildNodes: true,
            allowedParentNodes: ['root']
        },
        // HTML Spec
        {
            tag: 'element',
            allowedAttributes: ['class','name','id'],
            defaultAttributes: {
              class: 'level'
            },
            allowChildNodes: true,
            allowedParentNodes: ['root']
        }
    ),
    
    
    
    // Erdgeschoss
    ground: new htmlbUnit(
        'ground', 'Erdgeschoss',
        // SGML Spec
        /*{
            type: 'tag',
            tag: 'ground',
            allowedAttributes: ['windowtype', 'windowcount', 'door'],
            defaultAttributes: {
                windowtype: 'simple',
                door: 'false'
            }
        },*/
        // XML Spec
        {
            tag: 'ground',
            allowedAttributes: [],
            allowChildNodes: true,
            allowedParentNodes: ['root']
        },
        // HTML Spec
        {
            tag: 'ground',
            allowedAttributes: ['class','name','id'],
            allowChildNodes: true,
            allowedParentNodes: ['root']
        }
    ),
    
    
    
    
    // Dach
    roof: new htmlbUnit(
        'roof', 'Dach',
        // SGML Spec
        /*{
            type: 'tag',
            tag: 'roof',
            allowedAttributes: ['chimney']
        },*/
        // XML Spec
        {
            tag: 'roof',
            allowedAttributes: [],
            allowChildNodes: true,
            allowedParentNodes: ['root']
        },
        // HTML Spec
        {
            tag: 'roof',
            allowedAttributes: ['class','name','id'],
            allowChildNodes: true,
            allowedParentNodes: ['root']
        }
    ),
    
    
    
    
    // Fenster
    window: new htmlbUnit(
        'window', 'Fenster',
        // SGML Spec
        /*{
            type: 'attribute',
            allowedTags: ['level'],
            behaveiour: {
                windowCount: 'defineInt'
            }
        },*/
        // XML Spec
        {
            tag: 'window',
            allowedAttributes: ['type'],
            allowChildNodes: false,
            allowedParentNodes: ['level', 'ground']
        },
        // HTML Spec
        {
            tag: 'window',
            allowedAttributes: ['class','name','id'],
            defaultAttributes: {
                class: 'simple'
            },
            allowChildNodes: false,
            allowedParentNodes: ['element', 'ground']
        }
    ),
    
    
    
    
    // Tür
    door: new htmlbUnit(
        'door', 'Tür',
        // SGML Spec
        /*{
            type: 'attribute',
            allowedTags: ['ground'],
            behaveiour: {
                door: 'defineBool'
            }
        },*/
        // XML Spec
        {
            tag: 'door',
            allowedAttributes: [],
            allowChildNodes: false,
            allowedParentNodes: ['ground']
        },
        // HTML Spec
        {
            tag: 'door',
            allowedAttributes: ['class','name','id'],
            defaultAttributes: {
                class: 'simple'
            },
            allowChildNodes: false,
            allowedParentNodes: ['ground']
        }
    ),
    
    // Schornstein
    chimney: new htmlbUnit(
        'chimney', 'Schornstein',
        // SGML Spec
        /*{
            type: 'attribute',
            allowedTags: ['roof'],
            behaveiour: {
                door: 'defineBool'
            }
        },*/
        // XML Spec
        {
            tag: 'chimney',
            allowedAttributes: [],
            allowChildNodes: false,
            allowedParentNodes: ['roof']
        },
        // HTML Spec
        {
            tag: 'chimney',
            allowedAttributes: ['class','name','id'],
            defaultAttributes: {
                class: 'simple'
            },
            allowChildNodes: false,
            allowedParentNodes: ['roof']
        }
    )
    
    
}