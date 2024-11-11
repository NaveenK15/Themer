/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'Themer.Application',

    name: 'Themer',

    requires: [
        // This will automatically load all classes in the Themer namespace
        // so that application classes do not need to require each other.
        'Themer.*'
    ],

    // The name of the initial view to create.
    mainView: 'Themer.view.main.Main'
});
