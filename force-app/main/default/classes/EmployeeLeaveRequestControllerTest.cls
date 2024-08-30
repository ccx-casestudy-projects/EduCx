@isTest
public class EmployeeLeaveRequestControllerTest {
    
    @TestSetup
    static void setupData() {
        // Create and insert a single employee record
        educx__Employees__c emp = new educx__Employees__c(
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
        insert emp;
        
        // Create and insert leave account record for the employee
        educx__Employee_Leave_Account__c leaveAccount = new educx__Employee_Leave_Account__c(
            educx__Employee__c = emp.Id,
            educx__Number_of_Availed_Leaves__c = 0,
            educx__Number_of_Balance_Leaves__c = 15,
            educx__Total_Leaves_In_Account__c = 15,
            educx__Loss_of_Pay__c = 0
        );
        insert leaveAccount;
        
        // Create and insert leave details record for the employee
        educx__Employee_Leave_Details__c leaveDetail = new educx__Employee_Leave_Details__c(
            educx__Employee__c = emp.Id,
            educx__Employee_Leave_Account__c = leaveAccount.Id,
            educx__From_Date__c = Date.today().addDays(-5),
            educx__To_Date__c = Date.today(),
            educx__Reason__c = 'Vacation',
            educx__Applied_Date__c = Date.today().addDays(-6),
            educx__Leave_Status__c = 'Pending'
        );
        insert leaveDetail;
    }
    
    @isTest
    static void testGetEmployeeLeaveAccount() {
        educx__Employees__c emp = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'John Doe' LIMIT 1];
        educx__Employee_Leave_Account__c leaveAccount = [SELECT Id FROM educx__Employee_Leave_Account__c WHERE educx__Employee__c = :emp.Id LIMIT 1];
        Test.startTest();
        educx__Employee_Leave_Account__c result = EmployeeLeaveRequestController.getEmployeeLeaveAccount(emp.Id);
        Test.stopTest();
        System.assertNotEquals(null, result, 'The employee leave account should not be null.');
        System.assertEquals(leaveAccount.Id, result.Id, 'The leave account ID should match.');
    }
    
    @isTest
    static void testApproveRecords() {
        educx__Employee_Leave_Details__c leaveDetail = [SELECT Id FROM educx__Employee_Leave_Details__c LIMIT 1];
        Test.startTest();
        EmployeeLeaveRequestController.approveRecords(new List<Id>{leaveDetail.Id});
        Test.stopTest();
        leaveDetail = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE Id = :leaveDetail.Id];
        System.assertEquals('Approved', leaveDetail.educx__Leave_Status__c, 'The leave status should be approved.');
    }
    @isTest
    static void testApproveRecordsNoRecords() {
        Test.startTest();
        // Pass an empty list of record IDs
        EmployeeLeaveRequestController.approveRecords(new List<Id>());
        Test.stopTest();
        List<educx__Employee_Leave_Details__c> leaveDetails = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE educx__Leave_Status__c = 'Approved'];
        System.assertEquals(0, leaveDetails.size(), 'No records should have been updated.');
    }
    
    @isTest
    static void testRejectRecords() {
        educx__Employee_Leave_Details__c leaveDetail = [SELECT Id FROM educx__Employee_Leave_Details__c LIMIT 1];
        Test.startTest();
        EmployeeLeaveRequestController.rejectRecords(new List<Id>{leaveDetail.Id});
        Test.stopTest();
        leaveDetail = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE Id = :leaveDetail.Id];
        System.assertEquals('Rejected', leaveDetail.educx__Leave_Status__c, 'The leave status should be rejected.');
    }
    
    @isTest
    static void testRejectRecordsNoRecords() {
        Test.startTest();
        // Pass an empty list of record IDs
        EmployeeLeaveRequestController.rejectRecords(new List<Id>());
        Test.stopTest();
        List<educx__Employee_Leave_Details__c> leaveDetails = [SELECT educx__Leave_Status__c FROM educx__Employee_Leave_Details__c WHERE educx__Leave_Status__c = 'Rejected'];
        System.assertEquals(0, leaveDetails.size(), 'No records should have been updated.');
    }
    
    @isTest
    static void testGetEmployeeLeaveDetails() {
        Test.startTest();
        List<educx__Employee_Leave_Details__c> results = EmployeeLeaveRequestController.getEmployeeLeaveDetails();
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
        List<educx__Employee_Leave_Details__c> results = EmployeeLeaveRequestController.getEmployeeLeaveDetails();
        Test.stopTest();
        System.assertNotEquals(null, results, 'The leave details list should not be null.');
        System.assertEquals(0, results.size(), 'The leave details list should be empty.');
    }
    
    @isTest
    static void testGetEmployeeDetailsExactMatch() {
        Test.startTest();
        // Use the exact name of the employee created in setup
        List<educx__Employees__c> results = EmployeeLeaveRequestController.getEmpDetailsOnSearch('John Doe');
        Test.stopTest();
        System.assertNotEquals(null, results, 'The employee details list should not be null.');
        System.assertEquals(1, results.size(), 'The employee details list should contain one record.');
        System.assertEquals('John Doe', results[0].educx__Employee_Name__c, 'The employee name should be John Doe.');
    }
    
    @isTest
    static void testGetEmployeeDetailsNoMatch() {
        Test.startTest();
        // Use a name that does not match any employee
        List<educx__Employees__c> results = EmployeeLeaveRequestController.getEmpDetailsOnSearch('Nonexistent Name');
        Test.stopTest();
        System.assertNotEquals(null, results, 'The employee details list should not be null.');
        System.assertEquals(0, results.size(), 'The employee details list should be empty.');
    }
    
   
}