public with sharing class OpportuntiyController {
    public OpportuntiyController() {

    }

  
    @AuraEnabled(cacheable=true)
    public static Integer getOpportunitiesCount(){
        
        return [SELECT COUNT() FROM Opportunity];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities(Integer offsetRange){
        if(offsetRange == null){
            return [Select Id, Name, AccountId, Account.Name, StageName, CloseDate,
                                     Amount from Opportunity LIMIT 5];

        }else{
            return [Select Id, Name, AccountId, Account.Name, StageName, CloseDate,
                                     Amount from Opportunity LIMIT 5 OFFSET :offsetRange];
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getSearchedOpportunity(string searchString){
            String searchKey = '%' + searchString + '%';  
            system.debug('==Test=='+searchString);
            String query = 'Select Id, Name, AccountId, Account.Name, StageName, CloseDate,Amount from Opportunity';

            if (searchString != null && searchString != '') {  
            query += ' where Name like \'%' + searchString + '%\' ';  
            }  
            query += ' limit ' + 5;  
            return Database.query(query);
    }

    @AuraEnabled
    public static void updateOpportunityStage(string oppId, string oppStage){
        system.debug('==opportunity id=='+oppId);
        system.debug('==opportunity stage=='+oppStage);
        Opportunity opp = [Select Id, StageName From Opportunity where Id =:oppId limit 1];
        if(opp.StageName != oppStage){
            opp.StageName = oppStage;
            try{
                update opp;
            }
            catch(Exception ex){
                system.debug('==Exception=='+ex.getMessage());
            }
            
        }
        
    }

    @AuraEnabled
    public static void updateOpportunityAccount(string oppId, string accountId){
        system.debug('==opportunity id=='+oppId);
        system.debug('==opportunity accountId=='+accountId);
        Opportunity opp = [Select Id, AccountId From Opportunity where Id =:oppId limit 1];
        try{
                opp.AccountId = accountId;
                update opp;
            }
            catch(Exception ex){
                system.debug('==Exception=='+ex.getMessage());
            }
        
    }

}