@isTest
public class NoticeControllerTest {
    @testSetup
    static void setup() {
        // Create test data for Notice__c
        List<Notice__c> notices = new List<Notice__c>();
        for (Integer i = 0; i < 5; i++) {
            Notice__c notice = new Notice__c(
                Name = 'Test Notice ' + i,
                educx__Type__c = 'Alumni',
                educx__Academic_Year__c = '2023-24'
            );
            notices.add(notice);
        }
        insert notices;

        // Create test data for Attachments
        List<Attachment> attachments = new List<Attachment>();
        for (Notice__c notice : notices) {
            Attachment attachment = new Attachment(
                Name = 'Test Attachment ' + notice.Name,
                Body = Blob.valueOf('Test Body'),
                ParentId = notice.Id
            );
            attachments.add(attachment);
        }
        insert attachments;

        // Create test data for ContentVersion (which creates ContentDocument)
        List<ContentVersion> contentVersions = new List<ContentVersion>();
        for (Integer i = 0; i < 5; i++) {
            ContentVersion version = new ContentVersion(
                Title = 'Test Document ' + i,
                PathOnClient = 'TestDocument' + i + '.txt',
                VersionData = Blob.valueOf('Test Content')
            );
            contentVersions.add(version);
        }
        insert contentVersions;

        // Query the ContentDocumentLinks created by the ContentVersions
        List<ContentDocumentLink> contentDocLinks = new List<ContentDocumentLink>();
        for (ContentVersion version : [SELECT Id, ContentDocumentId, Title FROM ContentVersion WHERE Id IN :contentVersions]) {
            ContentDocumentLink link = new ContentDocumentLink(
                ContentDocumentId = version.ContentDocumentId,
                LinkedEntityId = notices[Math.mod(Integer.valueOf(version.Title.right(1)), notices.size())].Id
            );
            contentDocLinks.add(link);
        }
        insert contentDocLinks;
    }

    @isTest
    static void testGetNoticesWithAttachments() {
        Test.startTest();
        List<NoticeController.NoticeWrapper> result = NoticeController.getNoticesWithAttachments();
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals(5, result.size());
        for (NoticeController.NoticeWrapper wrapper : result) {
            System.assertNotEquals(null, wrapper.notice);
            System.assertNotEquals(null, wrapper.attachments);
            System.assertNotEquals(null, wrapper.files);
            System.assertNotEquals(null, wrapper.currentUserProfile);
        }
    }

   @isTest
static void testDeleteDocument() {
    // Create a test ContentVersion (which creates ContentDocument)
    ContentVersion version = new ContentVersion(
        Title = 'Test Document to Delete',
        PathOnClient = 'TestDocumentToDelete.txt',
        VersionData = Blob.valueOf('Test Content')
    );
    insert version;

    // Re-query the ContentVersion to get the ContentDocumentId
    version = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :version.Id LIMIT 1];
    
    // Check if ContentDocument exists by querying with ContentDocumentId
    ContentDocument doc;
    try {
        doc = [SELECT Id FROM ContentDocument WHERE Id = :version.ContentDocumentId LIMIT 1];
    } catch (Exception e) {
        System.assert(false, 'ContentDocument not found: ' + e.getMessage());
        return;
    }

    Test.startTest();
    String result = NoticeController.deleteDocument(doc.Id);
    Test.stopTest();

    System.assertEquals('success', result);

    // Verify the document is deleted
    List<ContentDocument> deletedDocs = [SELECT Id FROM ContentDocument WHERE Id = :doc.Id];
    System.assertEquals(0, deletedDocs.size());
}

}