@isTest
public class EmployeeLeaveCalculationTest {
    
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

        // Create and insert test Employee Leave Account record
        educx__Employee_Leave_Account__c leaveAccount = new educx__Employee_Leave_Account__c(
            educx__Employee__c = emp1.Id,
            educx__Number_of_Availed_Leaves__c = 0,
            educx__Number_of_Balance_Leaves__c = 12,
            educx__Total_Leaves_In_Account__c = 12,
            educx__Loss_of_Pay__c = 0
        );
        insert leaveAccount;

        // Create and insert test Employee Leave Details record
        educx__Employee_Leave_Details__c leaveDetails = new educx__Employee_Leave_Details__c(
            educx__Employee__c = emp1.Id,
            educx__From_Date__c = Date.newInstance(2024, 8, 5),
            educx__To_Date__c = Date.newInstance(2024, 8, 10),
            educx__Employee_Leave_Account__c = leaveAccount.Id,
            educx__Reason__c = 'Vacation'
        );
        insert leaveDetails;
    }

    @isTest
    static void testBeforeLeaveRecCreation() {
        // Test beforeleaveRecCreation method
        List<educx__Employee_Leave_Account__c> newLeaveAccounts = new List<educx__Employee_Leave_Account__c>{
            new educx__Employee_Leave_Account__c(
                educx__Employee__c = [SELECT Id FROM educx__Employees__c LIMIT 1].Id
            )
        };

        Test.startTest();
        EmployeeLeaveCalculation.beforeleaveRecCreation(newLeaveAccounts);
        Test.stopTest();

        // Verify the result
        educx__Employee_Leave_Account__c updatedAccount = [SELECT educx__Number_of_Balance_Leaves__c, educx__Number_of_Availed_Leaves__c FROM educx__Employee_Leave_Account__c LIMIT 1];
        System.assertEquals(1, updatedAccount.educx__Number_of_Balance_Leaves__c);
        System.assertEquals(0, updatedAccount.educx__Number_of_Availed_Leaves__c);
    }

  @isTest
static void testEmpLeaveDetails() {
    // Set up the test data
    educx__Employee_Leave_Account__c leaveAcc = [
        SELECT Id, educx__Employee__c, educx__Number_of_Availed_Leaves__c, educx__Number_of_Balance_Leaves__c, educx__Loss_of_Pay__c 
        FROM educx__Employee_Leave_Account__c 
        LIMIT 1
    ];

    // Set an initial balance for testing
    leaveAcc.educx__Number_of_Balance_Leaves__c = 10;
    update leaveAcc;

    // Run the method
    List<educx__Employee_Leave_Details__c> leaveDetailsList = [
        SELECT Id, educx__Employee__c, educx__Employee_Leave_Account__c, educx__From_Date__c, educx__To_Date__c 
        FROM educx__Employee_Leave_Details__c 
        WHERE educx__Employee__c = :leaveAcc.educx__Employee__c 
        LIMIT 1
    ];

    Test.startTest();
    EmployeeLeaveCalculation.empLeaveDetails(leaveDetailsList);
    Test.stopTest();

    // Verify that the balance leaves were correctly updated
    educx__Employee_Leave_Account__c updatedLeaveAcc = [
        SELECT educx__Number_of_Availed_Leaves__c, educx__Number_of_Balance_Leaves__c, educx__Loss_of_Pay__c 
        FROM educx__Employee_Leave_Account__c 
        WHERE Id = :leaveAcc.Id 
        LIMIT 1
    ];

    Integer expectedBalanceLeaves = 10 - 6; // Assuming 6 leave days
    System.assertEquals(expectedBalanceLeaves, updatedLeaveAcc.educx__Number_of_Balance_Leaves__c);
}


}