public inherited sharing class GenericController {

    @AuraEnabled
    public static void attachFilesToRecord(Id recordId, List<Id> contentDocumentIds) {
        List<ContentDocumentLink> linksToInsert = new List<ContentDocumentLink>();
        for (Id contentDocumentId : contentDocumentIds) {
            ContentDocumentLink link = new ContentDocumentLink();
            link.LinkedEntityId = recordId;
            link.ContentDocumentId = contentDocumentId;
            link.ShareType = 'V';
            linksToInsert.add(link);
        }
        if (!linksToInsert.isEmpty()) {
            insert linksToInsert;
        }
    }


    @AuraEnabled  
    public static Id saveContact(Contact contactRec, List<FileWrapper> files) {  
        Id contactId;  
        try {  
            insert contactRec;  
            contactId = contactRec.Id;  

            List<ContentVersion> contentVersions = new List<ContentVersion>();
            for (FileWrapper file : files) {
                ContentVersion contentVersionRec = new ContentVersion();
                contentVersionRec.Title = file.fileName;
                contentVersionRec.PathOnClient = '/' + file.fileName;
                contentVersionRec.FirstPublishLocationId = contactRec.Id;
                contentVersionRec.VersionData = file.fileContent;
                contentVersionRec.IsMajorVersion = true;
                contentVersions.add(contentVersionRec);
            }
            insert contentVersions;  
        } catch(Exception ex) {  
            System.debug('Exception===>' + ex.getMessage());  
        }  
        return contactId;  
    } 

    public class FileWrapper {
        @AuraEnabled
        public String fileName { get; set; }
        @AuraEnabled
        public Blob fileContent { get; set; }
    }
    
    
    
     @AuraEnabled
    public static void deleteContentDocument(String documentId) {
        delete new ContentDocument(Id = documentId);
    }
    @AuraEnabled(cacheable=false)
    public static Id createContact(String firstName, String lastName) {
        Contact newContact = new Contact(
            FirstName = firstName,
            LastName = lastName
        );
        insert newContact;
        return newContact.Id;
    }
    @AuraEnabled(cacheable=false)
    public static void uploadFiles(Id contactId, List<ContentVersion> files) {
        List<Attachment> attachments = new List<Attachment>();
        for (ContentVersion file : files) {
            attachments.add(new Attachment(
                ParentId = contactId,
                Name = file.Title,
                Body = file.VersionData
            ));
        }
        insert attachments;
    }
    @AuraEnabled(cacheable=false)
    public static Id createAccountWithFiles(String accountName, List<ContentDocument> files) {
        // Create Account record
        Account acc = new Account(Name = accountName);
        insert acc;

        // Associate files with the Account record
        List<ContentDocumentLink> documentLinks = new List<ContentDocumentLink>();
        for (ContentDocument file : files) {
            documentLinks.add(new ContentDocumentLink(
                ContentDocumentId = file.Id,
                LinkedEntityId = acc.Id,
                ShareType = 'V'
            ));
        }
        insert documentLinks;

        return acc.Id;
    }



}