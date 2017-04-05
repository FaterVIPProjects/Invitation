sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the formatted date from timestamp
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted 
			 */
			timestampToDate : function (expireString, date) {
				if (!date) {
					return "";
				}
				var sLocale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
				
				switch (sLocale){
					case "it":
						return expireString + " " + date.substr(8,2) + "/" + date.substr(5,2) + "/" + date.substr(2,2);
					
					case "en":
						return expireString + " " + date.substr(5,2) + "/" + date.substr(8,2) + "/" + date.substr(2,2);
				}
			},
			
			/**
			 * Convert date to js object
			 *
			 * @public
			 * @param {string} date 
			 * @returns {[object Date]} 
			 */			
			jsDate : function(date){
				return new Date(date);
			},
			
			/**
			 * Convert date to millisecond Date
			 *
			 * @public
			 * @param {string} date 
			 * @returns {string} "Date(date)"
			 */			
			jsDateMillisecond : function(date){
				var dateJS = new Date(date);
				return "Date(" + dateJS.getTime() + ")";
			},			
			
			/**
			 * Rounds the formatted date from timestamp
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * No prefix needed 
			 */
			timestampToDatev2 : function (date) {
				if (!date) {
					return "";
				}
				var sLocale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
				
				switch (sLocale){
					case "it":
						return date.substr(8,2) + "/" + date.substr(5,2) + "/" + date.substr(2,2);
					
					case "en":
						return date.substr(5,2) + "/" + date.substr(8,2) + "/" + date.substr(2,2);
				}
			},	
		
			/**
			 * Return average of scores 
			 *
			 * @public
			 * @param {string} valueX survey's scores
			 * @returns {int} average 
			 */
			average : function(value1, value2, value3, value4, value5, weight1, weight2, weight3, weight4, weight5) {
				var average = 0;
				for (var i = 0; i < arguments.length / 2; i++) {
					if (arguments[i] === null || arguments[i + 5] === null)
						return "";
			        arguments[i] = parseInt(arguments[i], 10);
			        arguments[i + 5] = parseInt(arguments[i + 5], 10);
			        average += arguments[i] * arguments[i + 5];
			    }
				return average / arguments.length * 2;
			},
			
			color : function(score, target, threshold){
				if (parseInt(score, 10) >= parseInt(target, 10)){
					return "#008000";
				}
				else if (parseInt(score, 10) < parseInt(threshold, 10)){
					return "#ff0000";
				} else {
					return "#ff8000";
				}
			},
			
			/**
			 * Return Purchase Organization based on Society 
			 *
			 * @public
			 * @param {int} societyValue Society Number
			 * @returns {int} Purchase Organization value  
			 */			
			purchasingOrganization : function(societyValue){
				switch(societyValue){
					case "20": 
						return "10";
					case "30": 
						return "30";
					case "40": 
						return "40";
					case "50": 
						return "50";
					default: 
						return "";
				}
			},
			
			supplierStatus : function(status) {
				if (!status){
					return "";
				}
				var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				return bundle.getText("SUPP_STATUS_"+status);
			}			
		};
	}
);