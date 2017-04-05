/*eslint no-undef: "error"*/
/*eslint-env node*/

/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/**
 * Initialization Code and shared classes of library sap.ui.suite.
 */
sap.ui.define(['jquery.sap.global', 
    'sap/ui/core/library',
    'sap/m/library'], // library dependency
    function(jQuery) {

    "use strict";

    /**
     * BeSolution core library
     *
     * @namespace
     * @name besolution.core
     * @author Emanuele Ricci (Be Solution)
     * @version 1.0.0
     * @public
     */

    // delegate further initialization of this library to the Core
    sap.ui.getCore().initLibrary({
        name : "besolution.core",
        version: "1.0.0",
        dependencies : ["sap.ui.core", "sap.m"],
        types: [],
        interfaces: [],
        controls: [
            "besolution.core.framework.BaseController",
            "besolution.core.framework.Router",
            "besolution.core.framework.Component",
        ],
        elements: []
    });

    return besolution.core;

}, /* bExport= */ false);