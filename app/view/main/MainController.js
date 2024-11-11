/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 */
Ext.define('Themer.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onChangeTheme: function(menu, item){
        var themeName;
 
        if (item.text == 'Basic Material') {
            themeName = 'material'
        }
        else if (item.text == 'Custom') {
            themeName = 'custom'
        }
        else if (item.text == 'Dark') {
            themeName = 'darktheme'
        }

        localStorage.setItem('tag', themeName);
        window.location.reload();
    },

    menuItemClick: function (view, record) {
        const selectedId = record.get('id');
        const mainContentContainer = Ext.ComponentQuery.query('#maincontent')[0];

        if (!mainContentContainer) {
            console.error('Main content container not found');
            return;
        }

        mainContentContainer.removeAll();
        switch (selectedId) {
            case 'home':
                mainContentContainer.add({
                    xtype: 'dashboard',
                });
                break;
            case 'email':
                mainContentContainer.add({
                    xtype: 'email',
                });
                break;
            case 'groups':
                mainContentContainer.add({
                    xtype: 'groups',
                });
                break;
            case 'settings':
                mainContentContainer.add({
                    xtype: 'faq',
                });
                break;
            case 'notifications':
                mainContentContainer.add({
                    xtype: 'notifications',
                });
                break;
            case 'analytics':
                mainContentContainer.add({
                    xtype: 'groups',
                });
                break;
            case 'reports':
                mainContentContainer.add({
                    xtype: 'notifications',
                });
                break;
            case 'calendar':
                mainContentContainer.add({
                    xtype: 'groups',
                });
                break;
            case 'tasks':
                mainContentContainer.add({
                    xtype: 'notifications',
                });
                break;
            case 'projects':
                mainContentContainer.add({
                    xtype: 'groups',
                });
                break;
            case 'contacts':
                mainContentContainer.add({
                    xtype: 'notifications',
                });
                break;
            case 'support':
                mainContentContainer.add({
                    xtype: 'groups',
                });
                break;
            case 'profile':
                mainContentContainer.add({
                    xtype: 'notifications',
                });
                break;
            case 'logout':
                mainContentContainer.add({
                    xtype: 'groups',
                });
                break;
            default:
                break;
        }
    },
    onPreview: function() {
        var chart;

        if (Ext.isIE8) {
            Ext.Msg.alert('Unsupported Operation', 'This operation requires a newer version of Internet Explorer.');

            return;
        }

        chart = this.lookup('chart');

        chart.preview();
    },

    onRefresh: function() {
        var chart = this.lookup('chart');

        chart.getStore().refreshData();
    },

    onDataRender: function(v) {
        return v + '%';
    },

    onAxisLabelRender: function(axis, label, layoutContext) {
        // Custom renderer overrides the native axis label renderer.
        // Since we don't want to do anything fancy with the value
        // ourselves except appending a '%' sign, but at the same time
        // don't want to loose the formatting done by the native renderer,
        // we let the native renderer process the value first.
        return layoutContext.renderer(label) + '%';
    },

    onMultiAxisLabelRender: function(axis, label, layoutContext) {
        return label === 'Jan' ? '' : label;
    },

    onSeriesLabelRender: function(tooltip, record, item) {
        tooltip.setHtml(record.get('month') + ': ' + record.get(item.field) + '%');
    }
});
