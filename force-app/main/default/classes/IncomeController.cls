public class IncomeController 
{
@AuraEnabled(cacheable=true)
    public static List<educx__Income__c> displayIncomeRecords() 
    {
        List<educx__Income__c> incDetails = new List<educx__Income__c>();
        try
        {
            incDetails = [SELECT Id,Name,educx__Amount_Received__c,educx__Student_Id__c,educx__Source__c,
                          educx__Date_Received__c,educx__Student_Id__r.educx__Name_of_The_Candidate__c,CreatedDate 
                                FROM educx__Income__c
                         order by CreatedDate desc ];
        } 
        catch (Exception e)
        {
            System.debug('Error in displayIncomeRecords method: ' + e.getMessage());
            throw new AuraHandledException('Error fetching Income details: ' + e.getMessage());
        }
        return incDetails;
    }
    
     @AuraEnabled
    public static educx__Income__c saveIncome(educx__Income__c incomeRecordToInsert) {
        try {
            insert incomeRecordToInsert;
            return incomeRecordToInsert;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving Income: ' + e.getMessage());
        }
    }
    
}