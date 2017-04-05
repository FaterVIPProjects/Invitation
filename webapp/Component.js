sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"org/fater/app/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("org.fater.app.Component", {

		manifestFirst: false,

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			
			this.getModel("ControlValues").setSizeLimit(1000);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		
			this.parseUserInfo();
			
			this.getModel("oDataModel").setSizeLimit(1000);
		},
		
		parseUserInfo: function() {
			var id = null;
			
			try {
				var userShell = sap.ushell.Container.getService("UserInfo").getUser();
				id = userShell.getId().toUpperCase();
			} catch ( err ) {}
			
			if( id === null || id === undefined ) {
				try {
					id = "RIF_COMM_01";
				} catch ( err ) {}
			}
			
			var oUtilsModel = this.getModel("utils");
			if( oUtilsModel ) {
				this.getModel("oUserModel").read("/UserSet('" + id +"')", {
					async: false,
					success: function(oUserOData) {
						oUtilsModel.setProperty("/User",oUserOData);
					},
					error: function(error) {
						
					}
				});
			}
		}
	});

});