/**
@Name                EmployeeController
@TestClass           EmployeeControllerTest
@description       : Employee Details
@author            : Abhinayani
@Created on  	   : 07-19-2024

Modifications Log
Ver   Date         Author            Modification
1.0   07-25-2024   Abhinayani      Initial Version
**/
public without sharing class EmployeeController {
  //For displaying the list of employee records
  @AuraEnabled(cacheable=true)
  public static List<educx__Employees__c> displayEmployeeRecords() {
    List<educx__Employees__c> empDetails = new List<educx__Employees__c>();
    try {
      empDetails = [SELECT Id,Name,educx__Employee_Name__c,educx__Pan__c,educx__Phone__c,educx__Photo__c,educx__Date_of_Birth__c,educx__Father_s_Name__c,
                   educx__Years_of_Experience__c,educx__Is_Ratified__c,
          educx__Employee_Type__c,
          educx__Status__c,
          educx__Date_of_joining__c,
          educx__Aadhar_Number__c,
          educx__Email__c,
          educx__Specialization__c,
          educx__Designation__c,
          educx__Qualifications__c
        FROM educx__Employees__c
        WHERE educx__Status__c IN ('Working', 'Resigned')
      ];
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error fetching Employee details: ' + e.getMessage()
      );
    }
    return empDetails;
  }

  //Displaying employee details on header
  public static string empId;
  @AuraEnabled(cacheable=true)
  public static List<educx__Employees__c> getEmployeeDetailsOnHeader(
    string employeeId
  ) {
    try {
      educx__Employees__c emp = [
        SELECT
          Id,
          Name,
          educx__Email__c,
          educx__Employee_Name__c,
          educx__Phone__c,
          educx__Designation__c,
          RecordType.DeveloperName,
          RecordType.Name
        FROM educx__Employees__c
        WHERE Name = :employeeId
        LIMIT 1
      ];
      empId = emp.Id;

      return [
        SELECT
          Id,
          Name,
          educx__Email__c,
          educx__Employee_Name__c,
          educx__Phone__c,
          educx__Designation__c,
        RecordType.DeveloperName,
          RecordType.Name
        FROM educx__Employees__c
        WHERE Name = :employeeId
        LIMIT 1
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  //View Employee details
  @AuraEnabled(cacheable=true)
  public static educx__Employees__c viewEmployeeDetails(string recordId) {
    try {
      return [
        SELECT
          Id,
          Name,
          educx__Employee_Name__c,
          educx__Pan__c,
          educx__Phone__c,
          educx__Photo__c,
          educx__Date_of_Birth__c,
          educx__Father_s_Name__c,
          educx__Years_of_Experience__c,
          educx__Is_Ratified__c,
          educx__Employee_Type__c,
          educx__Status__c,
          educx__Aadhar_Number__c,
          educx__Email__c,
          educx__Specialization__c,
          educx__Designation__c,
          educx__Qualifications__c
        FROM educx__Employees__c
        WHERE id = :recordId
        LIMIT 1
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  //display Associated subjects to employee
  @AuraEnabled(cacheable=true)
  public static List<educx__Faculty_Subjects__c> getFacultySubjects(
    String employeeId
  ) {
    try {
      return [
        SELECT
          Id,
          educx__Course__r.educx__Course_Name__c,
          educx__Semester__c,
          educx__Year__c,
          educx__Subject__r.educx__Subject_Name__c
        FROM educx__Faculty_Subjects__c
        WHERE educx__Employee__c = :employeeId
      ];
    } catch (Exception e) {
      throw new AuraHandledException(
        'Unable to fetch faculty subject details: ' + e.getMessage()
      );
    }
  }

  //Get Leave Account For Leave Request
  @AuraEnabled
  public static educx__Employee_Leave_Account__c getEmpLeaveAccForLeaveRequest(
    String employeeId
  ) {
    try {
      return [
        SELECT Id, Name
        FROM educx__Employee_Leave_Account__c
        WHERE educx__Employee__c = :employeeId
        LIMIT 1
      ];
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error fetching leave account: ' + e.getMessage()
      );
    }
  }

  //Employee Id in Leave Request
  @AuraEnabled
  public static educx__Employees__c getEmployeeDetails(String employeeId) {
    try {
      return [
        SELECT Id, Name
        FROM educx__Employees__c
        WHERE Id = :employeeId
        LIMIT 1
      ];
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error fetching employee details: ' + e.getMessage()
      );
    }
  }

  //create Leave Request Record
  @AuraEnabled
  public static list<educx__Employee_Leave_Details__c> createEmployeeLeaveDetail(
    String employeeId,
    String leaveAccountId,
    Date fromDate,
    Date toDate,
    String reason,
    Date appliedDate
  ) {
    try {
      educx__Employee_Leave_Details__c leaveDetail = new educx__Employee_Leave_Details__c();
      leaveDetail.educx__Employee__c = employeeId;
      leaveDetail.educx__Employee_Leave_Account__c = leaveAccountId;
      leaveDetail.educx__From_Date__c = fromDate;
      leaveDetail.educx__To_Date__c = toDate;
      leaveDetail.educx__Reason__c = reason;
      leaveDetail.educx__Applied_Date__c = appliedDate;

      insert leaveDetail;

      return [
        SELECT Id, educx__Number_of_Days_Taken__c
        FROM educx__Employee_Leave_Details__c
        WHERE Id = :leaveDetail.Id
        LIMIT 1
      ];
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error creating leave detail: ' + e.getMessage()
      );
    }
  }

  //Associate Subject to Employee
  @AuraEnabled(cacheable=true)
  public static List<educx__Course_Subject__c> populateSubjectDetails(
    Id courseId,
    String Year,
    string sem
  ) {
    //System.debug('courseId: ' + courseId);
    List<educx__Course_Subject__c> courseSubjects = [
      SELECT
        Id,
        educx__Course__c,
        educx__Subject__r.educx__Subject_Name__c,
        educx__Year__c,
        educx__Semester__c
      FROM educx__Course_Subject__c
      WHERE
        educx__Course__c = :courseId
        AND educx__Year__c = :Year
        AND educx__Semester__c = :sem
    ];
    System.debug('courseSubjects: ' + courseSubjects);
    return courseSubjects;
  }

  //To display leave details for employee
  @AuraEnabled(cacheable=true)
  public static educx__Employee_Leave_Account__c getEmployeeLeaveAccount(
    Id employeeId
  ) {
    return [
      SELECT
        Id,
        educx__Employee__c,
        educx__Number_of_Availed_Leaves__c,
        educx__Number_of_Balance_Leaves__c,
        educx__Total_Leaves_In_Account__c,
        educx__Loss_of_Pay__c
      FROM educx__Employee_Leave_Account__c
      WHERE educx__Employee__c = :employeeId
      LIMIT 1
    ];
  }

  //Approval Records
  @AuraEnabled(cacheable=false)
  public static void approveRecords(List<Id> recordIds) {
    if (recordIds.isEmpty()) {
      return;
    }
    List<educx__Employee_Leave_Details__c> requestsToUpdate = [
      SELECT Id, educx__Leave_Status__c
      FROM educx__Employee_Leave_Details__c
      WHERE Id IN :recordIds AND educx__Leave_Status__c != 'Approved'
    ];
    for (educx__Employee_Leave_Details__c request : requestsToUpdate) {
      request.educx__Leave_Status__c = 'Approved';
    }
    if (!requestsToUpdate.isEmpty()) {
      update requestsToUpdate;
    }
  }

  //Rejected Records
  @AuraEnabled(cacheable=false)
  public static void rejectRecords(List<Id> recordIds) {
    if (recordIds.isEmpty()) {
      return;
    }
    List<educx__Employee_Leave_Details__c> requestsToUpdate = [
      SELECT Id, educx__Leave_Status__c
      FROM educx__Employee_Leave_Details__c
      WHERE Id IN :recordIds AND educx__Leave_Status__c != 'Rejected'
    ];
    for (educx__Employee_Leave_Details__c request : requestsToUpdate) {
      request.educx__Leave_Status__c = 'Rejected';
    }
    if (!requestsToUpdate.isEmpty()) {
      update requestsToUpdate;
    }
  }

  //Display All leave details records in Data table
  @AuraEnabled(cacheable=true)
  public static List<Employee_Leave_Details__c> getEmployeeLeaveDetails() {
    try {
      return [
        SELECT
          Id,
          educx__Employee__r.Name,
          educx__Employee__r.Employee_Name__c,
          educx__From_Date__c,
          educx__To_Date__c,
          educx__Reason__c,
          educx__Applied_Date__c,
          educx__Leave_Status__c
        FROM Employee_Leave_Details__c
      ];
    } catch (Exception e) {
      throw new AuraHandledException(
        'Unable to fetch leave details: ' + e.getMessage()
      );
    }
  }

  //Search Employee With ID or Name
  @AuraEnabled(cacheable=true)
  public static List<educx__Employees__c> getEmpDetailsOnSearch(
    String searchTerm
  ) {
    List<educx__Employees__c> results = new List<educx__Employees__c>();

    if (searchTerm != null && searchTerm.trim() != '') {
      results = [
        SELECT
          Id,
          Name,
          educx__Employee_Name__c,
          educx__Email__c,
          educx__Phone__c,
          educx__Designation__c,
          educx__Photo__c
        FROM educx__Employees__c
        WHERE Name = :searchTerm
        LIMIT 1
      ];

      if (results.isEmpty()) {
        String searchPattern = '%' + searchTerm + '%';
        results = [
          SELECT
            Id,
            Name,
            educx__Employee_Name__c,
            educx__Email__c,
            educx__Phone__c,
            educx__Designation__c,
            educx__Photo__c
          FROM educx__Employees__c
          WHERE educx__Employee_Name__c LIKE :searchPattern
          LIMIT 10
        ];
      }
    }

    return results;
  }
    
    @AuraEnabled(cacheable=true)
public static List<educx__Employees__c> getAllEmployeesOnSearch() {
    return [
        SELECT
            Id,
            Name,
            educx__Employee_Name__c,
            educx__Email__c,
            educx__Phone__c,
            educx__Designation__c,
            educx__Photo__c
        FROM educx__Employees__c
    ];
}
}