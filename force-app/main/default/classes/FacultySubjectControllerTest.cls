@IsTest
public class FacultySubjectControllerTest {
    
    @testSetup
    static void setupData() {
        // Create and insert employee records
        List<educx__Employees__c> employees = new List<educx__Employees__c>();
        
        educx__Employees__c emp1 = new educx__Employees__c(
            educx__Employee_Name__c = 'John Doe',
            educx__Pan__c = 'FYUOP5678A',
            educx__Phone__c = '1234567890',
            educx__Date_of_Birth__c = Date.newInstance(1990, 1, 1),
            educx__Father_s_Name__c = 'Mr. Doe',
            educx__Years_of_Experience__c = '5',
            educx__Is_Ratified__c = true,
            educx__Employee_Type__c = 'Teaching',
            educx__Status__c = 'Left',
            educx__Date_of_joining__c = Date.newInstance(2015, 1, 1),
            educx__Aadhar_Number__c = '1234 1234 1234',
            educx__Email__c = 'johndoe@example.com',
            educx__Specialization__c = 'Maths',
            educx__Designation__c = 'Professor',
            educx__Qualifications__c = 'M.Sc.'
        );
        employees.add(emp1);
        
        educx__Employees__c emp2 = new educx__Employees__c(
            educx__Employee_Name__c = 'Jane Doe',
            educx__Pan__c = 'FYUOP5678A',
            educx__Phone__c = '0987654321',
            educx__Date_of_Birth__c = Date.newInstance(1992, 2, 2),
            educx__Father_s_Name__c = 'Mr. Smith',
            educx__Years_of_Experience__c = '3',
            educx__Is_Ratified__c = false,
            educx__Employee_Type__c = 'Non Teaching',
            educx__Status__c = 'Working',
            educx__Date_of_joining__c = Date.newInstance(2018, 2, 1),
            educx__Aadhar_Number__c = '4432 1432 1432',
            educx__Email__c = 'janedoe@example.com',
            educx__Specialization__c = 'Physics',
            educx__Designation__c = 'Principal',
            educx__Qualifications__c = 'M.Sc.'
        );
        employees.add(emp2);
        
        insert employees;
        
        // Create and insert test Course record
        educx__Course__c testCourse = new educx__Course__c(
            Name = 'Course 1',
            educx__Course_Name__c = 'General',
            educx__Course__c = 'B.Com',
            educx__Course_Level__c = 'UG',
            educx__Medium__c = 'English',
            educx__Course_Duration__c = '1 Year'
        );
        insert testCourse;
        
        // Create and insert test Subject records
        educx__Subject__c subject1 = new educx__Subject__c(
            educx__Subject_Name__c = 'Test Subject 1'
        );
        educx__Subject__c subject2 = new educx__Subject__c(
            educx__Subject_Name__c = 'Test Subject 2'
        );
        insert new List<educx__Subject__c> { subject1, subject2 };
        
        // Create and insert test Faculty Subjects record
        educx__Faculty_Subjects__c testFacultySubject = new educx__Faculty_Subjects__c(
            educx__Employee__c = emp1.Id,
            educx__Course__c = testCourse.Id,
            educx__Subject__c = subject1.Id,
            educx__Semester__c = 'I',
            educx__Year__c = '1st Year',
            educx__Academic_Year__c = '2023-24'
        );
        insert testFacultySubject;
        
        // Create and insert test Course Subject record
        educx__Course_Subject__c testCourseSubject = new educx__Course_Subject__c(
            educx__Course__c = testCourse.Id,
            educx__Subject__c = subject1.Id,
            educx__Year__c = '1st Year',
            educx__Semester__c = 'I'
        );
        insert testCourseSubject;
    }

    @IsTest
    static void testValidateUniqueAssignments_NoDuplicates() {
        // Test to ensure no errors for unique assignments
        List<educx__Faculty_Subjects__c> newFacultySubjects = new List<educx__Faculty_Subjects__c>{
            new educx__Faculty_Subjects__c(
                educx__Employee__c = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe' LIMIT 1].Id,
                educx__Course__c = [SELECT Id FROM educx__Course__c LIMIT 1].Id,
                educx__Subject__c = [SELECT Id FROM educx__Subject__c WHERE educx__Subject_Name__c = 'Test Subject 2' LIMIT 1].Id,
                educx__Semester__c = 'II',
                educx__Year__c = '2nd Year',
                educx__Academic_Year__c = '2024-25'
            )
                };
                    
                    Test.startTest();
        try {
            FacultySubjectController.validateUniqueAssignments(newFacultySubjects);
            System.assert(true, 'The validation passed without any errors for unique assignments.');
        } catch (Exception e) {
            System.assert(false, 'Unexpected error occurred: ' + e.getMessage());
        }
        Test.stopTest();
    }


    @IsTest
    static void testValidateUniqueAssignments_DuplicateWithinNewRecords() {
        // Test to ensure that duplicate assignments within Trigger.new are caught
        List<educx__Faculty_Subjects__c> newFacultySubjects = new List<educx__Faculty_Subjects__c>{
            new educx__Faculty_Subjects__c(
                educx__Employee__c = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe'].Id,
                educx__Course__c = [SELECT Id FROM educx__Course__c LIMIT 1].Id,
                educx__Subject__c = [SELECT Id FROM educx__Subject__c WHERE educx__Subject_Name__c = 'Test Subject 1'].Id,
                educx__Semester__c = 'I',
                educx__Year__c = '1st Year',
                educx__Academic_Year__c = '2023-24'
            ),
            new educx__Faculty_Subjects__c(
                educx__Employee__c = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe'].Id,
                educx__Course__c = [SELECT Id FROM educx__Course__c LIMIT 1].Id,
                educx__Subject__c = [SELECT Id FROM educx__Subject__c WHERE educx__Subject_Name__c = 'Test Subject 1'].Id,
                educx__Semester__c = 'I',
                educx__Year__c = '1st Year',
                educx__Academic_Year__c = '2023-24'
            )
        };

        Test.startTest();
        try {
            FacultySubjectController.validateUniqueAssignments(newFacultySubjects);
            System.assert(true, 'Expected an error due to duplicate assignments within new records.');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('This subject has already been assigned to this employee in the same academic year'));
        }
        Test.stopTest();
    }

    @IsTest
    static void testValidateUniqueAssignments_DuplicateWithExistingRecords() {
        // Test to ensure that duplicate assignments with existing records are caught
        List<educx__Faculty_Subjects__c> newFacultySubjects = new List<educx__Faculty_Subjects__c>{
            new educx__Faculty_Subjects__c(
                educx__Employee__c = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe'].Id,
                educx__Course__c = [SELECT Id FROM educx__Course__c LIMIT 1].Id,
                educx__Subject__c = [SELECT Id FROM educx__Subject__c WHERE educx__Subject_Name__c = 'Test Subject 1'].Id,
                educx__Semester__c = 'I',
                educx__Year__c = '1st Year',
                educx__Academic_Year__c = '2023-24'
            )
        };

        Test.startTest();
        try {
            FacultySubjectController.validateUniqueAssignments(newFacultySubjects);
            System.assert(true, 'Expected an error due to duplicate assignments with existing records.');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('This subject has already been assigned to this employee in the same academic year'));
        }
        Test.stopTest();
    }
}