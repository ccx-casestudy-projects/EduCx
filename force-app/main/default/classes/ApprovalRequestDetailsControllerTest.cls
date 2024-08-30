@IsTest
public class ApprovalRequestDetailsControllerTest {
    @TestSetup
    static void setup() {
        educx__Course__c course1 = new educx__Course__c(
        	Name = '129',
            educx__Course__c = 'B.A.',
            educx__Course_Duration__c = '3 Years',
            educx__Course_Level__c = 'UG',
            educx__Course_Name__c = 'Economics/Pol.Science/History',
            educx__Medium__c = 'English'
        );
        insert course1;
        
        educx__Student__c student1 = new educx__Student__c(
            educx__Name_of_The_Candidate__c = 'Test Student 1',
            educx__ICET_Hall_Ticket_No__c = '1234',
            educx__ICET_Rank__c = '1234',
            educx__Course_Code__c = course1.Id,
            educx__Course__c =course1.educx__Course__c,
            educx__Course_Name__c = course1.educx__Course_Name__c,
            educx__Year__c = '3rd Year',
            educx__Semester__c = 'II',
            educx__Joining_Date__c = Date.newInstance(2024, 07, 2),
            educx__Aadhar_Number__c ='1234 1234 1234',
            educx__Identification_Mark_1__c = 'hi',
            educx__Identification_Mark_2__c = 'bye',
            educx__Email__c = 'xyz@gmail.com',
            educx__Phone_Number__c = '9999999999',
            educx__Father_Phone__c = '9999999999',
            educx__Parent_Income__c = 4000000.00,
            educx__Date_of_Birth__c = Date.newInstance(1998, 07, 2),
            educx__SSC_Registration_No__c = '12341342',
            educx__SSC_Year_of_Passing__c = '2014',
            educx__Hall_Ticket_No__c = '1121444',
            educx__SSC_Memo__c = true,
			educx__Intermediate_Memo__c = true            
        );
        insert student1;
        
        educx__Approve_Request__c approveRequests = new educx__Approve_Request__c (
        	educx__Document_Type__c = 'Transfer Certificate(TC)',
            educx__Student_ID__c = student1.id,
            educx__Reason__c = 'Graduated',
            educx__Status__c = 'Pending'
        );
        insert approveRequests;
    }

    @IsTest
    static void testApproveRecords() {
        List<Id> recordIds = new List<Id>();
        for(educx__Approve_Request__c recIds:[SELECT Id FROM educx__Approve_Request__c WHERE educx__Status__c = 'Pending'])
        {
            recordIds.add(recIds.id);
        }
        Test.startTest();
        ApprovalRequestDetailsController.approveRecords(recordIds);
        Test.stopTest();

        List<educx__Approve_Request__c> updatedRequests = [SELECT educx__Status__c FROM educx__Approve_Request__c WHERE Id IN :recordIds];
        for (educx__Approve_Request__c req : updatedRequests) {
            System.assertEquals('Ready', req.educx__Status__c, 'Status should be updated to Ready');
        }
    }

    @IsTest
    static void testRejectRecords() {
        List<Id> recordIds = new List<Id>();
        for(educx__Approve_Request__c recIds:[SELECT Id FROM educx__Approve_Request__c WHERE educx__Status__c != 'Rejected'])
        {
            recordIds.add(recIds.id);
        }
        Test.startTest();
        ApprovalRequestDetailsController.rejectRecords(recordIds);
        Test.stopTest();

        List<educx__Approve_Request__c> updatedRequests = [SELECT educx__Status__c FROM educx__Approve_Request__c WHERE Id IN :recordIds];
        for (educx__Approve_Request__c req : updatedRequests) {
            System.assertEquals('Rejected', req.educx__Status__c, 'Status should be updated to Rejected');
        }
    }

