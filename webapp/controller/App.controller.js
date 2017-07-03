sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"org/fater/invitation/util/formatter",
	"org/fater/invitation/util/utils",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	'sap/ui/model/SimpleType',
	'sap/ui/model/ValidateException',
	"sap/ui/model/json/JSONModel"
], function(Controller, formatter, utils, Filter, MessageToast, SimpleType, ValidateException, JSONModel) {
	"use strict";

	return Controller.extend("org.fater.invitation.controller.App", {

		formatter: formatter,

		onInit: function() {
			this._wizard = this.getView().byId("invitationWizard");

			this._firstStepValidationFlag = false;
			this._secondStepValidationFlag = true;
			this._thirdStepValidationFlag = true;
			this._lastStepValidationFlag = true;

			//_lastStepActivated is used to activate the right step on checking previous step
			this._lastStepActivated = "FirstStep";

			// Add a case-insensitive 'string contains' style filter to title input
			this.getView().byId("businessNameInput").setFilterFunction(function(sTerm, oItem) {
				if (sTerm.length >= 3) {
					return oItem.getText().match(new RegExp(sTerm, "i"));
				} else {
					return null;
				}
			});

			this.getView().byId("vatCeeInput").setFilterFunction(function(sTerm, oItem) {
				if (sTerm.length >= 3) {
					return oItem.getText().match(new RegExp(sTerm, "i"));
				} else {
					return null;
				}
			});

			this.getView().byId("vatItInput").setFilterFunction(function(sTerm, oItem) {
				if (sTerm.length >= 3) {
					return oItem.getText().match(new RegExp(sTerm, "i"));
				} else {
					return null;
				}
			});

			this.getView().byId("supplierIdInput").setFilterFunction(function(sTerm, oItem) {
				if (sTerm.length >= 3) {
					return oItem.getText().match(new RegExp(sTerm, "i"));
				} else {
					return null;
				}
			});

			jQuery.sap.delayedCall(500, this, function() {
				this.getView().byId("businessNameInput").focus();
			});

			this.getView().bindElement("participation>/Supplier/");

		},

		//Open dialog to choose a different cluster or add one (if noone is selected)
		changeCluster: function() {
			// instantiate dialog
			if (!this._clusterDialog) {
				this._clusterDialog = sap.ui.xmlfragment("org.fater.invitation.view.fragment.ClusterDialog", this);
				this.getView().addDependent(this._clusterDialog);
			}
			this._clusterDialog.open();
		},

		onSelectCluster: function(oEvent) {

			//BEGIN FIX DB - 03.07.2017
			var sPath = "";
			var typeEvent = typeof oEvent;
			if (typeEvent === "object") {
				//END   FIX DB - 03.07.2017	
				sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
			} //BEGIN FIX DB - 03.07.2017	
			else {
				sPath = "/ClusterSet('" + oEvent + "')";
			}
			//  END   FIX DB - 03.07.2017	

			var index = sPath.substr(sPath.lastIndexOf("/") + 1);
			var sPathODataModel = "oDataModel>/" + index;
			/*			var selectedCluster = [];
						selectedCluster.push(this.getView().getModel("oDataModel").getProperty(sPath));*/
			this.getView().getModel("participation").setProperty("/ClusterId", this.getView().getModel("oDataModel").getProperty(sPath +
				"/ClusterId"));

			this.getView().byId("selectedClusterItem").setTitle(this.getView().getModel("oDataModel").getProperty(sPath + "/Name"));
			this.getView().byId("companySelect").bindElement({
				path: sPathODataModel,
				parameters: {
					expand: "ClusterCom"
				}
			});
			this.getView().byId("purchaseOrgSelect").bindElement({
				path: sPathODataModel,
				parameters: {
					expand: "ClusterCom"
				}
			});

			//  FIX DB - 03.07.2017
			//#TODO

			this.checkClusterSelected();
			this.checkValidationCompleteStep();
		},

		cancelClusterSelection: function() {
			this._dialog.close();
		},

		handleBusinessNameHelp: function(oEvent) {
			var businessNameValue = this.getView().byId("businessNameInput").getValue();

			// create value help dialog
			/*	if (!this._dialog) {
					this._dialog = sap.ui.xmlfragment("org.fater.invitation.view.fragment.BusinessNameDialog", this);
					this.getView().addDependent(this._dialog);
				}*/

			//	if (!this._dialog) {
			this._dialog = sap.ui.xmlfragment("org.fater.invitation.view.fragment.BusinessNameDialog", this);
			this.getView().addDependent(this._dialog);

			//FIX DB - 03.07.2017 - ObjectListItem a runtime
			var objListItem = new sap.m.ObjectListItem({
				title: "{oDataModel>Name1}",
				attributes: [
					new sap.m.ObjectAttribute({
						text: "{i18n>supplierCode}: {oDataModel>SupplierId}}",
						visible: "{= ${oDataModel>SupplierId} !== '' && ${oDataModel>Lifnr} === ''}"
					}),
					new sap.m.ObjectAttribute({
						text: "{i18n>supplierCode}: {oDataModel>Lifnr}",
						visible: "{= ${oDataModel>Lifnr} !== ''}"
					}),
					new sap.m.ObjectAttribute({
						text: "{i18n>vat}: {oDataModel>VatIt}",
						visible: "{= ${oDataModel>VatIt} !== ''}"
					}),
					new sap.m.ObjectAttribute({
						text: "{i18n>vatCEE}: {oDataModel>VatCee}",
						visible: "{= ${oDataModel>VatCee} !== ''}"
					}),
					new sap.m.ObjectAttribute({
						text: "{i18n>taxCode}: {oDataModel>TaxCode}",
						visible: "{= ${oDataModel>TaxCode} !== ''}"
					}),
					new sap.m.ObjectAttribute({
						text: "{oDataModel>City} ({oDataModel>Country})",
						visible: "{= ${oDataModel>City} !== ''}"
					})
				]
			});

			this._dialog.bindAggregation(
				"items",
				"oDataModel>/SupplierSet",
				objListItem
			);

			//}
			////////////////////////////////////////////////////////////////////////////////

			this._dialog.open(businessNameValue);

			//FIX DB - Elimino items proposti (perchè provenienti da SRM e non da ECC)
			//	if (businessNameValue.length !== 0) {

			/*			this._dialog._searchField._inputElement.defaultValue = businessNameValue;
						this._dialog._searchField._inputElement.value = businessNameValue;*/

			/*			this._dialog.fireSearch({
							"value": businessNameValue
						});*/

			if (!businessNameValue) {

				// Cancellazione ragione sociale prima e seconda schermata
				this.getView().byId("businessNameInput").setValue("");
				this.getView().byId("secondBusinessNameInput").setValue("");

				// Cancellazione suggested items

			}

			var aFilters = [];
			aFilters.push(new Filter("Name1", sap.ui.model.FilterOperator.StartsWith, businessNameValue));
			aFilters.push(new Filter("SupplierId", sap.ui.model.FilterOperator.EQ, "XXXXXXXXXXXX"));
			this._dialog.getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

			//	}
		},

		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var id = oEvent.getParameter("id");
			var aFilters = [];
			if (sTerm.length) {
				this.getView().getModel("oDataModel").setCountSupported(false);

				if (id.lastIndexOf("businessNameInput") !== -1) {
					aFilters.push(new Filter("Name1", sap.ui.model.FilterOperator.Contains, sTerm));
				}
				if (id.lastIndexOf("vatItInput") !== -1) {
					aFilters.push(new Filter("VatIt", sap.ui.model.FilterOperator.Contains, sTerm));
				}
				if (id.lastIndexOf("vatCeeInput") !== -1) {
					aFilters.push(new Filter("VatCee", sap.ui.model.FilterOperator.Contains, sTerm));
				}
				if (id.lastIndexOf("taxCodeInput") !== -1) {
					aFilters.push(new Filter("TaxCode", sap.ui.model.FilterOperator.Contains, sTerm));
				}
				//if (id.lastIndexOf("supplierIdInput") !== -1) {
				//	aFilters.push(new Filter("SupplierId", sap.ui.model.FilterOperator.Contains, sTerm));
				//}

				// FIX DB - 27/06/2017 - Indico che la chiamata sta avvenendo dall'Invitation
				aFilters.push(new Filter("SupplierId", sap.ui.model.FilterOperator.EQ, "XXXXXXXXXXXX"));

				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
				this.getView().getModel("oDataModel").setCountSupported(true);
			} else {
				return null;
			}
		},

		onSuggestionBusinessNameSelected: function(oEvent) {
			var sPath = oEvent.getParameter("selectedItem").getBindingContext("oDataModel").getPath(),
				that = this,
				oView = this.getView(),
				oUtilsModel = oView.getModel("utils"),
				mParameters = {
					urlParameters: {
						"$expand": "PurchaseOrg"
					},
					success: function(oData) {
						if (oData.Lifnr !== "") {
							oView.byId("inviteAsLabel").setVisible(true);
							oView.byId("inviteAsRB").setVisible(true);
							oView.byId("inviteAsRB").getButtons()[0].setVisible(true);
							oView.byId("inviteAsRB").getButtons()[1].setVisible(true);
						} else {
							oView.byId("inviteAsLabel").setVisible(false);
							oView.byId("inviteAsRB").setVisible(false);
							oView.byId("inviteAsRB").getButtons()[0].setVisible(false);
							oView.byId("inviteAsRB").getButtons()[1].setVisible(false);
						}
						oUtilsModel.setProperty("/oldSupplierButtonSelected", true);
						oUtilsModel.setProperty("/newSupplierButtonSelected", false);
						if (oData.PurchaseOrg.results.length !== 0) {
							oData.PurchaseOrg = oData.PurchaseOrg.results;
						} else {
							oData.PurchaseOrg = [{
								Smoi: false
							}];
						}
						oView.getModel("participation").setProperty("/Supplier", oData);

						//Load status draft
						that._firstStepValidationFlag = false;
						that._secondStepValidationFlag = true;
						that._thirdStepValidationFlag = true;
						that._lastStepValidationFlag = true;

						// Check country to activate Area Field
						if (oView.getModel("participation").getProperty("/Supplier/Country") !== "") {
							that.onCountryChange();
						}

						//Selection can happen in other step than first
						if (that._lastStepActivated === "FirstStep") {
							that._lastStepActivated = "FirstStep";
							that.checkValidationFirstStep();
						} else if (that._lastStepActivated === "GeneralDataStep") {
							that._lastStepActivated = "FirstStep";
							if (that.checkValidationFirstStep()) {
								that._lastStepActivated = "GeneralDataStep";
								that.checkValidationSecondStep();
							}
						} else if (that._lastStepActivated === "ContactInformationStep") {
							that._lastStepActivated = "FirstStep";
							if (that.checkValidationFirstStep()) {
								that._lastStepActivated = "GeneralDataStep";
								if (that.checkValidationSecondStep()) {
									that._lastStepActivated = "ContactInformationStep";
									that.checkValidationThirdStep();
								}
							}
						} else if (that._lastStepActivated === "ClusterAssignmentStep") {
							that._lastStepActivated = "FirstStep";
							if (that.checkValidationFirstStep()) {
								that._lastStepActivated = "GeneralDataStep";
								if (that.checkValidationSecondStep()) {
									that._lastStepActivated = "ContactInformationStep";
									if (that.checkValidationThirdStep()) {
										that._lastStepActivated = "ClusterAssignmentStep";
										that.checkValidationCompleteStep();
									}
								}
							}
						}
						oView.setBusy(false);

						//Gestione ripresa da ECC (30.06.2017)
						that.onSelectFromECC(true);
					},
					error: function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						oView.setBusy(false);

						//Gestione ripresa da ECC (30.06.2017)
						that.onSelectFromECC(false);
					}
				};
			oView.setBusy(true);
			oView.getModel("oDataModel").read(sPath, mParameters);
		},

		onSelectBusinessName: function(oEvent) {
			var sPath = oEvent.getParameter("selectedItem").getBindingContext("oDataModel").getPath(),
				that = this,
				oView = this.getView(),
				oUtilsModel = oView.getModel("utils"),
				mParameters = {
					urlParameters: {
						"$expand": "PurchaseOrg"
					},
					success: function(oData) {
						if (that._dialog) {
							that._dialog.destroy();
						}
						if (oData.Lifnr !== "") {
							oView.byId("inviteAsLabel").setVisible(true);
							oView.byId("inviteAsRB").setVisible(true);
							oView.byId("inviteAsRB").getButtons()[0].setVisible(true);
							oView.byId("inviteAsRB").getButtons()[1].setVisible(true);
						} else {
							oView.byId("inviteAsLabel").setVisible(false);
							oView.byId("inviteAsRB").setVisible(false);
							oView.byId("inviteAsRB").getButtons()[0].setVisible(false);
							oView.byId("inviteAsRB").getButtons()[1].setVisible(false);
						}
						oUtilsModel.setProperty("/oldSupplierButtonSelected", true);
						oUtilsModel.setProperty("/newSupplierButtonSelected", false);
						if (oData.PurchaseOrg.results.length !== 0) {
							oData.PurchaseOrg = oData.PurchaseOrg.results;
						} else {
							oData.PurchaseOrg = [{
								Smoi: false
							}];
						}
						oView.getModel("participation").setProperty("/Supplier", oData);

						//Load status draft
						that._firstStepValidationFlag = false;
						that._secondStepValidationFlag = true;
						that._thirdStepValidationFlag = true;
						that._lastStepValidationFlag = true;

						// Check country to activate Area Field
						if (oView.getModel("participation").getProperty("/Supplier/Country") !== "") {
							that.onCountryChange();
						}

						//Selection can happen in other step than first
						if (that._lastStepActivated === "FirstStep") {
							that._lastStepActivated = "FirstStep";
							that.checkValidationFirstStep();
						} else if (that._lastStepActivated === "GeneralDataStep") {
							that._lastStepActivated = "FirstStep";
							if (that.checkValidationFirstStep()) {
								that._lastStepActivated = "GeneralDataStep";
								that.checkValidationSecondStep();
							}
						} else if (that._lastStepActivated === "ContactInformationStep") {
							that._lastStepActivated = "FirstStep";
							if (that.checkValidationFirstStep()) {
								that._lastStepActivated = "GeneralDataStep";
								if (that.checkValidationSecondStep()) {
									that._lastStepActivated = "ContactInformationStep";
									that.checkValidationThirdStep();
								}
							}
						} else if (that._lastStepActivated === "ClusterAssignmentStep") {
							that._lastStepActivated = "FirstStep";
							if (that.checkValidationFirstStep()) {
								that._lastStepActivated = "GeneralDataStep";
								if (that.checkValidationSecondStep()) {
									that._lastStepActivated = "ContactInformationStep";
									if (that.checkValidationThirdStep()) {
										that._lastStepActivated = "ClusterAssignmentStep";
										that.checkValidationCompleteStep();
									}
								}
							}
						}
						oView.setBusy(false);

						//Gestione ripresa da ECC (30.06.2017)
						that.onSelectFromECC(true);

					},
					error: function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						oView.setBusy(false);

						//Gestione ripresa da ECC (30.06.2017)
						that.onSelectFromECC(false);
					}
				};
			oView.setBusy(true);
			oView.getModel("oDataModel").read(sPath, mParameters);

		},

		onBusinessNameHelpSearch: function(oEvent) {

			var sValue = oEvent.getParameter("value");
			//FIX DB - Elimino items proposti e rifaccio la ricerca 
			//(perchè trattasi di fornitori provenienti da SRM e non da ECC)
			/*if (sValue.length === 0) {
				return;
			}*/
			// FIX DB - 27/06/2017 - Indico che la chiamata sta avvenendo dall'Invitation
			//var oFilter = new Filter("Name1", sap.ui.model.FilterOperator.StartsWith, sValue);
			//var oBinding = oEvent.getSource().getBinding("items");
			//oBinding.filter([oFilter]);
			if (!sValue) {
				this.getView().byId("businessNameInput").setValue("");
				this.getView().byId("secondBusinessNameInput").setValue("");
			}

			var aFilters = [];
			aFilters.push(new Filter("Name1", sap.ui.model.FilterOperator.StartsWith, sValue));
			aFilters.push(new Filter("SupplierId", sap.ui.model.FilterOperator.EQ, "XXXXXXXXXXXX"));
			oEvent.getSource().getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
		},

		onClusterHelpSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Title", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		checkValidationFirstStep: function(oEvent) {

			var oView = this.getView(); //FIX DB 

			var that = this;
			var utilsModel = this.getView().getModel("utils");
			var participationModel = this.getView().getModel("participation");

			//Check conditions on radio button type supplier, businessName and society
			var checkRadioButtons = (utilsModel.getProperty("/NSButtonSelected") || utilsModel.getProperty("/CEEButtonSelected") ||
					utilsModel.getProperty("/ECEEButtonSelected") || utilsModel.getProperty("/freelanceButtonSelected")) &&
				(utilsModel.getProperty("/newSupplierButtonSelected") || utilsModel.getProperty("/oldSupplierButtonSelected"));
			var checkBusinessName = (this.getView().byId("businessNameInput").getValue() !== "") ? true : false;

			//Retrieve last activated Wizard Step 
			var lastStepActivatedControl = this.getView().byId(this._lastStepActivated);

			//Set Value State based on check
			this.changeValueState([checkRadioButtons, checkBusinessName], ["supplierTypeButtonGroup", "businessNameInput"]);

			//if businessName is erased erase also all others field					
			if (!checkBusinessName && oEvent && oEvent.getParameter("id").lastIndexOf("businessNameInput") !== -1) {

				// DB - FIX BUG #051  (PUNTO C) : Commentata cancellazione campo Partita IVA
				//	participationModel.setProperty("/Supplier/VatIt", "");

				// DB - FIX BUG #056  (PUNTO C) : Commentata cancellazione campo Partita IVA CEE
				//participationModel.setProperty("/Supplier/VatCee", "");

				participationModel.setProperty("/Supplier/SupplierId", "");
				participationModel.setProperty("/Supplier/Status", "");

				//Gestione ripresa da ECC (30.06.2017) - Riapro in input il campo
				that.onSelectFromECC(false);

			}

			// DB - FIX BUG #051  (PUNTO A e B) : Controllo obbligatorietà e forzata cancellazione campo Ragione Sociale
			//      NOTA:  Se si cancella il campo ragione sociale della sezione "Ricerca fornitori"   
			//			   allora deve cancellarsi anche nella sezione "Dati Generali" 
			var oBusinessNameInput = oView.byId("businessNameInput");
			var oSecondBusinessNameInput = oView.byId("secondBusinessNameInput");
			utils.checkBusinessName(oBusinessNameInput, oSecondBusinessNameInput, true);

			// DB - FIX BUG #052 : Controllo lunghezza partita IVA
			var oVatItInput = oView.byId("vatItInput");
			var oSecondVatItInput = oView.byId("secondVatItInput");
			utils.checkLengthIVA(oVatItInput.getValue(), oVatItInput, false);
			utils.checkLengthIVA(oVatItInput.getValue(), oSecondVatItInput, false);

			// DB - FIX BUG #057 : Controlli partita IVA CEE
			var oVatCeeInput = oView.byId("vatCeeInput");
			var oSecondVatCeeInput = oView.byId("secondVatCeeInput");
			utils.checkIVACEE(oVatCeeInput.getValue(), oVatCeeInput, false);
			utils.checkIVACEE(oVatCeeInput.getValue(), oSecondVatCeeInput, false);

			// DB - FIX : 06/2017 - Fill Dropdown Area
			var selectedKey = oView.byId("countrySelect").getSelectedKey();
			this._updateCountrySelectOptions(selectedKey);

			//Validate or invalidate step based on check			
			if (checkRadioButtons && checkBusinessName) {
				if (utilsModel.getProperty("/NSButtonSelected")) {
					this.getView().byId("countrySelect").setSelectedKey("IT");
				} else {
					if (utilsModel.getProperty("newSupplierButtonSelected")) {
						this.getView().byId("countrySelect").setSelectedKey("");
					}
				}
				this._firstStepValidationFlag = true;
				if (!lastStepActivatedControl.getValidated() && this._secondStepValidationFlag && this._thirdStepValidationFlag &&
					this._lastStepValidationFlag) {
					this._wizard.validateStep(lastStepActivatedControl);

					//Retrieve User Role
					this.parseUserInfo();
					setTimeout(function() {
						that.changeTextNextButton();
					}, 0);
				}
				return true;
			} else {
				this._firstStepValidationFlag = false;
				this._wizard.invalidateStep(lastStepActivatedControl);
				return false;
			}
		},

		checkValidationSecondStep: function() {
			var that = this,
				oView = this.getView();
			var utilsModel = oView.getModel("utils");
			var oModel = oView.getModel("utils");
			var checkRadioButtonsQualification =
				utilsModel.getProperty("/preQualificationButtonSelected") || utilsModel.getProperty("/onlyQualificationButtonSelected") ||
				utilsModel.getProperty("/bothQualificationButtonSelected") || utilsModel.getProperty("/onlyCodificationButtonSelected");
			var checkBusinessName = (oView.byId("secondBusinessNameInput").getValue() !== "" ||
				oView.byId("businessNameInput").getValue() !== "") ? true : false;
			var checkVatIt = (oView.byId("secondVatItInput").getValue() !== "") ? true : false;
			var checkVatCee = (oView.byId("secondVatCeeInput").getValue() !== "") ? true : false;
			var checkTaxCode = (oView.byId("taxCode").getValue() !== "") ? true : false;
			var checkCountry = (oView.byId("countrySelect").getSelectedKey() !== "") ? true : false;
			/*			var checkBirthDate = this.checkBirthDate();
						var checkBirthCity = (oView.byId("birthCityInput").getValue() !== "" ) ? true : false;
						var checkJob = (oView.byId("jobInput").getValue() !== "" ) ? true : false;
						var checkSex = (oView.getModel("participation").getProperty("/Supplier/Whsex") !== "" ) ? true : false;
						var checkProvince = (oView.byId("provinceSelect").getSelectedKey() !== "" || 
											checkCountry && oView.byId("countrySelect").getSelectedKey() !== "IT" ||
											!utilsModel.getProperty("/freelanceButtonSelected")) ? true : false;*/

			//Retrieve last activated Wizard Step 
			var lastStepActivatedControl = this.getView().byId(this._lastStepActivated);

			/*			if (oModel.getProperty("/preQualificationButtonSelected") || !checkRadioButtonsQualification) {
							this.changeValueState([checkTaxCode, checkVatIt, checkVatCee, checkBusinessName, checkRadioButtonsQualification], 
									["taxCode", "secondVatItInput", "secondVatCeeInput", "secondBusinessNameInput", "surveyTypeButtonGroup"]);	
							this.changeValueState([true, true, true], 
								["birthDatePicker", "birthCityInput", "jobInput"]);	
							oView.byId("birthDateText").removeStyleClass("required");
						} else {
							this.changeValueState([checkBusinessName, checkVatIt, checkVatCee, checkRadioButtonsQualification, 
												checkTaxCode], 
												["secondBusinessNameInput", "secondVatItInput", "secondVatCeeInput", "surveyTypeButtonGroup",
												"taxCode"]);	
							oView.byId("birthDateText").addStyleClass("required");
						}	*/

			//Set Value State based on check	
			this.changeValueState([checkBusinessName, checkVatCee, checkRadioButtonsQualification], ["secondBusinessNameInput",
				"secondVatCeeInput", "surveyTypeButtonGroup"
			]);

			if (oModel.getProperty("/freelanceButtonSelected")) {
				if (!checkTaxCode && !checkVatIt) {
					this.changeValueState([false, false], ["taxCode", "secondVatItInput"]);
				} else {
					this.changeValueState([true, true], ["taxCode", "secondVatItInput"]);
				}
			} else {
				this.changeValueState([checkTaxCode, checkVatIt], ["taxCode", "secondVatItInput"]);
			}

			/*			if (oView.byId("countrySelect").getSelectedKey() === "IT" ){
							oView.byId("provinceText").addStyleClass("required");
						} else {
							oView.byId("provinceText").removeStyleClass("required");
						}*/

			// CSS cause select doesn't have valueState (implementented in 1.40)
			/*			if (checkSex || oModel.getProperty("/preQualificationButtonSelected") || !checkRadioButtonsQualification){
							oView.byId("selectSex").removeStyleClass("selectError");
						} else {
							oView.byId("selectSex").addStyleClass("selectError");
						}*/

			if (checkCountry) {
				oView.byId("countrySelect").removeStyleClass("selectError");
			} else {
				oView.byId("countrySelect").addStyleClass("selectError");
			}

			/*			if (!checkCountry || !checkRadioButtonsQualification){
							oView.byId("provinceSelect").removeStyleClass("selectError");
						} else {
							oView.byId("provinceSelect").addStyleClass("selectError");
						}*/

			// DB - FIX BUG #051  (PUNTO A e B) : Controllo obbligatorietà e forzata cancellazione campo Ragione Sociale
			//      NOTA:  Se si cancella il campo ragione sociale della sezione "Dati Generali" 
			//			   allora deve cancellarsi anche nella sezione "Ricerca fornitori" 
			var oBusinessNameInput = oView.byId("businessNameInput");
			var oSecondBusinessNameInput = oView.byId("secondBusinessNameInput");
			checkBusinessName = utils.checkBusinessName(oSecondBusinessNameInput, oBusinessNameInput, true);

			// DB - FIX BUG #052 : Controllo lunghezza partita IVA
			var oVatItInput = oView.byId("vatItInput");
			var oSecondVatItInput = oView.byId("secondVatItInput");
			utils.checkLengthIVA(oSecondVatItInput.getValue(), oVatItInput, false);
			checkVatIt = utils.checkLengthIVA(oSecondVatItInput.getValue(), oSecondVatItInput, true);

			// DB - FIX BUG #057 : Controlli partita IVA CEE
			var oVatCeeInput = oView.byId("vatCeeInput");
			var oSecondVatCeeInput = oView.byId("secondVatCeeInput");
			utils.checkIVACEE(oSecondVatCeeInput.getValue(), oVatCeeInput, false);
			checkVatCee = utils.checkIVACEE(oSecondVatCeeInput.getValue(), oSecondVatCeeInput, true);

			// DB - FIX : 06/2017 - Fill Dropdown Area
			var selectedKey = oView.byId("countrySelect").getSelectedKey();
			this._updateCountrySelectOptions(selectedKey);

			//Validate or invalidate step based on check			
			if (checkBusinessName && checkRadioButtonsQualification && checkCountry) {
				if (((checkVatIt && oModel.getProperty("/NSButtonSelected")) ||
						(checkVatCee && oModel.getProperty("/CEEButtonSelected")) ||
						(oModel.getProperty("/ECEEButtonSelected"))) ||
					((checkVatIt || checkTaxCode) && oModel.getProperty("/freelanceButtonSelected"))
				) {

					this._secondStepValidationFlag = true;
					if (!lastStepActivatedControl.getValidated() && this._firstStepValidationFlag && this._thirdStepValidationFlag &&
						this._lastStepValidationFlag) {
						this._wizard.validateStep(lastStepActivatedControl);
						setTimeout(function() {
							that.changeTextNextButton();
						}, 0);
					}
					return true;
				} else {
					this._wizard.invalidateStep(lastStepActivatedControl);
					this._secondStepValidationFlag = false;
					return false;
				}
			} else {
				this._wizard.invalidateStep(lastStepActivatedControl);
				this._secondStepValidationFlag = false;
				return false;
			}
		},

		checkValidationThirdStep: function() {
			var that = this;
			var utilsModel = this.getView().getModel("utils");

			//Retrieve last activated Wizard Step 
			var lastStepActivatedControl = this.getView().byId(this._lastStepActivated);

			//Check conditions on firstname, surname and email
			var oValueNameCheck = this.getView().byId("firstnameInput").getValue() !== "";
			var oValueSurnameCheck = this.getView().byId("surnameInput").getValue() !== "";
			var oValueEmail = this.getView().byId("emailInput").getValue();
			var mailregex =
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var oValueEmailCheck = (oValueEmail !== "" && oValueEmail.match(mailregex)) ? true : false;

			//Set Value State based on check
			this.changeValueState([oValueNameCheck, oValueSurnameCheck, oValueEmailCheck], ["firstnameInput", "surnameInput", "emailInput"]);

			//Validate or invalidate step based on check
			var checkInput = (oValueNameCheck && oValueSurnameCheck && oValueEmailCheck) ? true : false;
			if (checkInput || utilsModel.getProperty("/oldSupplier")) {
				this._thirdStepValidationFlag = true;
				if (!lastStepActivatedControl.getValidated() && this._firstStepValidationFlag && this._secondStepValidationFlag &&
					this._lastStepValidationFlag) {
					this._wizard.validateStep(lastStepActivatedControl);
					setTimeout(function() {
						that.changeTextNextButton();
					}, 0);
				}

				// BEGIN FIX DB - 03.07.2017
				//that.checkClusterSelected();
				//				alert("QUI");
				// END   FIX DB - 03.07.2017

				return true;
			} else {
				this._thirdStepValidationFlag = false;
				this._wizard.invalidateStep(lastStepActivatedControl);
				return false;
			}
		},

		checkValidationCompleteStep: function() {
			var oView = this.getView();
			var participationModel = this.getView().getModel("participation");
			var isClusterSelected = participationModel.getProperty("/ClusterId") !== "" ? true : false;
			var isIndustrialSector = participationModel.getProperty("/Supplier/IndustrialSector") !== "" ? true : false;
			var isCompanySelected = participationModel.getProperty("/Bukrs") !== "" ? true : false;
			var isPurchaseOrgSelected = participationModel.getProperty("/Ekorg") !== "" ? true : false;
			var checkExpirationDate = this.checkExpirationDate();

			//BEGIN DB - FIX BUG 06/2017: Impedire invio se approvatore non definito
			//var oUserModel = this.getView().getModel("oUserModel");
			//var isApproverDefined = oUserModel.getProperty("/User"); // !== "" ? true : false;
			//console.log("Approver: " + isApproverDefined);
			//END   DB - FIX BUG 06/2017: Impedire invio se approvatore non definito 

			var that = this;

			//Retrieve last activated Wizard Step 
			var lastStepActivatedControl = this.getView().byId(this._lastStepActivated);

			if (isClusterSelected) {
				this.getView().byId("selectedClusterItem").setInfo("");
			} else {
				this.getView().byId("selectedClusterItem").setInfo(this.getTranslation("selectedClusterItemInfo"));
			}

			if (isCompanySelected) {
				oView.byId("companySelect").removeStyleClass("selectError");
			} else {
				oView.byId("companySelect").addStyleClass("selectError");
			}

			if (isPurchaseOrgSelected) {
				oView.byId("purchaseOrgSelect").removeStyleClass("selectError");
			} else {
				oView.byId("purchaseOrgSelect").addStyleClass("selectError");
			}

			if (isIndustrialSector) {
				oView.byId("industrialSectorSelect").removeStyleClass("selectError");
			} else {
				oView.byId("industrialSectorSelect").addStyleClass("selectError");
			}
			//Set Value State based on check
			this.changeValueState([checkExpirationDate], ["expirationDatePicker"]);

			if (isClusterSelected && isCompanySelected && isPurchaseOrgSelected && isIndustrialSector && checkExpirationDate) {
				this._lastStepValidationFlag = true;
				if (!lastStepActivatedControl.getValidated() && this._firstStepValidationFlag && this._secondStepValidationFlag &&
					this._thirdStepValidationFlag) {
					this._wizard.validateStep(lastStepActivatedControl);
					setTimeout(function() {
						that.changeTextNextButton();
					}, 0);
				}
				return true;
			} else {
				this._lastStepValidationFlag = false;
				this._wizard.invalidateStep(lastStepActivatedControl);
				return false;
			}
		},

		checkExpirationDate: function() {
			var today = new Date();
			var expirationDate = this.getView().byId("expirationDatePicker").getDateValue();
			if (expirationDate === false || expirationDate < today) {
				return false;
			} else {
				return true;
			}

		},

		checkBirthDate: function() {
			var today = new Date();
			var birthDate = this.getView().byId("birthDatePicker").getDateValue();
			if (!birthDate || today < birthDate) {
				this.getView().byId("birthDatePicker").setValueStateText(this.getTranslation("valueStateTextBirthDate"));
				return false;
			}
			var age = this.calculateAge(birthDate);
			if (age < 18) {
				this.getView().byId("birthDatePicker").setValueStateText(this.getTranslation("freelanceTooYoung"));
				return false;
			} else {
				return true;
			}

		},

		calculateAge: function(birthday) { // birthday is a date
			var ageDifMs = Date.now() - birthday.getTime();
			var ageDate = new Date(ageDifMs); // miliseconds from epoch
			return Math.abs(ageDate.getUTCFullYear() - 1970);
		},

		//The next 3 functions update the lastActivatedStep based on current step. 
		onCompleteFirstStep: function() {
			this._lastStepActivated = "GeneralDataStep";
		},

		onCompleteGeneralDataStep: function() {
			this._lastStepActivated = "ContactInformationStep";
		},

		onCompleteContactInformationStep: function() {
			this._lastStepActivated = "ClusterAssignmentStep";
			var expirationDate = new Date();
			expirationDate.setDate(expirationDate.getDate() + 45);
			this.getView().byId("expirationDatePicker").setDateValue(expirationDate);
		},

		//Change text button
		changeTextNextButton: function() {
			//Dirty way: we cannot assign an id to the nextButton so we have to retrieve it manually
			if (this._lastStepActivated === "ClusterAssignmentStep") {
				this.getView().byId("__xmlview0--invitationWizard-nextButton").setIcon("sap-icon://email");
			} else {
				this.getView().byId("__xmlview0--invitationWizard-nextButton").setIcon("sap-icon://open-command-field");
				this.getView().byId("__xmlview0--invitationWizard-nextButton").setText(this.getTranslation("next"));
			}
			this.getView().byId("__xmlview0--invitationWizard-nextButton").setType("Accept");
		},

		completedHandler: function() {
			var that = this,
				oDataModel = this.getView().getModel("oDataModel"),
				oParticipationModel = this.getView().getModel("participation"),
				oUtilsModel = this.getView().getModel("utils"),
				sPath = "TaxNumberCheck",
				country = oParticipationModel.getProperty("/Supplier/Country"),
				//				regio = oUtilsModel.getProperty("/freelanceButtonSelected") ? oParticipationModel.getProperty("/Supplier/Province") : "",
				naturalPerson = oUtilsModel.getProperty("/freelanceButtonSelected") ? oParticipationModel.getProperty("/Supplier/Naturalperson") :
				false,
				taxCode = !oParticipationModel.getProperty("/Supplier/TaxCode") || oParticipationModel.getProperty("/Supplier/TaxCode") === "" ?
				"" : oParticipationModel.getProperty("/Supplier/TaxCode"),
				vat = oUtilsModel.getProperty("/CEEButtonSelected") ? oParticipationModel.getProperty("/Supplier/VatCee") : oParticipationModel.getProperty(
					"/Supplier/VatIt"),
				mParameters = {
					urlParameters: {
						"Country": country,
						"NaturalPerson": naturalPerson,
						"Vat": vat,
						"Regio": "",
						"Taxcode": taxCode
					},
					success: function(oData) {
						oParticipationModel.setProperty("/Status", "I");

						//If supplier is new delete supplier Id 
						if (oUtilsModel.getProperty("/newSupplierButtonSelected")) {
							delete oParticipationModel.getProperty("/Supplier").SupplierId;
							delete oParticipationModel.getProperty("/Supplier/PurchaseOrg").SupplierId;
						}
						//Set Participation Type
						if (oUtilsModel.getProperty("/preQualificationButtonSelected")) {
							oParticipationModel.setProperty("/Type", "PRE_QUALIFICATION");
						} else if (oUtilsModel.getProperty("/onlyQualificationButtonSelected")) {
							oParticipationModel.setProperty("/Type", "QUALIFICATION");
						} else if (oUtilsModel.getProperty("/bothQualificationButtonSelected")) {
							oParticipationModel.setProperty("/Type", "PRE_QUALIFICATION_AND_QUALIFICATION");
						} else if (oUtilsModel.getProperty("/onlyCodificationButtonSelected")) {
							oParticipationModel.setProperty("/Type", "ONLY_CODIFICATION");
						}
						//Set Supplier Type
						if (oUtilsModel.getProperty("/NSButtonSelected")) {
							oParticipationModel.setProperty("/Supplier/Type", "NATIONAL");
						} else if (oUtilsModel.getProperty("/CEEButtonSelected")) {
							oParticipationModel.setProperty("/Supplier/Type", "CEE");
						} else if (oUtilsModel.getProperty("/ECEEButtonSelected")) {
							oParticipationModel.setProperty("/Supplier/Type", "ECEE");
						} else if (oUtilsModel.getProperty("/freelanceButtonSelected")) {
							oParticipationModel.setProperty("/Supplier/Type", "FREELANCER");
						}

						//FIX DB - Attivazione busy state
						that.getView().setBusy(true);

						oDataModel.create("/ParticipationSet", oParticipationModel.getProperty("/"), null,
							function(response) {
								var participationId = response.ParticipationId;
								var businessName = oParticipationModel.getProperty("/Supplier/Name1");
								var oBundle = that.getView().getModel("i18n").getResourceBundle();
								var sMsg = oBundle.getText("invitationSent", [participationId, businessName]);
								that.getView().setBusy(false);
								MessageToast.show(sMsg, {
									duration: 5000,
									width: "30em",
									animationDuration: 1000,
									closeOnBrowserNavigation: false
								});
								try {
									var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
									oCrossAppNavigator.toExternal({
										target: {
											semanticObject: "#"
										}
									});
								} catch (e) {

								}
							},
							function(error) {
								that.getView().setBusy(false);
								if (error.response.statusCode === 400) {
									var message = JSON.parse(error.response.body).error.innererror.errordetails[0].message;
									MessageToast.show(message);
								} else {
									MessageToast.show(that.getTranslation("gatewayError"));
								}
							}
						);
					},
					error: function(oError) {
						var body = JSON.parse(oError.response.body);
						//This check is wrong. If Vat is not 11 char this will be triggered
						if (body.error.message.value.indexOf("1") > -1) {
							that.getView().byId("taxCode").setValueState("Error");
						}
						if (body.error.message.value.indexOf("2") > -1) {
							that.getView().byId("secondVatItInput").setValueState("Error");
						}
						MessageToast.show(body.error.message.value, {
							"duration": 5000
						});
						that.getView().setBusy(false);
					}
				};
			this.getView().setBusy(true);
			if (!oParticipationModel.getProperty("/Supplier/TaxCode") && !oParticipationModel.getProperty("/Supplier/VatIt") && !
				oParticipationModel.getProperty("/Supplier/VatCee")) {
				mParameters.success();
			} else {
				this.getView().getModel("oDataModel").callFunction(sPath, mParameters);
			}
		},

		checkClusterSelected: function() {
			var oParticipationModel = this.getView().getModel("participation"),
				cluster = oParticipationModel.getProperty("/ClusterId"),
				purchOrg = oParticipationModel.getProperty("/Ekorg"),
				company = oParticipationModel.getProperty("/Bukrs");

			//FIX Selezione dropdown Società
			if (company)
				this.getView().byId("companySelect").setSelectedKey(company);

			var oApprover = this.getView().byId("approverItem");
			oApprover.unbindElement();

			if (purchOrg && company && cluster) {
				this.getView().setBusy(true);
				var that = this;
				var sPath = "/ClusterSet('" + cluster + "')";
				var aFilters = [
					///BEGIN DB - FIX BUG 06/2017: Filtro per Società e Org. Acquisti 
					//new Filter("ClusterCom/Bukrs", sap.ui.model.FilterOperator.EQ, company),
					//new Filter("ClusterCom/Ekorg", sap.ui.model.FilterOperator.EQ, purchOrg)
					///END   DB - FIX BUG 06/2017: Filtro per Società e Org. Acquisti 
				];
				var mParameters = {
					filters: aFilters,
					urlParameters: {
						"$expand": "ClusterCom"
					},
					success: function(oRespOData) {

						//BEGIN DB - FIX BUG 06/2017: Filtro per Società e Org. Acquisti 
						//var resp = oRespOData.ClusterCom.results[0].Resp;
						var resp = '';

						for (var i = 0; i < oRespOData.ClusterCom.results.length; i++) {
							if ((oRespOData.ClusterCom.results[i].Bukrs === company) && (oRespOData.ClusterCom.results[i].Ekorg === purchOrg))
								resp = oRespOData.ClusterCom.results[i].Resp;
						}
						if (!resp) {
							//Responsabile approvatore NON definito
							oApprover.setHighlight('Error');
							MessageToast.show(that.getTranslation("checkApprover"));
						} else {
							//Responsabile approvatore definito
							oApprover.setHighlight('None');
							oApprover.setNumberState('None');
							oApprover.bindElement("oUserModel>/UserSet('" + resp + "')");
						}
						//END   DB - FIX BUG 06/2017: Filtro per Società e Org. Acquisti 

						//oApprover.bindElement("oUserModel>/UserSet('" + resp + "')");
						that.getView().setBusy(false);
					},
					error: function() {
						that.getView().setBusy(false);
					}
				};
				//	this.getView().getModel("oDataModel").read(sPath, mParameters);
				that.getView().getModel("oDataModel").read(sPath, mParameters);
			}
			this.checkValidationCompleteStep();
			var isBound = that.getView().byId("approverItem").isBound("oUserModel");
			//console.log("isBound: " + isBound);
		},

		handleLoadDraft: function() {
			var that = this,
				oUtilsModel = this.getView().getModel("utils"),
				oParticipationModel = this.getView().getModel("participation");
			// If is local a standard userId is used (CO_UNISYS2)
			try {
				var userId = sap.ushell.Container.getService("UserInfo").getId();
			} catch (e) {
				// BEGIN DB - Recupero Utenza da parametro url
				userId = jQuery.sap.getUriParameters().get("fater_id");
				if (userId === null || userId === undefined)
				// END   DB - Recupero Utenza da parametro url
					userId = "CO_UNISYS2";
			}
			var sPath = "/ParticipationSet?$filter=Status eq 'DI' and CommercialRefId eq '" + userId + "'";
			var mParameters = {
				urlParameters: {
					"$expand": "Supplier",
					"$orderby": "ParticipationId asc",
					"$top": "1"
				},
				success: function(oData) {
					if (oData.results.length === 0) {
						that.getView().setBusy(false);
						MessageToast.show(that.getTranslation("noDraft"));
						return;
					}
					oParticipationModel.setProperty("/", oData.results[0]);
					if (oParticipationModel.getProperty("/ExpireT").getTime() === 0) {
						delete oParticipationModel.getProperty("/").ExpireT;
					}
					// Check country to activate Area Field
					if (oParticipationModel.getProperty("/Supplier/Country") !== "") {
						that.onCountryChange();
					}
					// Set selected Cluster
					if (oData.results[0].ClusterId !== "") {
						that.getView().getModel("oDataModel").read("/ClusterSet('" + oData.results[0].ClusterId + "')", {
							success: function(clusterData) {

								//FIX DB - 03.07.2017: Caricamento società, org. acquisti e approvatore
								that.onSelectCluster(oData.results[0].ClusterId);

								that.getView().byId("selectedClusterItem").setTitle(clusterData.Name);
							},
							error: function(error) {

							}
						});
					}
					//Set Supplier Type
					if (oParticipationModel.getProperty("/Supplier/Type") === "NATIONAL") {
						oUtilsModel.setProperty("/NSButtonSelected", true);
					} else if (oParticipationModel.getProperty("/Supplier/Type") === "CEE") {
						oUtilsModel.setProperty("/CEEButtonSelected", true);
					} else if (oParticipationModel.getProperty("/Supplier/Type") === "ECEE") {
						oUtilsModel.setProperty("/ECEEButtonSelected", true);
					} else if (oParticipationModel.getProperty("/Supplier/Type") === "FREELANCER") {
						oUtilsModel.setProperty("/freelanceButtonSelected", true);
					}
					//Set Participation Type
					if (oParticipationModel.getProperty("/Type") === "PRE_QUALIFICATION") {
						oUtilsModel.setProperty("/preQualificationButtonSelected", true);
					} else if (oParticipationModel.getProperty("/Type") === "QUALIFICATION") {
						oUtilsModel.setProperty("/onlyQualificationButtonSelected", true);
					} else if (oParticipationModel.getProperty("/Type") === "PRE_QUALIFICATION_AND_QUALIFICATION") {
						oUtilsModel.setProperty("/bothQualificationButtonSelected", true);
					} else if (oParticipationModel.getProperty("/Type") === "ONLY_CODIFICATION") {
						oUtilsModel.setProperty("/onlyCodificationButtonSelected", true);
					}
					//Load status draft
					that._firstStepValidationFlag = false;
					that._secondStepValidationFlag = true;
					that._thirdStepValidationFlag = true;
					that._lastStepValidationFlag = true;
					if (oParticipationModel.getProperty("/DraftStat") === "FirstStep") {
						that._lastStepActivated = "FirstStep";
						that.checkValidationFirstStep();
					} else if (oParticipationModel.getProperty("/DraftStat") === "GeneralDataStep") {
						that._lastStepActivated = "FirstStep";
						if (that.checkValidationFirstStep()) {
							that._lastStepActivated = "GeneralDataStep";
							that.checkValidationSecondStep();
						}
					} else if (oParticipationModel.getProperty("/DraftStat") === "ContactInformationStep") {
						that._lastStepActivated = "FirstStep";
						if (that.checkValidationFirstStep()) {
							that._lastStepActivated = "GeneralDataStep";
							if (that.checkValidationSecondStep()) {
								that._lastStepActivated = "ContactInformationStep";
								that.checkValidationThirdStep();
							}
						}
					} else if (oParticipationModel.getProperty("/DraftStat") === "ClusterAssignmentStep") {
						that._lastStepActivated = "FirstStep";
						if (that.checkValidationFirstStep()) {
							that._lastStepActivated = "GeneralDataStep";
							if (that.checkValidationSecondStep()) {
								that._lastStepActivated = "ContactInformationStep";
								if (that.checkValidationThirdStep()) {
									that._lastStepActivated = "ClusterAssignmentStep";
									that.checkValidationCompleteStep();
								}
							}
						}
					}

					//that._updateCountrySelectOptions( oData.results[0].Supplier.Country );
					that.getView().setBusy(false);
					MessageToast.show(that.getTranslation("loadDraftSuccess"));
				}.bind(this),
				error: function(oError) {
					jQuery.sap.log.info("Odata Error occured");
					this.getView().setBusy(false);
					MessageToast.show(that.getTranslation("loadDraftFailed"));
				}.bind(this)
			};
			this.getView().setBusy(true);
			this.getView().getModel("oDataModel").read(sPath, mParameters);
		},

		handleSaveDraft: function() {
			var oDataModel = this.getView().getModel("oDataModel");
			var oParticipationModel = this.getView().getModel("participation");
			var oUtilsModel = this.getView().getModel("utils");
			var that = this;
			oParticipationModel.setProperty("/Status", "DI");
			oParticipationModel.setProperty("/DraftStat", this._lastStepActivated);

			//If supplier is new delete supplier Id 
			if (oUtilsModel.getProperty("/newSupplierButtonSelected")) {
				delete oParticipationModel.getProperty("/Supplier").SupplierId;
			}
			//Insert dummy date
			if (!oParticipationModel.getProperty("/ExpireT")) {
				var dummyDate = new Date(0);
				oParticipationModel.setProperty("/ExpireT", dummyDate);
			}
			//Set Supplier Type
			if (oUtilsModel.getProperty("/NSButtonSelected")) {
				oParticipationModel.setProperty("/Supplier/Type", "NATIONAL");
			} else if (oUtilsModel.getProperty("/CEEButtonSelected")) {
				oParticipationModel.setProperty("/Supplier/Type", "CEE");
			} else if (oUtilsModel.getProperty("/ECEEButtonSelected")) {
				oParticipationModel.setProperty("/Supplier/Type", "ECEE");
			} else if (oUtilsModel.getProperty("/freelanceButtonSelected")) {
				oParticipationModel.setProperty("/Supplier/Type", "FREELANCER");
			}
			//Set Participation Type
			if (oUtilsModel.getProperty("/preQualificationButtonSelected")) {
				oParticipationModel.setProperty("/Type", "PRE_QUALIFICATION");
			} else if (oUtilsModel.getProperty("/onlyQualificationButtonSelected")) {
				oParticipationModel.setProperty("/Type", "QUALIFICATION");
			} else if (oUtilsModel.getProperty("/bothQualificationButtonSelected")) {
				oParticipationModel.setProperty("/Type", "PRE_QUALIFICATION_AND_QUALIFICATION");
			} else if (oUtilsModel.getProperty("/onlyCodificationButtonSelected")) {
				oParticipationModel.setProperty("/Type", "ONLY_CODIFICATION");
			}

			oDataModel.create("/ParticipationSet", oParticipationModel.getProperty("/"), null,
				function() {
					if (oParticipationModel.getProperty("/ExpireT").getTime() === 0) {
						delete oParticipationModel.getProperty("/").ExpireT;
					}
					oParticipationModel.refresh();
					MessageToast.show(that.getTranslation("saveDraftSuccess"));
				},
				function() {
					if (oParticipationModel.getProperty("/ExpireT").getTime() === 0) {
						delete oParticipationModel.getProperty("/").ExpireT;
					}
					oParticipationModel.refresh();
					MessageToast.show(that.getTranslation("saveDraftFailed"));
				}
			);
		},

		changeValueState: function(check, controlName) {
			for (var i = 0; i < controlName.length; i++) {
				if (!check[i]) {
					this.getView().byId(controlName[i]).setValueState("Error");
				} else {
					this.getView().byId(controlName[i]).setValueState("None");
				}
			}
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Get the translation for sKey
		 * @public
		 * @param {string} sKey the translation key
		 * @param {array} aParameters translation paramets (can be null)
		 * @returns {string} The translation of sKey
		 */
		getTranslation: function(sKey, aParameters) {
			if (aParameters === undefined || aParameters === null) {
				return this.getResourceBundle().getText(sKey);
			} else {
				return this.getResourceBundle().getText(sKey, aParameters);
			}

		},

		onCountryChange: function(oEvent) {
			var selectedKey = oEvent ? selectedKey = oEvent.getParameter("selectedItem").getKey() : selectedKey = this.getView().byId(
				"countrySelect").getSelectedKey();
			this._updateCountrySelectOptions(selectedKey);
			if (this._lastStepActivated !== "FirstStep") {
				this.checkValidationSecondStep();
			}
		},

		parseUserInfo: function() {
			var id = null;

			try {
				var userShell = sap.ushell.Container.getService("UserInfo").getUser();
				id = userShell.getId().toUpperCase();
			} catch (err) {}

			if (id === null || id === undefined) {
				try {
					id = "RIF_COMM_01";
				} catch (err) {}
			}

			var oUtilsModel = this.getView().getModel("utils");
			var oParticipationModel = this.getView().getModel("participation");
			if (oUtilsModel) {
				this.getView().getModel("oUserModel").read("/UserSet('" + id + "')", {
					async: false,
					success: function(oUserOData) {
						oUtilsModel.setProperty("/User", oUserOData);
						if (oUserOData.Role === "COMMERCIAL_MANAGER") {
							oParticipationModel.setProperty("/DoneByFater", true);
						}
					},
					error: function(error) {

					}
				});
			}
		},

		_updateCountrySelectOptions: function(selectedCountry) {
			if (!selectedCountry) {
				return;
			}

			/*			this.getView().byId("provinceSelect").bindItems({
				    		path: "oDataModel>/CountrySet('"+selectedCountry+"')/Regio",
				    		sorter: new sap.ui.model.Sorter("Description", true),
				    		template: new sap.ui.core.Item({  
								key : "{oDataModel>Key}",  
								text : "{oDataModel>Description}"  
							})
				    	});*/

			this.getView().byId("contact_area").bindItems({
				path: "ControlValues>/ContactArea" + (selectedCountry !== "IT" ? "EN" : "IT"),
				sorter: new sap.ui.model.Sorter("Description", true),
				template: new sap.ui.core.Item({
					key: "{ControlValues>Key}",
					text: "{ControlValues>Description}"
				})
			});
		},

		onSelectFromECC: function(state) {
			this.getView().byId("supplierIdInput").setEditable(!state);
		},

		//FIX DB - 03.07.2017
		onLiveChangeBusinessName: function(oEvent) {
			var oView = this.getView();
			var value = oEvent.getParameter("value");
			//if (oEvent.oSource._sSearchFieldValue === "") {
			if (!value) {
				oView.byId("businessNameInput").setValue("");
				oView.byId("secondBusinessNameInput").setValue("");
			}

			/*this._dialog.fireSearch({
				"value": value
			});*/

			var aFilters = [];
			aFilters.push(new Filter("Name1", sap.ui.model.FilterOperator.StartsWith, value));
			aFilters.push(new Filter("SupplierId", sap.ui.model.FilterOperator.EQ, "XXXXXXXXXXXX"));
			oEvent.getSource().getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
		},

		onBusinessNameHelpClose: function(oEvent) {
			//var oView = this.getView();
			//oView.byId("businessNameInput").setValue("");
			//oView.byId("secondBusinessNameInput").setValue("");
		}
	});

});