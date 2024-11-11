Ext.define('Themer.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'Themer.view.main.MainController',
        'Themer.view.main.MainModel',
        'Ext.tree.Panel'
    ],

    controller: 'main',
    viewModel: 'main',
    
    height:'100%',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [{
        xtype: 'toolbar',
        height: 50,
        padding: '0 0 20 20',
        items: [
            {
                xtype: 'image',
                src: 'https://examples.sencha.com/img/logo.png',
                height: 30,
                alt: 'Company Logo',
                margin: '20 20 0 0'
            },
            {
                html: 'Sencha Themer Explorer',
                margin: '20 0 0 0'
            },
            '->',
            {
                xtype: 'button',
                text: 'Change Theme',
                iconCls: 'fas fa-exchange-alt',
                menu: {
                    listeners: {
                        click: 'onChangeTheme'
                    },
                    items: [
                        { text: 'Custom' },
                        { text: 'Basic Material' },
                        { text: 'Dark' },
                    ]
                }
            },
        ]
    },
     {
        xtype: 'container',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        flex: 1,
        items: [{
            xtype: 'treepanel',
            width: 200,
            title:'Sencha',
            cls:'Navigation-sidebar',
            rootVisible: false,
            collapsible: true,
            split: true,
            collapseDirection: 'left',
            store: {
                type: 'tree',
                root: {
                    children: [
                        { id: 'home', text: 'Home', leaf: true, iconCls: 'x-fa fa-home' },
                        { id: 'email', text: 'Email', leaf: true, iconCls: 'x-fa fa-users' },
                        { id: 'settings', text: 'FAQ', leaf: true, iconCls: 'x-fa fa-cog' },
                        { id: 'groups', text: 'Groups', leaf: true, iconCls: 'x-fa fa-users-cog' },
                        { id: 'notifications', text: 'Notifications', leaf: true, iconCls: 'x-fa fa-bell' },
                        { id: 'analytics', text: 'Analytics', leaf: true, iconCls: 'x-fa fa-chart-bar' },
                        { id: 'reports', text: 'Reports', leaf: true, iconCls: 'x-fa fa-file-alt' },
                        { id: 'calendar', text: 'Calendar', leaf: true, iconCls: 'x-fa fa-calendar-alt' },
                        { id: 'tasks', text: 'Tasks', leaf: true, iconCls: 'x-fa fa-tasks' },
                        { id: 'projects', text: 'Projects', leaf: true, iconCls: 'x-fa fa-folder-open' },
                        { id: 'contacts', text: 'Contacts', leaf: true, iconCls: 'x-fa fa-address-book' },
                        { id: 'support', text: 'Support', leaf: true, iconCls: 'x-fa fa-life-ring' },
                        { id: 'profile', text: 'Profile', leaf: true, iconCls: 'x-fa fa-user' },
                        { id: 'logout', text: 'Logout', leaf: true, iconCls: 'x-fa fa-sign-out-alt' }
                    ]
                }

            },
            listeners: {
                itemclick: 'menuItemClick'
            }
        }, {
            xtype: 'container',
            scrollable: 'y',
            flex: 1,
            margin:'0 0 0 6px',
            itemId: 'maincontent',
            listeners: {
                render: function (container) {
                    container.add({
                        xtype: 'dashboard'
                    });
                }
            }
        }]
    }
]
});