    @IsTest
    static void testUpdateApprovalStatus() {
        educx__Approve_Request__c request = [SELECT Id FROM educx__Approve_Request__c WHERE educx__Status__c = 'Pending' LIMIT 1];

        Test.startTest();
        ApprovalRequestDetailsController.updateApprovalStatus(request.Id);
        Test.stopTest();

        educx__Approve_Request__c updatedRequest = [SELECT educx__Status__c FROM educx__Approve_Request__c WHERE Id = :request.Id];
        System.assertEquals('Ready', updatedRequest.educx__Status__c, 'Status should be updated to Ready');
    }

    @IsTest
    static void testUpdateRejectStatus() {
        educx__Approve_Request__c request = [SELECT Id FROM educx__Approve_Request__c WHERE educx__Status__c != 'Rejected' LIMIT 1];

        Test.startTest();
        ApprovalRequestDetailsController.updateRejectStatus(request.Id);
        Test.stopTest();

        educx__Approve_Request__c updatedRequest = [SELECT educx__Status__c FROM educx__Approve_Request__c WHERE Id = :request.Id];
        System.assertEquals('Rejected', updatedRequest.educx__Status__c, 'Status should be updated to Rejected');
    }

    @IsTest
    static void testGetRecordsByTab() {
        Test.startTest();
        List<educx__Approve_Request__c> allRecords = ApprovalRequestDetailsController.getRecordsByTab('All');
        List<educx__Approve_Request__c> filteredRecords = ApprovalRequestDetailsController.getRecordsByTab('Transfer Certificate(TC)');
        Test.stopTest();

        System.assertNotEquals(0, allRecords.size(), 'Should return records when "All" tab is selected');
        System.assertNotEquals(0, filteredRecords.size(), 'Should return records for the specified document type');
    }

    @IsTest
    static void testNoDueAttachment() {
        educx__Approve_Request__c request = [SELECT Id FROM educx__Approve_Request__c LIMIT 1];

        ContentDocumentLink cdl1 = new ContentDocumentLink(
            LinkedEntityId = request.Id,
            ContentDocumentId = '069al000005OF1TAAW'
        );
        insert cdl1;

        Test.startTest();
        Id docId = ApprovalRequestDetailsController.noDueAttachment(request.Id);
        Test.stopTest();

        System.assertNotEquals(null, docId, 'Should return a ContentDocumentId');
    }

    @IsTest
    static void testGetRecordsByStudent() {
        educx__Approve_Request__c request = [SELECT educx__Student_ID__r.educx__Hall_Ticket_No__c FROM educx__Approve_Request__c LIMIT 1];

        Test.startTest();
        List<educx__Approve_Request__c> records = ApprovalRequestDetailsController.getRecordsByStudent(request.educx__Student_ID__r.educx__Hall_Ticket_No__c);
        Test.stopTest();

        System.assertNotEquals(0, records.size(), 'Should return records for the specified student');
    }

    @IsTest
    static void testGetCertificateDownloadUrl() {
        educx__Student__c request = [SELECT id,educx__Hall_Ticket_No__c FROM educx__Student__c LIMIT 1];
		        
        ContentDocumentLink cdl = new ContentDocumentLink(
            LinkedEntityId = request.Id,
            ContentDocumentId = '069al000005OF1TAAW'
        );
        insert cdl;
	
        ContentVersion existingCv = [SELECT VersionData FROM ContentVersion WHERE Id = '068al000005IT8lAAG'];
        
        ContentVersion newCv = new ContentVersion(
            Title = request.educx__Hall_Ticket_No__c + '_Transfer_Certificate_' + Date.newInstance(2024, 8, 14),
            ContentDocumentId = cdl.ContentDocumentId,
            PathOnClient = '1121444_Transfer_Certificate_2024-08-14.pdf',
            VersionData = existingCv.VersionData
        );
        
        insert newCv;

        Test.startTest();
        String downloadUrl = ApprovalRequestDetailsController.getCertificateDownloadUrl(request.Id, request.educx__Hall_Ticket_No__c, 'Transfer Certificate(TC)');
        Test.stopTest();

        System.assertNotEquals(null, downloadUrl, 'Should return a download URL');
    }
}