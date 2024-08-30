/**
@Name                ExpenditureController
@TestClass           ExpenditureControllerTest
@description       : Expenditure Details
@author            : Abhinayani
@Created on  	   : 07-19-2024

Modifications Log
Ver   Date         Author            Modification
1.0   07-19-2024   Abhinayani      Initial Version
**/
public class ExpenditureController 
{
 @AuraEnabled(cacheable=true)
    public static List<educx__Expenditure__c> displayExpenditureRecords() 
    {
        List<educx__Expenditure__c> expDetails = new List<educx__Expenditure__c>();
        try
        {
            expDetails = [SELECT Id,Name,educx__Amount_Spent__c, educx__Date_Spent__c, educx__Expense_type__c
                                FROM educx__Expenditure__c];
        } 
        catch (Exception e)
        {
            System.debug('Error in displayExpenditureRecords method: ' + e.getMessage());
            throw new AuraHandledException('Error fetching Expenditure details: ' + e.getMessage());
        }
        return expDetails;
    }
    
}