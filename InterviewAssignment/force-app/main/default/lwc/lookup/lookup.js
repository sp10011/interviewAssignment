import { LightningElement,wire,api,track } from 'lwc';
import getResults from '@salesforce/apex/LookupController.getResults';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import updateOppAccount from '@salesforce/apex/OpportuntiyController.updateOpportunityAccount';

export default class lookup extends LightningElement {
    @api objectName = 'Account';
    @api fieldName = 'Name';
    @api selectRecordId = '';
    @api oppRecordId;
    @api selectRecordName;
    @api Label;
    @api searchRecords = [];
    @api required = false;
    @api iconName = 'action:new_account'
    @api LoadingText = false;
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track customHeight = 'slds-form-element';
    @track showSpinner=false;
    @track messageFlag = false;
    @track iconFlag =  true;
    @track clearIconFlag = false;
    @track inputReadOnly = false;

    @wire(getRecord, { recordId: '$selectRecordName', fields: [ACCOUNT_NAME_FIELD] })
    record({data,error}){
        if (data) {
            this.selectRecordName = data.fields.Name.value;
            this.error = undefined;
            var accName = this.selectRecordName;
            this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            this.iconFlag = false;
            this.clearIconFlag = true;
            this.inputReadOnly = true;
            const selectedEvent = new CustomEvent('selected', { detail: {accName}, });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);
        } else if (error) {
            this.error = error;
        }
    }
   

    searchField(event) {
        var currentText = event.target.value;
        this.LoadingText = true;
        
        getResults({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText  })
        .then(result => {
            this.searchRecords= result;
            this.LoadingText = false;
            
            this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            this.customHeight =  result.length > 0 ? 'slds-form-element' : 'slds-form-element cusHeight';
            if(currentText.length > 0 && result.length == 0) {
                this.messageFlag = true;
            }
            else {
                this.messageFlag = false;
            }

            if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                this.iconFlag = false;
                this.clearIconFlag = true;
            }
            else {
                this.iconFlag = true;
                this.clearIconFlag = false;
            }
        })
        .catch(error => {
            console.log('-------error-------------'+error);
            console.log(error);
        }); 
        
    }
    
   setSelectedRecord(event) {
        this.showSpinner = true;
        var currentText = event.currentTarget.dataset.id;
        this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.customHeight = 'slds-form-element';
        this.iconFlag = false;
        this.clearIconFlag = true;
        this.selectRecordName = event.currentTarget.dataset.name;
        var selectName = event.currentTarget.dataset.name;
        this.selectRecordId = currentText;
        this.inputReadOnly = true;
        const selectedEvent = new CustomEvent('selected', { detail: {selectName}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
        updateOppAccount({
                oppId: this.oppRecordId,
                accountId: event.currentTarget.dataset.id
            })
            .then(() => {
                this.showSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account is updated successfully',
                        variant: 'success'
                    })
                );
            })
            .catch((error) => {
                this.showSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error is stored in backend',
                        variant: 'error'
                    })
                );
            });
        
    }
    
    resetData(event) {
        this.selectRecordName = "";
        this.selectRecordId = "";
        this.inputReadOnly = false;
        this.iconFlag = true;
        this.clearIconFlag = false;
       
    }

}