public without sharing class EmployeeLeaveRequestController {

    //To display leave details for employee
    @AuraEnabled(cacheable=true)
    public static educx__Employee_Leave_Account__c getEmployeeLeaveAccount(Id employeeId) {
        return [SELECT Id, educx__Employee__c, educx__Number_of_Availed_Leaves__c, 
                educx__Number_of_Balance_Leaves__c, educx__Total_Leaves_In_Account__c, educx__Loss_of_Pay__c
                FROM educx__Employee_Leave_Account__c 
                WHERE educx__Employee__c = :employeeId LIMIT 1];
    }
    

    //Approval Records
    @AuraEnabled(cacheable=false)
    public static void approveRecords(List<Id> recordIds) {
        if (recordIds.isEmpty()) {
            return;
        }
        List<educx__Employee_Leave_Details__c> requestsToUpdate = [SELECT Id, educx__Leave_Status__c 
                                                                   FROM educx__Employee_Leave_Details__c 
                                                                   WHERE Id IN :recordIds 
                                                                   AND educx__Leave_Status__c != 'Approved'];
        for (educx__Employee_Leave_Details__c request : requestsToUpdate) {
            request.educx__Leave_Status__c = 'Approved';
        }
        if (!requestsToUpdate.isEmpty()) {
            update requestsToUpdate;
        }
    }
    
    
    //Rejected Records
    @AuraEnabled(cacheable=false)
    public static void rejectRecords(List<Id> recordIds) {
        if (recordIds.isEmpty()) {
            return;
        }
        List<educx__Employee_Leave_Details__c> requestsToUpdate = [SELECT Id, educx__Leave_Status__c 
                                                                   FROM educx__Employee_Leave_Details__c 
                                                                   WHERE Id IN :recordIds 
                                                                   AND educx__Leave_Status__c != 'Rejected'];
        for (educx__Employee_Leave_Details__c request : requestsToUpdate) {
            request.educx__Leave_Status__c = 'Rejected';
        }
        if (!requestsToUpdate.isEmpty()) {
            update requestsToUpdate;
        }
    }
    
    
    //Display All leave details records in Data table
    @AuraEnabled(cacheable=true)
    public static List<Employee_Leave_Details__c> getEmployeeLeaveDetails() {
        try {
            return [
                SELECT Id,
                educx__Employee__r.Name,educx__Employee__r.Employee_Name__c,educx__From_Date__c,educx__To_Date__c,
                educx__Reason__c,educx__Applied_Date__c,educx__Leave_Status__c
                FROM Employee_Leave_Details__c
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Unable to fetch leave details: ' + e.getMessage());
        }
    }

   
    //Search Employee With ID or Name
    @AuraEnabled(cacheable=true)
    public static List<educx__Employees__c> getEmpDetailsOnSearch(String searchTerm) {
        List<educx__Employees__c> results = new List<educx__Employees__c>();
        
        if (searchTerm != null && searchTerm.trim() != '') {
            results = [SELECT Id, Name, educx__Employee_Name__c, educx__Email__c, educx__Phone__c, educx__Designation__c, educx__Photo__c
                       FROM educx__Employees__c
                       WHERE Name = :searchTerm
                       LIMIT 1];
            
            if (results.isEmpty()) {
                String searchPattern = '%' + searchTerm + '%';
                results = [SELECT Id, Name, educx__Employee_Name__c, educx__Email__c, educx__Phone__c, educx__Designation__c, educx__Photo__c
                           FROM educx__Employees__c
                           WHERE educx__Employee_Name__c LIKE :searchPattern
                           LIMIT 10];  
            }
        }
        
        return results;
    }


       
}