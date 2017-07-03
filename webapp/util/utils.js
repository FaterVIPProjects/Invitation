// DB - Creazione del file di utility per FIX bug di controllo campi
sap.ui.define([

], function() {

	"use strict";

	return {

		// DB - FIX BUG #051  (PUNTO A e B) : Controllo obbligatorietà e forzata cancellazione campo Ragione Sociale
		checkBusinessName: function(oField1, oField2, isMandatory) {

			var message;
			var lengthBN = oField1.getValue().length;

			//Copia valore forzato
			oField2.setValue(oField1.getValue());
			
			if (isMandatory && lengthBN === 0) {
				message = this._getBundle().getText("valueStateTextBusinessName");
				oField1.setValueState(sap.ui.core.ValueState.Error);
				oField1.setValueStateText(message);
				oField2.setValueState(sap.ui.core.ValueState.Error);
				oField2.setValueStateText(message);
				oField2.setValue("");
				return false;

			} else {
				oField1.setValueState(sap.ui.core.ValueState.None);
				oField1.setValueStateText("");
				oField2.setValueState(sap.ui.core.ValueState.None);
				oField2.setValueStateText("");
				return true;
			}

		},

		// DB - FIX BUG #052 : Controllo lunghezza partita IVA
		checkLengthIVA: function(value, oField, isMandatory) {

			var _lengthIVA = 11;
			var message;
			var lengthIVA = value.length;

			//Copia valore forzato
			oField.setValue(value);

			if (isMandatory && lengthIVA === 0) {
				message = this._getBundle().getText("checkVat");
				oField.setValueState(sap.ui.core.ValueState.Error);
				oField.setValueStateText(message);
				return false;

			} else {

				if (lengthIVA !== _lengthIVA && lengthIVA > 0) {
					message = this._getBundle().getText("checkLengthVat", _lengthIVA );
					oField.setValueState(sap.ui.core.ValueState.Error);
					oField.setValueStateText(message);
					return false;
				} else {
					oField.setValueState(sap.ui.core.ValueState.None);
					oField.setValueStateText("");
					return true;
				}
			}

		},

		// DB - FIX BUG #057 : Controlli partita IVA CEE
		checkIVACEE: function(value, oField, isMandatory) {

			var message;
			var lengthIVACEE = value.length;
			var _minLengthIVACEE = 9;

			//Copia valore forzato
			oField.setValue(value);
			
			//Controllo obbligatorietà
			if (isMandatory && lengthIVACEE === 0) {
				message = this._getBundle().getText("checkVat");
				oField.setValueState(sap.ui.core.ValueState.Error);
				oField.setValueStateText(message);
				return false;

			} else {

				//Controllo solo caratteri alfanumerici
				var patt = /[^0-9a-zA-Z]/;
				if (value.match(patt)) {
					message = this._getBundle().getText("checkRegVatCEE");
					oField.setValueState(sap.ui.core.ValueState.Error);
					oField.setValueStateText(message);
					return false;
					
				} else {
					//Controllo numero minimo di caratteri
					if (lengthIVACEE < _minLengthIVACEE && lengthIVACEE > 0) {
						message = this._getBundle().getText("checkLengthVatCEE", _minLengthIVACEE);
						oField.setValueState(sap.ui.core.ValueState.Error);
						oField.setValueStateText(message);
						return false;
					} else {
						oField.setValueState(sap.ui.core.ValueState.None);
						oField.setValueStateText("");
						return true;
					}
				}
			}

		},

		_getBundle: function() {

			var bundle;
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			var sRootPath = jQuery.sap.getModulePath("org.fater.invitation");
			bundle = jQuery.sap.resources({
				url: sRootPath + "/i18n/i18n.properties",
				locale: sLanguage
			});

			return bundle;

		}

	};

});