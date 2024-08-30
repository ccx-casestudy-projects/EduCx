@isTest
public class FeeReceiptPdfTest {
    
    @testSetup
    static void setup() {
        // Creating a sample Course record that the student will reference
        educx__Course__c course = new educx__Course__c(
            Name = 'Code 1',
            educx__Course__c = 'B.Com',
            educx__Course_Name__c = 'General',
            educx__Course_Level__c = 'UG',
            educx__Medium__c = 'English',
            educx__Course_Duration__c = '1 Year'
        );
        insert course;

        // Creating a sample Student record with most of the fields populated
        educx__Student__c student = new educx__Student__c(
            educx__Aadhar_Number__c = '1234 1234 1234',
            educx__Admission_Type__c = 'Management Quota',
            educx__Agreement_Fee__c = 5000,
            educx__Fee_Type__c = 'Per Year',
            educx__All_Bonafides__c = false,
            educx__Alternate_Mobile_No__c = '9876543210',
            educx__Course__c = 'B.Com',
            educx__Course_Code__c = course.Id, // Reference the correct ID
            educx__Course_Name__c = 'General',
            educx__Current_Academic_Year__c = '2024-25',
            educx__Date_of_Birth__c = Date.newInstance(2002, 01, 01),
            educx__Email__c = 'student@example.com',
            educx__ICET_Hall_Ticket_No__c = 'HT123456',
            educx__ICET_Rank__c = '500',
            educx__Name_of_The_Father__c = 'John Doe Sr.',
            educx__Father_Phone__c = '9876543210',
            educx__Gender__c = 'Male',
            educx__Hall_Ticket_No__c = 'HT987654', // Correct Hall Ticket Number
            educx__Identification_Mark_1__c = 'Mole on right hand',
            educx__Identification_Mark_2__c = 'Mole on left eyebrow',
            educx__Joining_Date__c = Date.today(),
            educx__Name_of_The_Candidate__c = 'John Doe Jr.',
            educx__Name_of_The_Mother__c = 'Jane Doe',
            educx__Nationality__c = 'Indian',
            educx__Parent_Income__c = 500000,
            educx__Parent_Occupation__c = 'Engineer',
            educx__Phone_Number__c = '1234567890',
            educx__Religion__c = 'Hindu',
            educx__Semester__c = 'I',
            educx__SSC_Registration_No__c = '1234567854',
            educx__SSC_Year_of_Passing__c = '2020',
            educx__Status__c = 'Passed Out',
            educx__Year__c = '1st Year',
            educx__Is_RTF__c = true,
            educx__IsFirstYear__c = true
        );
        insert student;
        
        // Create a test Payment
        educx__Payment__c payment = new educx__Payment__c(
            educx__Student__c = student.Id
        );
        insert payment;

        // Create test Payment Details
        List<educx__Payment_Details__c> paymentDetailsList = new List<educx__Payment_Details__c>();
        for (Integer i = 0; i < 3; i++) {
            paymentDetailsList.add(new educx__Payment_Details__c(
                educx__Payment__c = payment.Id,
                educx__Fee_Type__c = 'Management Fee',
                educx__Amount_Paid__c = 100.0 + i,
                educx__Payment_Type__c = 'Cash'
            ));
        }
        insert paymentDetailsList;
    }
    
    @isTest
    static void testGetPaymentDetails() {
        // Query the inserted Payment Details to get their Ids
        List<educx__Payment_Details__c> paymentDetailsList = [SELECT Id FROM educx__Payment_Details__c LIMIT 3];
        List<Id> paymentDetailIds = new List<Id>();
        for (educx__Payment_Details__c pd : paymentDetailsList) {
            paymentDetailIds.add(pd.Id);
        }
        
        // Call the method to test
        Test.startTest();
        List<FeeReceiptPdf.PaymentDetailsWrapper> results = FeeReceiptPdf.getPaymentDetails(paymentDetailIds);
        Test.stopTest();
        
        // Validate the results
        System.assertEquals(3, results.size(), 'Expected 3 payment details records');
        
        for (FeeReceiptPdf.PaymentDetailsWrapper wrapper : results) {
            System.assertNotEquals(null, wrapper.studentName, 'Student name should not be null');
            System.assertNotEquals(null, wrapper.studentCourseName, 'Student course name should not be null');
            System.assertNotEquals(null, wrapper.typeOfFee, 'Fee type should not be null');
            System.assertNotEquals(null, wrapper.amountPaid, 'Amount paid should not be null');
            System.assertNotEquals(null, wrapper.paymentType, 'Payment type should not be null');
            System.assertNotEquals(null, wrapper.studentId, 'Student Id should not be null');
        }
    }
}