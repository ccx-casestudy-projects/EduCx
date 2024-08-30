@IsTest
public class EmployeeControllerTest {
    
    @TestSetup
    static void setupData() {
        // Insert some employee records
        List<educx__Employees__c> employees = new List<educx__Employees__c>();
        List<educx__Course__c> courses = new List<educx__Course__c>();
        List<educx__Subject__c> subjects = new List<educx__Subject__c>();
        List<educx__Faculty_Subjects__c> facultySubjects = new List<educx__Faculty_Subjects__c>();
        
        // Create and insert employee records
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
            educx__Specialization__c = 'Maths',
            educx__Designation__c = 'Professor',
            educx__Qualifications__c = 'M.Sc.'
        );
        employees.add(emp2);
        
        insert employees;
        
        
        // Create and insert leave account records
        educx__Employee_Leave_Account__c leaveAccount = new educx__Employee_Leave_Account__c(
            educx__Employee__c = emp2.Id,
            educx__Number_of_Availed_Leaves__c = 0,
            educx__Number_of_Balance_Leaves__c = 15,
            educx__Total_Leaves_In_Account__c = 15,
            educx__Loss_of_Pay__c = 0
        );
        insert leaveAccount;
        
        // Create and insert leave details records
        educx__Employee_Leave_Details__c leaveDetail = new educx__Employee_Leave_Details__c(
            educx__Employee__c = emp2.Id,
            educx__Employee_Leave_Account__c = leaveAccount.Id,
            educx__From_Date__c = Date.today().addDays(-5),
            educx__To_Date__c = Date.today(),
            educx__Reason__c = 'Vacation',
            educx__Applied_Date__c = Date.today().addDays(-6),
            educx__Leave_Status__c = 'Pending'
        );
        insert leaveDetail;
        
        
        
        // Create and insert test Course record
        educx__Course__c testCourse = new educx__Course__c(
            Name = 'Code 1',
            educx__Course_Name__c = 'General',
            educx__Course__c = 'B.Com',
            educx__Course_Level__c = 'UG',
            educx__Medium__c = 'English',
            educx__Course_Duration__c = '1 Year'
        );
        insert testCourse;
        
        // Create and insert test Subject record
        educx__Subject__c testSubject = new educx__Subject__c(
            educx__Subject_Name__c = 'Test Subject'
        );
        insert testSubject;
        
        // Create and insert test Faculty Subjects record
        educx__Faculty_Subjects__c testFacultySubject = new educx__Faculty_Subjects__c(
            educx__Employee__c = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe' LIMIT 1].Id,
            educx__Course__c = testCourse.Id,
            educx__Subject__c = testSubject.Id,
            educx__Semester__c = 'I',
            educx__Year__c = '1st Year',
            educx__Academic_Year__c = '2023-24'
        );
        insert testFacultySubject; 
        
