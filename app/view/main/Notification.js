Ext.define('Themer.view.main.Notification', {
    extend: 'Ext.panel.Panel',
    xtype: 'notifications',

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
            html: '<span style="font-size: 150px; line-height: 150px; color: #919191ad;">404</span>'
        },
        {
            xtype: 'component',
            html: '<h1 style="font-size: 36px; color: #919191ad;">Page Not Found!!</h1>',
            cls: 'coming-soon-title'
        },
    ]
});
