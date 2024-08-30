/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 07-23-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class NoticeController {
    @AuraEnabled(cacheable=true)
    public static List<NoticeWrapper> getNoticesWithAttachments() {
        List<NoticeWrapper> noticeList = new List<NoticeWrapper>();
        // Query to get all Notice__c records
        List<Notice__c> notices = [SELECT Id,educx__Type__c ,Name,CreatedDate,educx__Academic_Year__c FROM educx__Notice__c  ORDER BY createddate desc];
        // Collecting Notice IDs
        Set<Id> noticeIds = new Set<Id>();
        for (Notice__c notice : notices) {
            noticeIds.add(notice.Id);
        }
        if(noticeIds.isEmpty()){
            return null;
        }
        else{
        // Query to get all Attachments related to Notice__c records
        Map<Id, List<Attachment>> attachmentsMap = new Map<Id, List<Attachment>>();
        for (Attachment attachment : [SELECT Id, Name, BodyLength, ParentId FROM Attachment WHERE ParentId IN :noticeIds]) {
            if (attachmentsMap.containsKey(attachment.ParentId)) {
                attachmentsMap.get(attachment.ParentId).add(attachment);    
            }
            else{
                attachmentsMap.put(attachment.ParentId, new List<Attachment>());
            }
        }
        // Query to get all ContentDocumentLinks related to Notice__c records
        Map<Id, List<ContentDocumentLink>> filesMap = new Map<Id, List<ContentDocumentLink>>();
        for (ContentDocumentLink fileLink : [SELECT ContentDocumentId, ContentDocument.Title, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId IN :noticeIds]) {
            if (!filesMap.containsKey(fileLink.LinkedEntityId)) {
                filesMap.put(fileLink.LinkedEntityId, new List<ContentDocumentLink>());
            }
            filesMap.get(fileLink.LinkedEntityId).add(fileLink);
        }
             User currentUser = [SELECT Id, Profile.Name FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        
        // Building the wrapper list
        for (Notice__c notice : notices) {
            List<Attachment> noticeAttachments = attachmentsMap.get(notice.Id);
            List<ContentDocumentLink> noticeFiles = filesMap.get(notice.Id);
            noticeList.add(new NoticeWrapper(notice, noticeAttachments, noticeFiles,currentUser.Profile.Name));
        }
        
        return noticeList;
    }
    }
    public class NoticeWrapper {
        @AuraEnabled
        public Notice__c notice { get; set; }
        @AuraEnabled
        public String currentUserProfile { get; set; }
        @AuraEnabled
        public List<Attachment> attachments { get; set; }
        @AuraEnabled
        public List<ContentDocumentLink> files { get; set; }
        
        public NoticeWrapper(Notice__c notice, List<Attachment> attachments, List<ContentDocumentLink> files ,string currentUserProfile) {
            this.notice = notice;
            this.attachments = attachments != null ? attachments : new List<Attachment>();
            this.files = files != null ? files : new List<ContentDocumentLink>();
            this.currentUserProfile=currentUserProfile;
        }
    }
    @AuraEnabled
    public static string deleteDocument(String documentId) {
        try {
            ContentDocument doc = [SELECT Id, Title FROM ContentDocument WHERE Id = :documentId LIMIT 1];
            delete doc;
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting ContentDocument: ' + e.getMessage());
        }
    }
}