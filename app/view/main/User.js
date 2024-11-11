Ext.define('Themer.view.main.User', {
    extend: 'Ext.panel.Panel',
    xtype: 'user',

    requires: [
        'Ext.view.View',
        'Ext.XTemplate',
        'Themer.store.UserStore'
    ],
    margin:'10 0 0 0',

    itemId: 'Profile',
    layout: 'fit',
    title: 'User details',
    scrollable: true,

    items: [{
        xtype: 'dataview',
        cls: 'profile-dataview',
        itemSelector: 'div',
        store: {
            type: 'userstore'
        },
        itemTpl: [
            '<span>',
            '<img class="profile-img" src="{profileImg}"/>',
            '<span style="margin-left: 10px; top: -20px; position: relative;">',
            '<strong>{username}</strong>',
            '<i class="x-fa fa-mobile icon"></i>',
            '</span>',
            '</span>',
            '<span class="active-time"><span><i class="x-fa fa-clock icon clock-icon"></i>{activeTime} ago</span></span><br>',
            '{description}',
            '<span class="activity-icons"><span><i class="x-fa fa-thumbs-up icon"></i><i class="x-fa fa-thumbs-down icon"></i><i class="x-fa fa-wechat icon"></i></span></span>'
        ],
        scrollable: 'y'
    }]
});
