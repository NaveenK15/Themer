Ext.define('Themer.view.main.Dashboard', {
    extend: 'Ext.container.Container',
    xtype: 'dashboard',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    width: '100%',
    height:630,
    scrollable: 'y',

    defaults: {
        xtype: 'container',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        flex: 1,
        height: 325,
    },

    items: [
        {
            items: [
                {
                    xtype: 'mainlist',
                    cls: 'panelStyle',
                    flex: 2,
                    margin: 5
                },
                {
                    xtype: 'chartItem',
                    cls: 'panelStyle',
                    flex: 1,
                    margin: 5
                }
            ]
        },
        {
            items: [
                {
                    xtype: 'user',
                    cls: 'panelStyle',
                    flex: 1,
                    margin: 5
                },
            ]
        }
    ]
});
