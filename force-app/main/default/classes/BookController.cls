public without sharing class BookController {
   /* @AuraEnabled(cacheable=true)
    public static List<Book__c> getAllBooks(String searchKey) {
           List<Book__c> booksDetails = new List<Book__c>();
     try {
        if (String.isNotBlank(searchKey)) {
            String key = '%' + searchKey + '%';
        booksDetails = [SELECT Name, educx__Author__c, educx__Date_of_purchase__c, educx__Edition__c, educx__Price__c, 
                                 educx__Status__c, educx__Title_of_the_book__c,educx__Number_of_Copies__c
                          FROM Book__c   WHERE Name LIKE :key OR educx__Title_of_the_book__c LIKE :key 
                        OR educx__Status__c LIKE:key OR educx__Author__c LIKE:key 
                            ORDER BY Name DESC 

                          ];}
                          else {
                            booksDetails = [SELECT Name, educx__Author__c, educx__Date_of_purchase__c, educx__Edition__c, educx__Price__c, 
                            educx__Status__c, educx__Title_of_the_book__c,educx__Number_of_Copies__c
                     FROM Book__c ORDER BY Name DESC];
                          }
    } catch (Exception e) {
        System.debug('Error in getDetails method: ' + e.getMessage());
        
    }

    return booksDetails;
    }*/


     @AuraEnabled(cacheable=true)
    public static List<Book__c> getAllBooks() {
     return [SELECT Name, educx__Author__c, educx__Date_of_purchase__c, educx__Edition__c, educx__Price__c, 
                                 educx__Status__c, educx__Title_of_the_book__c,educx__Number_of_Copies__c
                          FROM Book__c   
                            ORDER BY Name DESC];

    }

    

    @AuraEnabled(cacheable=true)
public static educx__Student__c searchStudentsByHallticketNumber(String hallticket) {
    try {
        if (hallticket != null) {
            return [
                SELECT Id, Name, educx__Name_of_The_Candidate__c, educx__Hall_Ticket_No__c 
                FROM educx__Student__c 
                WHERE educx__Hall_Ticket_No__c = :hallticket 
                LIMIT 1
            ];
        }
    } catch (Exception e) {
        System.debug('An error occurred while searching: ' + e.getMessage());
    }
    return null;
}

@AuraEnabled(cacheable=true)
public static educx__Employees__c searchEmployeeById(String empId) {
    try {
        if (empId != null) {
            return [
                SELECT Id, Name, educx__Employee_Name__c
                FROM educx__Employees__c 
                WHERE Name = :empId 
                LIMIT 1
            ];
        }
    } catch (Exception e) {
        System.debug('An error occurred while searching: ' + e.getMessage());
    }
    return null;
}

    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getStudentFiles(Id studentId) {
        return [
            SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.FileType, ContentDocument.ContentSize
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :studentId
        ];
    } 
    
}