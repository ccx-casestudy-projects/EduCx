public with sharing class CustomLookupController { 
   /*     
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String objectName,List<String> columns,string empId) {
        String query; 
        system.debug('columns ::: '+columns);
        system.debug('columns ::: '+objectName);
        List<SObject> records= new List<SObject>();     
           query = 'SELECT ' + String.join(columns, ',') + ' FROM ' + objectName + '  WITH SECURITY_ENFORCED ORDER BY CreatedDate  DESC';
        SELECT educx__Employee__C,educx__Course__C FROM educx__Faculty_Subjects__c where educx__Employee__r.Name =: empId; 
            query = String.escapeSingleQuotes(query);
            
            records= Database.query(query); 
            system.debug('Searchdtata ::: '+records);
        return records;   
    }*/
    
   @AuraEnabled(cacheable=true)
public static List<SObject> getRecords(String objectName, List<String> columns, String empId) {
    String query;
    System.debug('columns ::: ' + columns);
    System.debug('objectName ::: ' + objectName);

    List<SObject> records = new List<SObject>();     

    // Build the dynamic SOQL query
    query = 'SELECT ' + String.join(columns, ',') +  
            ' FROM ' + objectName + 
            ' WHERE educx__Employee__r.Name =:empId' +
            ' ORDER BY CreatedDate DESC';

    // Escape single quotes in the query
    query = String.escapeSingleQuotes(query);
    
    // Execute the query
    records = Database.query(query); 
    System.debug('SearchData ::: ' + records);
    return records;   
}



    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey , string sObjectApiName) {    
        List < sObject > returnList = new List < sObject > ();

        string sWildCardText = '%' + searchKey + '%';
        string sQuery = 'Select Id,Name From ' + sObjectApiName + ' Where Name Like : sWildCardText order by createdDate DESC LIMIT 10';
        for (sObject obj: database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }   
    
    @AuraEnabled(cacheable=true) 
    public static List<educx__Attendance__c> fetchRecords(){
        List<educx__Attendance__c> attendLst =[Select Id,educx__Attendance_Status__c,educx__Course__c,educx__Date_of_Attendance__c,educx__Employees__c,educx__Semester__c
                 from educx__Attendance__c];
        return attendLst;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<educx__Course__c> fetchCourseLookupData(String searchKey) {
        List<educx__Course__c> courseList = [SELECT Id, Name,educx__Course_Name__c FROM educx__Course__c WHERE Name LIKE :('%' + searchKey + '%') ORDER BY CreatedDate DESC LIMIT 10];
        return courseList;
    }
}