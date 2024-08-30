@IsTest
public class DisplayPaymentDetailsTest {

    @TestSetup
    static void setup() {
        // Query an existing RecordType for Payment Details
        RecordType rt = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'educx__Payment_Details__c' LIMIT 1];

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
            educx__Hall_Ticket_No__c = 'HT987654',
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

        // Create a Payment record related to the Student
        educx__Payment__c payment = new educx__Payment__c(
            educx__Student__c = student.Id,
            educx__Student_Hall_Ticket_No__c = student.educx__Hall_Ticket_No__c,
            educx__Year__c = '1st Year'
        );
        insert payment;

        // Create Payment Details record related to the Payment
        educx__Payment_Details__c paymentDetail = new educx__Payment_Details__c(
            educx__Payment__c = payment.Id,
            educx__Fee_Type__c = 'Special Fee',
            educx__Amount_Paid__c = 5000,
            RecordTypeId = rt.Id
        );
        insert paymentDetail;
    }

    @IsTest
    static void testGetPaymentDetails() {
        // Call the getPaymentDetails method
        Test.startTest();
        List<DisplayPaymentDetails.PaymentDetailsWrapper> result = DisplayPaymentDetails.getPaymentDetails();
        Test.stopTest();

        // Verify the result
        System.assertEquals(1, result.size(), 'Expected one payment detail to be returned');
        DisplayPaymentDetails.PaymentDetailsWrapper wrapper = result[0];
        System.assertEquals('John Doe Jr.', wrapper.studentName, 'Student Name does not match');
        System.assertEquals('HT987654', wrapper.studentHallicket, 'Hall Ticket does not match');
        System.assertEquals(5000.0, wrapper.amountPaid, 'Amount Paid does not match');
    }

    @IsTest
    static void testGetPassedOutStudentAndAcademicYearDetails() {
        // Call the getPassedOutStudentAndAcademicYearDetails method
        Test.startTest();
        List<educx__Student__c> students = DisplayPaymentDetails.getPassedOutStudentAndAcademicYearDetails();
        Test.stopTest();

        // Verify the result
        System.assertEquals(1, students.size(), 'Expected one passed out student to be returned');
        educx__Student__c student = students[0];
        System.assertEquals('John Doe Jr.', student.educx__Name_of_The_Candidate__c, 'Student Name does not match');
        System.assertEquals('HT987654', student.educx__Hall_Ticket_No__c, 'Hall Ticket does not match');
    }

  
}