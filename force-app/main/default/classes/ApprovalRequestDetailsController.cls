/**
* @description       : 
* @author            : ChangeMeIn@UserSettingsUnder.SFDoc
* @group             : 
* @last modified on  : 08-06-2024
* @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class ApprovalRequestDetailsController {
    @AuraEnabled(cacheable=false)
    public static void approveRecords(List<Id> recordIds) {
        if (recordIds.isEmpty()) {
            return;
        }
        List<educx__Approve_Request__c> requestsToUpdate = [SELECT Id, educx__Status__c 
                                                            FROM educx__Approve_Request__c 
                                                            WHERE Id IN :recordIds 
                                                            AND educx__Status__c != 'Ready'];
        for (educx__Approve_Request__c request : requestsToUpdate) {
            request.educx__Status__c = 'Ready';
        }
        
        if (!requestsToUpdate.isEmpty()) {
            update requestsToUpdate;
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static void rejectRecords(List<Id> recordIds) {
        if (recordIds.isEmpty()) {
            return;
        }
        List<educx__Approve_Request__c> requestsToUpdate = [SELECT Id, educx__Status__c 
                                                            FROM educx__Approve_Request__c 
                                                            WHERE Id IN :recordIds 
                                                            AND educx__Status__c != 'Rejected'];
        for (educx__Approve_Request__c request : requestsToUpdate) {
            request.educx__Status__c = 'Rejected';
        }
        
        if (!requestsToUpdate.isEmpty()) {
            update requestsToUpdate;
        }
    }
    
    @AuraEnabled
    public static void updateApprovalStatus(String recId) {
        List<educx__Approve_Request__c> updatelist=new List<educx__Approve_Request__c>();
        educx__Approve_Request__c recordToUpdate  = [SELECT Id, educx__Status__c 
                                                     FROM educx__Approve_Request__c WHERE Id = :recId LIMIT 1];
        recordToUpdate .educx__Status__c = 'Ready';
        updatelist.add(recordToUpdate);
        List<database.saveResult> res=database.update(updatelist,false);
    } 
    @AuraEnabled
    public static void updateRejectStatus(String recId) {
        educx__Approve_Request__c recordToUpdate  = [SELECT Id, educx__Status__c 
                                                     FROM educx__Approve_Request__c WHERE Id = :recId LIMIT 1];
        recordToUpdate .educx__Status__c = 'Rejected';
        update recordToUpdate;
    } 
    @AuraEnabled(cacheable=true)
    public static List<educx__Approve_Request__c> getRecordsByTab(String tabValue) {
        List<educx__Approve_Request__c> records = new List<educx__Approve_Request__c>();
        system.debug('tab selected'+tabValue);
        if (tabValue.equals('All')) {
            records = [select id,Name,educx__Student_ID__r.Name,educx__Student_ID__r.educx__Hall_Ticket_No__c,
                       educx__Student_ID__r.educx__Name_of_The_Father__c,educx__Student_ID__r.educx__Course__c,educx__Student_ID__r.educx__Current_Academic_Year__c,
                       educx__Student_ID__r.educx__Date_of_Birth__c,educx__Student_ID__r.educx__Name_of_The_Candidate__c,educx__Document_Type__c,CreatedDate,educx__Status__c,
                       educx__Student_ID__r.educx__Course_Code__r.educx__Medium__c, educx__Student_ID__r.educx__Religion__c,
                       educx__Student_ID__r.educx__Identification_Mark_2__c, educx__Student_ID__r.educx__Identification_Mark_1__c,
                       educx__Student_ID__r.educx__Nationality__c,educx__Student_ID__r.educx__Caste__c, 
                       educx__Student_ID__r.educx__Joining_Date__c,educx__Student_ID__r.educx__Course_Name__c,educx__Student_ID__r.educx__Email__c,
                       educx__Student_ID__c,(Select ContentDocumentID from ContentDocumentLinks)
                       from educx__Approve_Request__c 
                       WHERE educx__Document_Type__c !=null AND educx__Student_ID__r.Name!=null
                       ORDER BY CreatedDate DESC
                      ];
        } 
        else {
            records = [select id,Name,educx__Student_ID__r.Name,educx__Student_ID__c, educx__Student_ID__r.educx__Hall_Ticket_No__c,
                       educx__Student_ID__r.educx__Name_of_The_Father__c,educx__Student_ID__r.educx__Course__c,educx__Student_ID__r.educx__Current_Academic_Year__c,
                       educx__Student_ID__r.educx__Date_of_Birth__c,educx__Student_ID__r.educx__Name_of_The_Candidate__c,educx__Document_Type__c,CreatedDate,educx__Status__c,
                       educx__Student_ID__r.educx__Course_Code__r.educx__Medium__c, educx__Student_ID__r.educx__Religion__c,
                       educx__Student_ID__r.educx__Identification_Mark_2__c, educx__Student_ID__r.educx__Identification_Mark_1__c,
                       educx__Student_ID__r.educx__Nationality__c,educx__Student_ID__r.educx__Caste__c, 
                       educx__Student_ID__r.educx__Joining_Date__c,educx__Student_ID__r.educx__Course_Name__c,educx__Student_ID__r.educx__Email__c,
                       (Select ContentDocumentID from ContentDocumentLinks)
                       from educx__Approve_Request__c 
                       where educx__Document_Type__c=:tabValue AND educx__Student_ID__r.Name!=null 
                       ORDER BY CreatedDate DESC
                      ];
        }
        return records;
    }
    
    @AuraEnabled(cacheable=true)
    public static ID noDueAttachment(Id studentApproveId){
        ContentDocumentLink attachmentId = [Select ContentDocumentId, LinkedEntityId,ContentDocument.Title 
                                            from ContentDocumentLink 
                                            WHERE LinkedEntityId =:studentApproveId limit 1];
        System.debug('document'+ attachmentId.ContentDocumentId);
        return attachmentId.ContentDocumentId;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<educx__Approve_Request__c> getRecordsByStudent(String hallTicketNo) {
        return [select id,Name,educx__Student_ID__r.Name,educx__Student_ID__r.educx__Hall_Ticket_No__c,
                educx__Student_ID__r.educx__Course__c,educx__Student_ID__r.educx__Name_of_The_Candidate__c,
                
                educx__Document_Type__c,CreatedDate,educx__Status__c,
                (Select ContentDocumentID from ContentDocumentLinks)
                from educx__Approve_Request__c 
                WHERE educx__Document_Type__c !=null AND educx__Student_ID__r.Name!=null AND educx__Student_ID__r.educx__Hall_Ticket_No__c=:hallTicketNo
                ORDER BY CreatedDate DESC
               ];
        
    }
    
    /* @AuraEnabled(cacheable=false)
public static String getCertificateDownloadUrl(Id recordId, String hallTicketNo, String docType) {
String doc;
String titlePattern;
if(docType == 'Transfer Certificate(TC)') {
doc = 'Transfer_Certificate';
} else if(docType == 'Bonafide Certificate'){
doc = 'Bonafide';
} else if(docType == 'SSC Certificate'){
doc = 'SSC_Memo_';
} else if(docType == 'Inter Certificate'){
doc = 'Intermediate_Memo_';
} else {
return null;
}

System.debug('recordId: ' + recordId);
System.debug('doc: ' + doc);
List<ContentDocumentLink> contentDocLinks = [
SELECT ContentDocumentId, ContentDocument.CreatedDate, ContentDocument.FileExtension
FROM ContentDocumentLink 
WHERE LinkedEntityId = :recordId
];
System.debug('contentDocLinks: ' + contentDocLinks);
if (!contentDocLinks.isEmpty()) {
String formattedDate = contentDocLinks[0].ContentDocument.CreatedDate.format('yyyy-MM-dd');
System.debug('formattedDate: ' + formattedDate);
if(docType == 'Transfer Certificate(TC)' || docType == 'Bonafide Certificate'){
titlePattern = '%' + hallTicketNo + '_' + doc + '_' + formattedDate + '%';
System.debug('titlePattern: ' + titlePattern);
}
else{
titlePattern = '%'+doc+'%';
System.debug('titlePattern2: ' + titlePattern);
}
List<ContentVersion> contentVersions = [
SELECT Id, Title, VersionData, ContentDocumentId
FROM ContentVersion 
WHERE ContentDocumentId = :contentDocLinks[0].ContentDocumentId 
AND Title LIKE:titlePattern
LIMIT 1
];
System.debug('contentVersions: ' + contentVersions);
if (!contentVersions.isEmpty()) {
String downloadUrl = '/sfc/servlet.shepherd/document/download/' + contentVersions[0].ContentDocumentId;
System.debug('downloadUrl: ' + downloadUrl);
return downloadUrl;
}
}

return null;
}*/
    @AuraEnabled(cacheable=false)
    public static String getCertificateDownloadUrl(Id recordId, String hallTicketNo, String docType) {
        String doc;
        String titlePattern;    
        List<id> docIds =new List<id>();
        switch on docType {
            when 'Transfer Certificate(TC)' {
                doc = 'Transfer_Certificate';
            }
            when 'Bonafide Certificate' {
                doc = 'Bonafide';
            }
            when 'SSC Certificate' {
                doc = 'SSC_Memo_';
            }
            when 'Inter Certificate' {
                doc = 'Intermediate_Memo_';
            }
            when else {
                return null;
            }
        }
        List<ContentDocumentLink> contentDocLink = [
            SELECT ContentDocumentId, ContentDocument.CreatedDate
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :recordId
        ];
        for(ContentDocumentLink con: contentDocLink){
            docIds.add(con.ContentDocumentId);
            if (con != null) {
                String formattedDate = con.ContentDocument.CreatedDate.format('yyyy-MM-dd');
                              if(docType == 'Transfer Certificate(TC)' || docType == 'Bonafide Certificate'){
                                  titlePattern = '%' + hallTicketNo + '_' + doc + '_' + formattedDate + '%';
                              } else {
                                  titlePattern = '%' + doc + '%';
                              }
                             }
        }
        ContentVersion contentVersion = [
            SELECT Id, Title, VersionData, ContentDocumentId
            FROM ContentVersion 
            WHERE ContentDocumentId IN :docIds
            AND Title LIKE :titlePattern
        ];
        if (contentVersion != null) {
            String downloadUrl = '/sfc/servlet.shepherd/document/download/' + contentVersion.ContentDocumentId;
            return downloadUrl;
        }
        return null;
    }
}