@isTest
private class approvalRequestRecordCreationTest {
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
    }

    @IsTest
    static void testapprovalRequest() {
        educx__Student__c student = [Select Id,educx__Name_of_The_Candidate__c,educx__Course_Name__c from educx__Student__c where educx__Name_of_The_Candidate__c='Test Student 1'];
        List<String> documentTypes = new List<String>{'Transfer Certificate(TC)', 'Bonafide Certificate'};
        String reason = 'Transfer';
		approvalRequestRecordCreation.approvalRequest(documentTypes, student.Id, student.educx__Course_Name__c, reason, null);

		List<educx__Approve_Request__c> approvalRequests = [
            SELECT educx__Document_Type__c, educx__Student_ID__c, educx__Course_Name__c, 
                   educx__Status__c, educx__Reason__c, educx__Other_Reason__c 
            FROM educx__Approve_Request__c
            WHERE educx__Student_ID__c = :student.Id
        ];
   		System.assertEquals(2, approvalRequests.size(), 'Two approval request records should be created.');
		System.assertEquals('Transfer Certificate(TC)', approvalRequests[0].educx__Document_Type__c);
        System.assertEquals(student.Id, approvalRequests[0].educx__Student_ID__c);
        System.assertEquals('Pending', approvalRequests[0].educx__Status__c);
        System.assertEquals('Transfer', approvalRequests[0].educx__Reason__c);
        
        System.assertEquals(2, approvalRequests.size(), 'Two approval request records should be created.');
		System.assertEquals('Bonafide Certificate', approvalRequests[1].educx__Document_Type__c);
        System.assertEquals(student.Id, approvalRequests[1].educx__Student_ID__c);
        System.assertEquals('Pending', approvalRequests[1].educx__Status__c);
        System.assertEquals('Transfer', approvalRequests[1].educx__Reason__c);
    }
}