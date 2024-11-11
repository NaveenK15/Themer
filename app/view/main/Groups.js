Ext.define('Themer.view.main.Groups', {
    extend: 'Ext.panel.Panel',
    xtype: 'groups',

    width: '100%',
    height: 630,

    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },

    items: [
        {
            xtype: 'component',
            cls: 'fa-outer-class',
            html: '<span class="x-fa fa-clock" style="font-size: 100px; color: #919191ad;"></span>'
        },
        {
            xtype: 'component',
            html: '<h1 style="font-size: 36px; color: #919191ad;">Coming Soon!</h1>',
            cls: 'coming-soon-title'
        },
        {
            xtype: 'component',
            html: '<span class="blank-page-text" style="font-size: 18px; color: #919191ad;">Stay tuned for updates</span>',
            cls: 'coming-soon-text'
        }
    ]
});
