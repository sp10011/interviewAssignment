import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import DatatablePicklistResource from '@salesforce/resourceUrl/DatatablePicklist';
import updateOppStage from '@salesforce/apex/OpportuntiyController.updateOpportunityStage';

export default class PocCustomComp extends LightningElement {
    @api selectedStage;
    @api acceptedFormats;
    @api recordId;
    @track value;
    @track showSpinner=false;

    renderedCallback() {
        Promise.all([
            loadStyle(this, DatatablePicklistResource),
        ]).then(() => { })
    }

    handleChange(event){

        this.showSpinner = true;
        updateOppStage({
                oppId: this.recordId,
                oppStage: event.detail.value
            })
            .then(() => {
                this.showSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Stage is updated successfully',
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

    

    get options() {
        return [
            { label: 'Prospecting', value: 'Prospecting' },
            { label: 'Qualification', value: 'Qualification' },
            { label: 'Needs Analysis', value: 'Needs Analysis' },
            { label: 'Value Proposition', value: 'Value Proposition' },
            { label: 'Id. Decision Makers', value: 'Id. Decision Makers' },
            { label: 'Perception Analysis', value: 'Perception Analysis' },
            { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
            { label: 'Negotiation/Review', value: 'Negotiation/Review' },
            { label: 'Closed Won', value: 'Closed Won' },
            { label: 'Closed Lost', value: 'Closed Lost' },
        ];
    }
}