public with sharing class OrganizationController {
    @AuraEnabled(cacheable=true)
    public static List<OrganizationWrapper> getOrganizationsWithAttachments() {
        List<OrganizationWrapper> organizationList = new List<OrganizationWrapper>();
        // Query to get all educx__Organization__c records
        List<educx__Organization__c> organizations = [SELECT Id, Name,CreatedDate FROM educx__Organization__c ORDER BY CreatedDate DESC];
        // Collecting Organization IDs
        Set<Id> organizationIds = new Set<Id>();
        for (educx__Organization__c organization : organizations) {
            organizationIds.add(organization.Id);
        }
        if (organizationIds.isEmpty()) {
            return null;
        } else {
            // Query to get all Attachments related to educx__Organization__c records
            Map<Id, List<Attachment>> attachmentsMap = new Map<Id, List<Attachment>>();
            for (Attachment attachment : [SELECT Id, Name, BodyLength, ParentId FROM Attachment WHERE ParentId IN :organizationIds]) {
                if (attachmentsMap.containsKey(attachment.ParentId)) {
                    attachmentsMap.get(attachment.ParentId).add(attachment);
                } else {
                    attachmentsMap.put(attachment.ParentId, new List<Attachment>());
                }
            }
            // Query to get all ContentDocumentLinks related to educx__Organization__c records
            Map<Id, List<ContentDocumentLink>> filesMap = new Map<Id, List<ContentDocumentLink>>();
            for (ContentDocumentLink fileLink : [SELECT ContentDocumentId, ContentDocument.Title, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId IN :organizationIds]) {
                if (!filesMap.containsKey(fileLink.LinkedEntityId)) {
                    filesMap.put(fileLink.LinkedEntityId, new List<ContentDocumentLink>());
                }
                filesMap.get(fileLink.LinkedEntityId).add(fileLink);
            }
            User currentUser = [SELECT Id, Profile.Name FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

            // Building the wrapper list
            for (educx__Organization__c organization : organizations) {
                List<Attachment> organizationAttachments = attachmentsMap.get(organization.Id);
                List<ContentDocumentLink> organizationFiles = filesMap.get(organization.Id);
                organizationList.add(new OrganizationWrapper(organization, organizationAttachments, organizationFiles, currentUser.Profile.Name));
            }

            return organizationList;
        }
    }

    public class OrganizationWrapper {
        @AuraEnabled
        public educx__Organization__c organization { get; set; }
        @AuraEnabled
        public String currentUserProfile { get; set; }
        @AuraEnabled
        public List<Attachment> attachments { get; set; }
        @AuraEnabled
        public List<ContentDocumentLink> files { get; set; }

        public OrganizationWrapper(educx__Organization__c organization, List<Attachment> attachments, List<ContentDocumentLink> files, String currentUserProfile) {
            this.organization = organization;
            this.attachments = attachments != null ? attachments : new List<Attachment>();
            this.files = files != null ? files : new List<ContentDocumentLink>();
            this.currentUserProfile = currentUserProfile;
        }
    }

    @AuraEnabled
    public static String deleteDocument(String documentId) {
        try {
            ContentDocument doc = [SELECT Id, Title FROM ContentDocument WHERE Id = :documentId LIMIT 1];
            delete doc;
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting ContentDocument: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void deleteContentDocument(String documentId) {
        delete new ContentDocument(Id = documentId);
    }
}