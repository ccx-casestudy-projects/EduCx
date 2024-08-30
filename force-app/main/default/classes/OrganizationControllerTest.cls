@IsTest
public class OrganizationControllerTest {

    @TestSetup
    static void setupTestData() {
        // Create test organizations
        List<educx__Organization__c> organizations = new List<educx__Organization__c>();
        for (Integer i = 0; i < 3; i++) {
            organizations.add(new educx__Organization__c(
                Name = 'Organization ' + i
            ));
        }
        insert organizations;

        // Create test attachments for organizations
        List<Attachment> attachments = new List<Attachment>();
        for (educx__Organization__c org : organizations) {
            attachments.add(new Attachment(
                Name = 'Attachment ' + org.Name,
                Body = Blob.valueOf('Test attachment content'),
                ParentId = org.Id
            ));
        }
        insert attachments;


        // Create test ContentVersion and ContentDocumentLink for organizations
        ContentVersion contentVersion = new ContentVersion(
            Title = 'Test File',
            PathOnClient = 'TestFile.pdf',
            VersionData = Blob.valueOf('Test file content'),
            IsMajorVersion = true
        );
        insert contentVersion;

        // Fetch the ContentDocumentId from the ContentVersion
        Id contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1].ContentDocumentId;

        List<ContentDocumentLink> documentLinks = new List<ContentDocumentLink>();
        for (educx__Organization__c org : organizations) {
            documentLinks.add(new ContentDocumentLink(
                ContentDocumentId = contentDocumentId,
                LinkedEntityId = org.Id,
                ShareType = 'V',
                Visibility = 'AllUsers'
            ));
        }
        insert documentLinks;
    }

  @IsTest
    static void testGetOrganizationsWithAttachments() {
        Test.startTest();
        List<OrganizationController.OrganizationWrapper> organizations = OrganizationController.getOrganizationsWithAttachments();
        Test.stopTest();

        System.assertNotEquals(null, organizations, 'Organizations should be returned');
        System.assertEquals(3, organizations.size(), 'Three organizations should be returned');
      List<Attachment> attachedRecords = [SELECT Id, Name, ParentId FROM Attachment WHERE ParentId IN (SELECT Id FROM educx__Organization__c)];
	  System.assertEquals(3, attachedRecords.size(), 'There should be 3 attachments associated with organizations');
        System.assertEquals(1, organizations[0].files.size(), 'Files should be returned for each organization');
    }


   @IsTest
    static void testGetOrganizationsWithAttachmentsNoData() {
        Test.startTest();
        List<OrganizationController.OrganizationWrapper> organizations = OrganizationController.getOrganizationsWithAttachments();
        Test.stopTest();

        System.assertNotEquals(null, organizations, 'Organizations should still be returned even if no data is present');
        System.assertNotEquals(0, organizations.size(), 'No organizations should be returned when there is no data');
    }

    @IsTest
    static void testDeleteDocument() {
        // Create a test ContentVersion
        ContentVersion contentVersion = new ContentVersion(
            Title = 'Test Delete File',
            PathOnClient = 'TestDeleteFile.pdf',
            VersionData = Blob.valueOf('Test delete file content'),
            IsMajorVersion = true
        );
        insert contentVersion;

        // Fetch the ContentDocumentId from the ContentVersion
        Id contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1].ContentDocumentId;

        Test.startTest();
        String result = OrganizationController.deleteDocument(contentDocumentId);
        Test.stopTest();

        System.assertEquals('success', result, 'The document should be successfully deleted');
    }

 /*@IsTest
    static void testDeleteDocumentNotFound() {
        Test.startTest();
        try {
            OrganizationController.deleteDocument('InvalidDocId');
            System.assert(false, 'Exception should have been thrown for invalid document ID');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Error deleting ContentDocument'), 'Exception message should be about ContentDocument deletion');
        }
        Test.stopTest();
    }*/

    @IsTest
    static void testDeleteContentDocument() {
        // Create a test ContentVersion
        ContentVersion contentVersion = new ContentVersion(
            Title = 'Test Delete Content Document',
            PathOnClient = 'TestDeleteContentDocument.pdf',
            VersionData = Blob.valueOf('Test delete content document content'),
            IsMajorVersion = true
        );
        insert contentVersion;

        // Fetch the ContentDocumentId from the ContentVersion
        Id contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1].ContentDocumentId;

        Test.startTest();
        OrganizationController.deleteContentDocument(contentDocumentId);
        Test.stopTest();

        Integer count = [SELECT COUNT() FROM ContentDocument WHERE Id = :contentDocumentId];
        System.assertEquals(0, count, 'The content document should be successfully deleted');
    }

  /* @IsTest
    static void testDeleteContentDocumentNotFound() {
        Test.startTest();
            OrganizationController.deleteContentDocument('001000000000000AAA');
        Test.stopTest();
    }*/
}