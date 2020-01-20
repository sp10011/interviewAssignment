import LightningDatatable from 'lightning/datatable';
import opportunityStage from './oppStage.html';
import lookTemp from './lookupTemplate.html';
 
 
export default class PocLightningDatatable extends LightningDatatable {
    static customTypes = {
        opStage: {
            template: opportunityStage,
            typeAttributes: ['recordId']
        },
        lubox: {
            template: lookTemp,
            typeAttributes: ['recordId']
        }
            
    };

   
}