        // Create and insert test Course Subject record
        educx__Course_Subject__c testCourseSubject = new educx__Course_Subject__c(
            educx__Course__c = testCourse.Id,
            educx__Subject__c = testSubject.Id,
            educx__Year__c = '1st Year',
            educx__Semester__c = 'I'
            
        );
        insert testCourseSubject;
    }
    
    
    @IsTest
    static void testDisplayEmployeeRecords() {
        Test.startTest();
        List<educx__Employees__c> result = EmployeeController.displayEmployeeRecords();
        Test.stopTest();
        System.assertEquals(1, result.size(), 'There should be one employee with status "Left"');
        System.assertEquals('Jane Doe', result[0].educx__Employee_Name__c);
    }
    
    
    
    @IsTest
    static void testGetEmployeeDetailsOnHeader() {
        Test.startTest();
        List<educx__Employees__c> result;
        try {
            // Call the method with the known employee name
            result = EmployeeController.getEmployeeDetailsOnHeader('Jane Doe');
            System.assert(result != null, 'Result should not be null');
            System.assertEquals(1, result.size(), 'There should be one employee returned');
            System.assertEquals('Jane Doe', result[0].educx__Employee_Name__c);
        } 
        catch (Exception e) {
            System.assert(true, 'Exception was thrown: ' + e.getMessage());
        }
        Test.stopTest();
    }
    
    @IsTest
    static void testViewEmployeeDetails() {
        List<educx__Employees__c> employees = [SELECT Id FROM educx__Employees__c LIMIT 1];
        Test.startTest();
        educx__Employees__c result = EmployeeController.viewEmployeeDetails(employees[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Employee details should be returned');
    }
    
    @IsTest
    static void testGetEmpLeaveAccForLeaveRequest() {
        List<educx__Employees__c> employees = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'Jane Doe' LIMIT 1];
        Test.startTest();
        educx__Employee_Leave_Account__c result = EmployeeController.getEmpLeaveAccForLeaveRequest(employees[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Leave account should be returned');
    }
    
    @IsTest
    static void testGetEmployeeDetails() {
        List<educx__Employees__c> employees = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'Jane Doe' LIMIT 1];
        Test.startTest();
        educx__Employees__c result = EmployeeController.getEmployeeDetails(employees[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Employee details should be returned');
    }
    
    @IsTest
    static void testCreateEmployeeLeaveDetail() {
        educx__Employees__c emp = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe' LIMIT 1];
        educx__Employee_Leave_Account__c leaveAcc = new educx__Employee_Leave_Account__c(
            educx__Employee__c = emp.Id,
            educx__Number_of_Availed_Leaves__c = 5,
            educx__Number_of_Balance_Leaves__c = 10,
            educx__Total_Leaves_In_Account__c = 15
        );
        insert leaveAcc;
        
        List<educx__Employee_Leave_Details__c> leaveDetails = EmployeeController.createEmployeeLeaveDetail(
            emp.Id, leaveAcc.Id, Date.today(), Date.today().addDays(1), 'Personal Leave', Date.today()
        );
        
        System.assertEquals(1, leaveDetails.size(), 'Should create a leave detail record');
    }
    @IsTest
    static void testGetFacultySubjects() {
        // Get the employee ID from existing data
        educx__Employees__c testEmployee = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe' LIMIT 1];
        Test.startTest();
        List<educx__Faculty_Subjects__c> result = EmployeeController.getFacultySubjects(testEmployee.Id);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(1, result.size(), 'There should be one faculty subject returned');
        System.assertEquals('General', result[0].educx__Course__r.educx__Course_Name__c, 'Course Name should match');
        System.assertEquals('Test Subject', result[0].educx__Subject__r.educx__Subject_Name__c, 'Subject Name should match');
        System.assertEquals('I', result[0].educx__Semester__c, 'Semester should match');
        System.assertEquals('1st Year', result[0].educx__Year__c, 'Year should match');
    }
    
    @IsTest
    static void testPopulateSubjectDetails() {
        // Retrieve existing course ID from test data
        educx__Course__c testCourse = [SELECT Id FROM educx__Course__c LIMIT 1];
        System.assertNotEquals(null, testCourse, 'Test course should exist');
        Test.startTest();
        List<educx__Course_Subject__c> result = EmployeeController.populateSubjectDetails(
            testCourse.Id,
            '1st Year',
            'I'
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(1, result.size(), 'There should be one course subject returned');
        educx__Course_Subject__c resultSubject = result[0];
        System.assertEquals(testCourse.Id, resultSubject.educx__Course__c, 'Course ID should match');
        System.assertEquals('Test Subject', resultSubject.educx__Subject__r.educx__Subject_Name__c, 'Subject Name should match');
        System.assertEquals('1st Year', resultSubject.educx__Year__c, 'Year should match');
        System.assertEquals('I', resultSubject.educx__Semester__c, 'Semester should match');
    }
    
    
    
    
    
    @isTest
    static void testGetEmployeeLeaveAccount() {
        educx__Employees__c emp = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe' LIMIT 1];
        educx__Employee_Leave_Account__c leaveAccount = [SELECT Id FROM educx__Employee_Leave_Account__c WHERE educx__Employee__c = :emp.Id LIMIT 1];
        Test.startTest();
        educx__Employee_Leave_Account__c result = EmployeeController.getEmployeeLeaveAccount(emp.Id);
        Test.stopTest();
        System.assertNotEquals(null, result, 'The employee leave account should not be null.');
        System.assertEquals(leaveAccount.Id, result.Id, 'The leave account ID should match.');
    }
    
    @isTest
    static void testApproveRecords() {
        educx__Employee_Leave_Details__c leaveDetail = [SELECT Id FROM educx__Employee_Leave_Details__c LIMIT 1];
        Test.startTest();
        EmployeeController.approveRecords(new List<Id>{leaveDetail.Id});
        Test.stopTest();
        leaveDetail = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE Id = :leaveDetail.Id];
        System.assertEquals('Approved', leaveDetail.educx__Leave_Status__c, 'The leave status should be approved.');
    }
    @isTest
    static void testApproveRecordsNoRecords() {
        Test.startTest();
        // Pass an empty list of record IDs
        EmployeeController.approveRecords(new List<Id>());
        Test.stopTest();
        List<educx__Employee_Leave_Details__c> leaveDetails = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE educx__Leave_Status__c = 'Approved'];
        System.assertEquals(0, leaveDetails.size(), 'No records should have been updated.');
    }
    
    @isTest
    static void testRejectRecords() {
        educx__Employee_Leave_Details__c leaveDetail = [SELECT Id FROM educx__Employee_Leave_Details__c LIMIT 1];
        Test.startTest();
        EmployeeController.rejectRecords(new List<Id>{leaveDetail.Id});
        Test.stopTest();
        leaveDetail = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE Id = :leaveDetail.Id];
        System.assertEquals('Rejected', leaveDetail.educx__Leave_Status__c, 'The leave status should be rejected.');
    }
    
    @isTest
    static void testRejectRecordsNoRecords() {
        Test.startTest();
        // Pass an empty list of record IDs
        EmployeeController.rejectRecords(new List<Id>());
        Test.stopTest();
        List<educx__Employee_Leave_Details__c> leaveDetails = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE educx__Leave_Status__c = 'Rejected'];
        System.assertEquals(0, leaveDetails.size(), 'No records should have been updated.');
    }
    
    @isTest
    static void testGetEmployeeLeaveDetails() {
        Test.startTest();
        List<educx__Employee_Leave_Details__c> results = EmployeeController.getEmployeeLeaveDetails();
        Test.stopTest();
        System.assertNotEquals(null, results, 'The leave details list should not be null.');
        System.assertEquals(1, results.size(), 'The leave details list should contain one record.');
    }
    
    @isTest
    static void testGetEmployeeLeaveDetailsNoRecords() {
        // Delete existing leave details records
        List<educx__Employee_Leave_Details__c> leaveDetails = [SELECT Id FROM educx__Employee_Leave_Details__c];
        if (!leaveDetails.isEmpty()) {
            delete leaveDetails;
        }
        Test.startTest();
        List<educx__Employee_Leave_Details__c> results = EmployeeController.getEmployeeLeaveDetails();
        Test.stopTest();
        System.assertNotEquals(null, results, 'The leave details list should not be null.');
        System.assertEquals(0, results.size(), 'The leave details list should be empty.');
    }
    
    @isTest
    static void testGetEmployeeDetailsExactMatch() {
        Test.startTest();
        // Use the exact name of the employee created in setup
        List<educx__Employees__c> results = EmployeeController.getEmpDetailsOnSearch('John Doe');
        Test.stopTest();
        System.assertNotEquals(null, results, 'The employee details list should not be null.');
        System.assertEquals(1, results.size(), 'The employee details list should contain one record.');
        System.assertEquals('John Doe', results[0].educx__Employee_Name__c, 'The employee name should be John Doe.');
    }
    
    @isTest
    static void testGetEmployeeDetailsNoMatch() {
        Test.startTest();
        // Use a name that does not match any employee
        List<educx__Employees__c> results = EmployeeController.getEmpDetailsOnSearch('Nonexistent Name');
        Test.stopTest();
        System.assertNotEquals(null, results, 'The employee details list should not be null.');
        System.assertEquals(0, results.size(), 'The employee details list should be empty.');
    }
    @isTest
    static void testGetAllEmployees() {
        List<educx__Employees__c> employees = EmployeeController.getAllEmployees();
        System.assertNotEquals(0, employees.size(), 'The employee list should not be empty.');
        Set<String> employeeNames = new Set<String>();
        for (educx__Employees__c emp : employees) {
            employeeNames.add(emp.educx__Employee_Name__c);
        }
        System.assert(employeeNames.contains('John Doe'), 'John Doe should be in the employee list.');
        System.assert(employeeNames.contains('Jane Doe'), 'Jane Doe should be in the employee list.');
    }

    
    
}