import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOpportunities from '@salesforce/apex/OpportuntiyController.getOpportunities';
import getOpportunitiesCount from '@salesforce/apex/OpportuntiyController.getOpportunitiesCount';
import getSearchedOpportunity from '@salesforce/apex/OpportuntiyController.getSearchedOpportunity';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import ACCOUNTNAME_FIELD from '@salesforce/schema/Opportunity.AccountId';
import CLOSEDDATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import STAGENAME_FIELD from '@salesforce/schema/Opportunity.StageName';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';

const COLS = [
    { label: 'Name', fieldName: 'Name', sortable : true, editable: true },
    { label: 'Account', type: 'lubox', fieldName: 'AccountId', sortable : true, typeAttributes: {recordId:  {fieldName: 'Id'}}},
    { label: 'Stage Name', type: 'opStage', fieldName: 'StageName', sortable : true, typeAttributes: {recordId:  {fieldName: 'Id'}}},
    { label: 'Closed Date', fieldName: 'CloseDate', sortable : true, editable: true, type : 'date' },
    { label: 'Amount', fieldName: 'Amount', sortable : true, editable: true, type: 'currency', typeAttributes: { currencyCode: 'USD'}}
];


export default class customOpportunities extends NavigationMixin(LightningElement) {

    
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @api recordId;
    @track data;
    @track sortBy;
    @track sortDirection;
    @track paginationRange = [];

    @track totalRecords;

    

    constructor() {
        super();
        getOpportunitiesCount().then(count => {
            if (count) {

                //get the total count of records
                this.totalRecords = count;

                getOpportunities().then(data => {
                    let i = 1;

                    this.data = data;
                    
                    //looking at displaying 5 recrods per page
                    const paginationNumbers = Math.ceil(this.totalRecords / 5);

                    //create an array with size equals to paginationNumbers
                    while (
                        this.paginationRange.push(i++) < paginationNumbers
                        // eslint-disable-next-line no-empty
                    ) {}
                });
            }
        });
    }
    

    handleSave(event) {
        const fields = {};
        var draftValuesStr = JSON.stringify(event.detail.draftValues);
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[NAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[ACCOUNTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].AccountId;
        fields[CLOSEDDATE_FIELD.fieldApiName] = event.detail.draftValues[0].CloseDate;
        fields[AMOUNT_FIELD.fieldApiName] = event.detail.draftValues[0].Amount;
        //fields[STAGENAME_FIELD.fieldApiName] = event.detail.draftValues[0].StageName;

        const recordInput = {fields};
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Opportunity updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];
            window.location.reload();
            // Display fresh data in the datatable


            
        }).catch(error => {
           /* this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error,
                    variant: 'error'
                })
            ); */
        });
    }


    handlePaginationClick(event) {
        let offsetNumber = event.target.dataset.targetNumber;

         
        getOpportunities({ offsetRange: 5 * (offsetNumber - 1) })
            .then(data => {
                this.data = data;
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.log(error);
            });
    }

    handleSort(event){
        
        // field name
        this.sortBy = event.detail.fieldName;

        // sort direction
        this.sortDirection = event.detail.sortDirection;

        // calling sortdata function to sort the data based on direction and selected field
        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    
    }

    sortData(fieldname, direction) {
        // serialize the data before calling sort function
        let parseData = JSON.parse(JSON.stringify(this.data));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data 
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });

        // set the sorted data to data table data
        this.data = parseData;

    }

    handleKeyWordChange(event){
        //var searchedValue
        getSearchedOpportunity({ searchString: event.target.value})
        .then(data => {
            this.data = data;
        })
        .catch(error => {
            // eslint-disable-next-line no-console
            console.log(error);
        });
    }

   

    createOpportunity(){
        let temp = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            },
            state : {
                nooverride: '1'
            }
        };
        this[NavigationMixin.Navigate](temp);
    }

}