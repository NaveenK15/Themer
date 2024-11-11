Ext.define('Themer.store.UserStore', {
    extend: 'Ext.data.Store',
    alias: 'store.userstore',

    fields: ['username', 'profileImg', 'activeTime', 'description'], 

    proxy: {
        type: 'ajax',
        url: 'resources/data/User.json', 
        reader: {
            type: 'json',
            rootProperty: 'users' 
        }
    },
    autoLoad: true 
});
