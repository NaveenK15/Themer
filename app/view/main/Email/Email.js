Ext.define('Themer.view.main.Email.Email', {
    extend: 'Ext.container.Container',
    xtype: 'email',

    height:620,

    requires: [
        'Ext.menu.Menu',
        'Ext.menu.Item',
        'Ext.grid.Panel',
        'Ext.grid.column.Check',
        'Ext.grid.column.Widget',
        'Ext.slider.Widget',
        'Ext.grid.column.Number',
        'Ext.grid.column.Date',
        'Ext.grid.column.Boolean',
        'Ext.Progress',
        'Ext.view.Table',
        'Ext.grid.plugin.RowWidget',
        'Ext.XTemplate'
    ],

    itemId: 'emailMainContainer',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    itemId: 'navigationPanel',
                    minWidth: 180,
                    items: [
                        {
                            xtype: 'menu',
                            border: false,
                            cls: 'navigation-email',
                            floating: false,
                            width: 175,
                            iconCls: 'fas fa-envelope',
                            manageHeight: false,
                            title: 'Email',
                            items: [
                                {
                                    xtype: 'menuitem',
                                    iconCls: 'x-fa fa-edit',
                                    text: 'Compose',
                                },
                                {
                                    xtype: 'menuitem',
                                    iconCls: 'x-fa fa-inbox',
                                    text: 'Inbox'
                                },
                                {
                                    xtype: 'menuitem',
                                    iconCls: 'x-fa fa-check-circle',
                                    text: 'Sent Mail'
                                },
                                {
                                    xtype: 'menuitem',
                                    iconCls: 'x-fa fa-exclamation-circle',
                                    text: 'Spam'
                                },
                                {
                                    xtype: 'menuitem',
                                    iconCls: 'x-fa fa-trash-alt',
                                    text: 'Trash'
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'container',
                    flex: 1,
                    cls: 'navigation-friends-container',
                    items: [
                        {
                            xtype: 'menu',
                            border: false,
                            cls: 'navigation-Friends',
                            floating: false,
                            width: 175,
                            iconCls: 'fas fa-users',
                            manageHeight: false,
                            title: 'Friends',
                            items: [
                                {
                                    xtype: 'menuitem',
                                    text: 'Torres Tras'
                                },
                                {
                                    xtype: 'menuitem',
                                    text: 'John Dea'
                                },
                                {
                                    xtype: 'menuitem',
                                    text: 'Hines Moon'
                                },
                                {
                                    xtype: 'menuitem',
                                    text: 'mike mak'
                                },
                                {
                                    xtype: 'menuitem',
                                    text: 'Molina  Wilkroson'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'container',
            cls: 'grid-container',
            height: 800
        },
        {
            xtype: 'gridpanel',
            flex: 1,
            height: 600,
            width: '100%',
            store: {
                type: 'bufferforum'
            },
            columns: [
                {
                    xtype: 'checkcolumn',
                    text: 'MyCheck'
                },
                {
                    text: 'Id',
                    width: 50,
                    dataIndex: 'id',
                    filter: {
                        type: 'number'
                    }
                },
                {
                    xtype: 'widgetcolumn',
                    text: 'MyWidget',
                    widget: {
                        xtype: 'sliderwidget'
                    }
                },
                {
                    text: 'First Name',
                    width: 150,
                    dataIndex: 'firstName'
                },
                {
                    text: 'Last Name',
                    width: 150,
                    dataIndex: 'lastName'
                },
                
                {
                    text: 'Title',
                    flex: 1,
                    dataIndex: 'title'
                },
                {
                    xtype: 'widgetcolumn',
                    text: 'MyWidget1',
                    widget: {
                        xtype: 'progress'
                    }
                },
                {
                    text: 'Company',
                    flex: 1,
                    dataIndex: 'company'
                },
                {
                    text: 'Address',
                    flex: 1,
                    dataIndex: 'address'
                }, 
            ],
            plugins: [
                {
                    ptype: 'rowwidget',
                    rowBodyTpl: [
                        'rowBodyTpl'
                    ],
                    widget: {
                        xtype: 'component'
                    }
                }
            ]
        }
    ]
 
});
