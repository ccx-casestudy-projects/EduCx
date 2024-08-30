@IsTest
public with sharing class StudentControllerTest {
    static Id courseId;
        
    @TestSetup
    static void setupTestData() {
        // Creating a sample Course record
        educx__Course__c course = new educx__Course__c(
            Name = 'Code 1',
            educx__Course__c = 'B.Com',
            educx__Course_Name__c = 'General',
            educx__Course_Level__c = 'UG',
            educx__Medium__c = 'English',
            educx__Course_Duration__c = '3 Years'
        );
        insert course;
        courseId = course.Id; // Store course Id for use in tests
        
        educx__Academic_Year__c academicYear = new educx__Academic_Year__c(
            educx__Academic_year__c = '2024-25'
        );
        insert academicYear;
    
        // Creating sample Student records
        List<educx__Student__c> students = new List<educx__Student__c>{
            new educx__Student__c(
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
                educx__Status__c = 'Studying',
                educx__Year__c = '1st Year',
                educx__Is_RTF__c = true,
                educx__IsFirstYear__c = true
            ),
            new educx__Student__c(
                educx__Aadhar_Number__c = '1234 1234 1234',
                educx__Admission_Type__c = 'Management Quota',
                educx__Agreement_Fee__c = 5000,
                educx__Fee_Type__c = 'Per Year',
                educx__All_Bonafides__c = false,
                educx__Alternate_Mobile_No__c = '9876543210',
                educx__Course__c = 'B.Com',
                educx__Course_Code__c = course.Id, // Reference the correct ID
                educx__Course_Name__c = 'General',
                educx__Date_of_Birth__c = Date.newInstance(2002, 01, 01),
                educx__Email__c = 'student1@example.com',
                educx__ICET_Hall_Ticket_No__c = 'HT123457',
                educx__ICET_Rank__c = '501',
                educx__Name_of_The_Father__c = 'John Doe Sr.',
                educx__Father_Phone__c = '9876543210',
                educx__Gender__c = 'Male',
                educx__Hall_Ticket_No__c = 'HT987655',
                educx__Identification_Mark_1__c = 'Mole on right hand',
                educx__Identification_Mark_2__c = 'Mole on left eyebrow',
                educx__Joining_Date__c = Date.today(),
                educx__Name_of_The_Candidate__c = 'Student 1',
                educx__Name_of_The_Mother__c = 'Jane Doe',
                educx__Nationality__c = 'Indian',
                educx__Parent_Income__c = 500000,
                educx__Parent_Occupation__c = 'Engineer',
                educx__Phone_Number__c = '1234567890',
                educx__Religion__c = 'Hindu',
                educx__Semester__c = 'I',
                educx__SSC_Registration_No__c = '1222267855',
                educx__SSC_Year_of_Passing__c = '2020',
                educx__Status__c = 'Studying',
                educx__Year__c = '1st Year',
                educx__Is_RTF__c = true,
                educx__IsFirstYear__c = true
            ),
            new educx__Student__c(
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
                educx__Email__c = 'student2@example.com',
                educx__ICET_Hall_Ticket_No__c = 'HT123458',
                educx__ICET_Rank__c = '502',
                educx__Name_of_The_Father__c = 'John Doe Sr.',
                educx__Father_Phone__c = '9876543210',
                educx__Gender__c = 'Male',
                educx__Hall_Ticket_No__c = 'HT987656',
                educx__Identification_Mark_1__c = 'Mole on right hand',
                educx__Identification_Mark_2__c = 'Mole on left eyebrow',
                educx__Joining_Date__c = Date.today(),
                educx__Name_of_The_Candidate__c = 'Student 2',
                educx__Name_of_The_Mother__c = 'Jane Doe',
                educx__Nationality__c = 'Indian',
                educx__Parent_Income__c = 500000,
                educx__Parent_Occupation__c = 'Engineer',
                educx__Phone_Number__c = '1234567890',
                educx__Religion__c = 'Hindu',
                educx__Semester__c = 'I',
                educx__SSC_Registration_No__c = '1233333855',
                educx__SSC_Year_of_Passing__c = '2020',
                educx__Status__c = 'Studying',
                educx__Year__c = '2nd Year',
                educx__Is_RTF__c = true,
                educx__IsFirstYear__c = true
            )
        };
    
        insert students;
    
        // Create a test ContentVersion (which automatically creates a ContentDocument)
        ContentVersion contentVersion = new ContentVersion(
            Title = 'Test Document',
            PathOnClient = 'TestDocument.pdf',
            VersionData = Blob.valueOf('Test Content'),
            Origin = 'H',
            IsMajorVersion = true
        );
        insert contentVersion;
    
        // Query the ContentVersion to get the ContentDocumentId
        contentVersion = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1];
    
        // Use the ContentDocumentId to create the ContentDocumentLink
        ContentDocumentLink contentDocumentLink = new ContentDocumentLink(
            ContentDocumentId = contentVersion.ContentDocumentId,
            LinkedEntityId = students[0].Id, // Link to the first student
            ShareType = 'V'
        );
        insert contentDocumentLink;
        
        educx__Previous_Study_Details__c previousStudy = new educx__Previous_Study_Details__c(
            educx__Student__c = students[0].Id,
            educx__Course__c = 'High School',
            educx__School_College__c = 'ABC School',
            educx__Year_of_Passing__c = '2020',
            educx__Place__c = 'City'
        );
        insert previousStudy;
    }

    @IsTest
    static void testInsertStudentData() {
        // Query the course record inserted in @TestSetup
        educx__Course__c course = [SELECT Id FROM educx__Course__c WHERE Name = 'Code 1' LIMIT 1];

        // Test data preparation
        Map<String, Object> params = new Map<String, Object>{
            'educx__Aadhar_Number__c' => '1234 1234 1234',
            'educx__Admission_Type__c' => 'Management Quota',
            'educx__Agreement_Fee__c' => 10000,
            'educx__Fee_Type__c' => 'Per Year',
            'educx__Alternate_Mobile_No__c' => '8765432109',
            'educx__Caste__c' => 'OBC',
            'educx__Course__c' => 'B.Com',
            'educx__Course_Code__c' => course.Id,
            'educx__Course_Name__c' => 'General',
            'educx__Date_of_Birth__c' => Date.newInstance(2001, 12, 12),
            'educx__Email__c' => 'student2@example.com',
            'educx__ICET_Hall_Ticket_No__c' => 'HT234567',
            'educx__ICET_Rank__c' => '1000',
            'educx__Name_of_The_Father__c' => 'Sam Doe',
            'educx__Father_Phone__c' => '8765432109',
            'educx__Gender__c' => 'Female',
            'educx__Hall_Ticket_No__c' => 'HT876543',
            'educx__Identification_Mark_1__c' => 'Freckle on left cheek',
            'educx__Identification_Mark_2__c' => 'Birthmark on right foot',
            'educx__Joining_Date__c' => Date.newInstance(2023, 7, 1),
            'educx__Name_of_The_Candidate__c' => 'Jane Doe',
            'educx__Name_of_The_Mother__c' => 'Mary Doe',
            'educx__Nationality__c' => 'Indian',
            'educx__Parent_Income__c' => 750000,
            'educx__Parent_Occupation__c' => 'Doctor',
            'educx__Phone_Number__c' => '0987654321',
            'educx__Religion__c' => 'Muslim',
            'educx__Semester__c' => 'II',
            'educx__SSC_Registration_No__c' => 'SSC2345612',
            'educx__SSC_Year_of_Passing__c' => '2018',
            'educx__Status__c' => 'Studying',
            'educx__Year__c' => '2nd Year',
            'educx__Is_RTF__c' => true,
            'educx__IsFirstYear__c' => true
        };

        String studentData = JSON.serialize(params);

        // Calling the method
        Test.startTest();
        String studentId = StudentController.insertStudentData(studentData);
        Test.stopTest();

        // Query the newly created Student record
        educx__Student__c studentRecord = [SELECT Id, educx__Name_of_The_Candidate__c, educx__Aadhar_Number__c, 
                                           educx__Agreement_Fee__c, educx__Joining_Date__c 
                                           FROM educx__Student__c WHERE Id = :studentId LIMIT 1];

        // Asserts to validate the data
        System.assertNotEquals(null, studentRecord, 'Student record should be created');
        System.assertEquals('Jane Doe', studentRecord.educx__Name_of_The_Candidate__c);
        System.assertEquals('1234 1234 1234', studentRecord.educx__Aadhar_Number__c);
        System.assertEquals(10000, studentRecord.educx__Agreement_Fee__c);
        System.assertEquals(Date.newInstance(2023, 7, 1), studentRecord.educx__Joining_Date__c);
    }

    @IsTest
    static void testGetExistingAttachments() {
        // Retrieve the test student record
        educx__Student__c student = [SELECT Id FROM educx__Student__c WHERE educx__Name_of_The_Candidate__c = 'John Doe Jr.' LIMIT 1];

        // Call the method
        Map<String, String> result = StudentController.getExistingAttachments(student.Id);

        // Verify the result
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.containsKey('Test Document'), 'Result should contain the document title');
    }

    @IsTest
    static void testGetContentDocumentId() {
        // Retrieve the test ContentVersion record
        ContentVersion contentVersion = [SELECT Id, ContentDocumentId FROM ContentVersion LIMIT 1];

        // Call the method
        String contentDocumentId = StudentController.getContentDocumentId(contentVersion.Id);

        // Verify the result
        System.assertEquals(contentVersion.ContentDocumentId, contentDocumentId, 'ContentDocumentId should match');
    }

    @IsTest
    static void testGetContentDocumentLinks() {
        // Retrieve the test ContentDocument record
        ContentDocument contentDocument = [SELECT Id FROM ContentDocument LIMIT 1];

        // Call the method
        List<ContentDocumentLink> result = StudentController.getContentDocumentLinks(contentDocument.Id);

        // Verify the result
        System.assertNotEquals(0, result.size(), 'Result should not be empty');
        System.assertEquals(contentDocument.Id, result[0].ContentDocumentId, 'ContentDocumentId should match');
    }

    @IsTest
    static void testPromoteStudents() {
        // Retrieve the student records
        List<educx__Student__c> students = [SELECT Id,educx__Name_of_The_Candidate__c, educx__Year__c, educx__Semester__c, educx__Status__c 
                                            FROM educx__Student__c WHERE educx__Name_of_The_Candidate__c IN ('Student 1', 'Student 2')];
        
        // Check if students exist
        System.assertNotEquals(0, students.size(), 'Students should be found for promotion');

        List<Id> studentIds = new List<Id>();
        for (educx__Student__c student : students) {
            studentIds.add(student.Id);
        }
    
        // Invoke the promoteStudents method
        Test.startTest();
        StudentController.promoteStudents(studentIds);
        Test.stopTest();
    
        // Re-query the students and verify the promotions
        List<educx__Student__c> updatedStudents = [SELECT Id,educx__Name_of_The_Candidate__c,educx__Year__c, 
                                                   educx__Semester__c, educx__Status__c FROM educx__Student__c WHERE Id IN :studentIds];
    
        System.assertEquals(2, updatedStudents.size(), 'Two students should be found');
    
        for (educx__Student__c student : updatedStudents) {
            if (student.educx__Year__c == '1st Year') {
                System.assertEquals('1st Year', student.educx__Year__c, 'Student should be promoted to 2nd Year');
            } else if (student.educx__Year__c == '2nd Year') {
                System.assertEquals('2nd Year', student.educx__Year__c, 'Student should be promoted to 3rd Year');
            }
        }
    }

    @IsTest
    static void testGetStudentsByAcademicYear() {
        // Test with academic year filtering
        List<educx__Student__c> students = StudentController.getStudentsByAcademicYear('2024-25', 'Student');
        System.assertNotEquals(0, students.size(), 'Students should be returned for the academic year 2024-25 with the specified name');
        System.assertEquals('Student 1', students[0].educx__Name_of_The_Candidate__c, 'The student name should match');
    
        // Test with no academic year filtering
        students = StudentController.getStudentsByAcademicYear(null, 'Student');
        System.assertNotEquals(0, students.size(), 'Students should be returned when no academic year is specified with the specified name');
        System.assertEquals('Student 1', students[0].educx__Name_of_The_Candidate__c, 'The student name should match');
    }
    @isTest
    static void testGetStudentsByFilter() {
        // Query the course record inserted in @TestSetup
        educx__Course__c course = [SELECT Id FROM educx__Course__c WHERE Name = 'Code 1' LIMIT 1];
        
        // Call the method with specific filter criteria
        Test.startTest();
        List<educx__Student__c> result = StudentController.getStudentsByFilter(
            '2024-25', course.Id, 'B.Com', 'General', '1st Year', 'I'
        );
        List<educx__Student__c> result1 = StudentController.getStudentsByFilter(
            null, course.Id, 'B.Com', 'General', '1st Year', 'I'
        );
        Test.stopTest();
        
        // Verify the results
        System.assertEquals(2, result.size(), 'The number of students returned should be 2');
        System.assertEquals('John Doe Jr.', result[0].educx__Name_of_The_Candidate__c, 'The student name should be John Doe Jr.');
        
        // Verify the results for the second filter
        System.assertEquals(2, result1.size(), 'The number of students returned should be 2');
        System.assertEquals('John Doe Jr.', result1[0].educx__Name_of_The_Candidate__c, 'The student name should be Student 1');
    }



    @isTest
    static void testGetAcademicYearPicklistValues() {
        Test.startTest();
        List<String> picklistValues = StudentController.getAcademicYearPicklistValues();
        Test.stopTest();

        // Verify that the picklist values are returned correctly
        System.assertNotEquals(null, picklistValues, 'Picklist values should not be null');
        System.assert(picklistValues.contains('None'), 'The picklist values should contain "None"');
    }

    @isTest
    static void testGetPreviousStudyDetails() {
        // Query the existing student record
        educx__Student__c student = [SELECT Id FROM educx__Student__c LIMIT 1];
        Test.startTest();
        List<educx__Previous_Study_Details__c> previousStudyDetails = StudentController.getPreviousStudyDetails(student.Id);
        Test.stopTest();

        // Verify that previous study details are returned correctly
        System.assertEquals(1, previousStudyDetails.size(), 'The number of previous study details returned should be 1');
        System.assertEquals('ABC School', previousStudyDetails[0].educx__School_College__c, 'The school/college should be ABC School');
    }

    @isTest
    static void testPopulateCourseDetails() {
        // Query the existing course record
        Course__c course = [SELECT Id FROM Course__c LIMIT 1];
        Test.startTest();
        Course__c courseDetails = StudentController.populateCourseDetails(course.Id);
        Test.stopTest();

        // Verify that course details are returned correctly
        System.assertNotEquals(null, courseDetails, 'Course details should not be null');
        System.assertEquals(course.Id, courseDetails.Id, 'The course ID should match');
    }

   	@isTest
    static void testUploadCSVFile() {
        // Query the course record inserted in @TestSetup
        educx__Course__c course = [SELECT Id FROM educx__Course__c WHERE Name = 'Code 1' LIMIT 1];
    
        // Prepare CSV content 
        String csvContent = 'educx__Name_of_The_Candidate__c ,educx__Hall_Ticket_No__c ,educx__ICET_Rank__c ,educx__Admission_Type__c ,educx__SSC_Registration_No__c,educx__Year__c,educx__Semester__c,educx__Date_of_Birth__c,educx__Joining_Date__c ,educx__Parent_Income__c ,educx__Agreement_Fee__c,educx__Phone_Number__c ,educx__Email__c ,educx__SSC_Year_of_Passing__c ,educx__ICET_Hall_Ticket_No__c ,educx__Identification_Mark_1__c ,educx__Identification_Mark_2__c ,educx__Course_Code__,educx__Course__c,educx__Course_Name__c,educx__Aadhar_Number__c,educx__Father_Phone__c \n' +
                            'Jane Doe,HT654321,2,Management Quota,SSC4563456,1st Year,I,01-01-2003,19-08-2024,60000,1200,9187654321,janedoe@example.com,2021,ICET456,Mark3,Mark4,' + course.Id +',B.Com,General,1234 2345 2345,2345678912';
    
        // Execute the method
        Test.startTest();
        StudentController.uploadCSVFile(csvContent);
        Test.stopTest();
    
        // Verify that the student record has been inserted
        List<educx__Student__c> students = [SELECT Id, educx__Name_of_The_Candidate__c FROM educx__Student__c WHERE educx__Name_of_The_Candidate__c = 'Jane Doe'];
        System.assertEquals(1, students.size(), 'The number of students inserted should be 1');
        System.assertEquals('Jane Doe', students[0].educx__Name_of_The_Candidate__c, 'The student name should be Jane Doe');
    }


}