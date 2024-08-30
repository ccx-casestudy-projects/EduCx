/**
@Name                loginController
@TestClass           loginControllerTest
@description       : Student/Employee Logins
@author            : Satya Umesh
@Created on        : 07-19-2024

Modifications Log
Ver   Date         Author            Modification
1.0   07-19-2024   Satya Umesh       Initial Version
**/
public with sharing class loginController {
  @AuraEnabled(Cacheable=true)
  public static List<educx__Password__c> checkPasswordWithUserName(
    String userName,
    String password,
    String typ
  ) {
    return [
      SELECT id, educx__Password__c, educx__Type__c, educx__User_Number__c
      FROM educx__Password__c
      WHERE
        educx__Password__c = :password
        AND educx__User_Number__c = :userName
        AND educx__Type__c = :typ
      LIMIT 1
    ];
  }
  @AuraEnabled(Cacheable=true)
  public static list<educx__Student__c> getStudentDetails(String hallticketNo) {
    return [
      SELECT
        Id,
        educx__Hall_Ticket_No__c,
        educx__Email__c,
        educx__Phone_Number__c,
        educx__Name_of_The_Candidate__c,
        educx__Course_Code__r.Name,
        educx__Course_Code__r.educx__Course_Name__c,
        educx__Course_Code__r.educx__Course__c,
        (SELECT Id, educx__Year__c, educx__Sem__c FROM educx__Academic_Years__r)
      FROM educx__Student__c
      WHERE educx__Hall_Ticket_No__c = :hallticketNo
    ];
  }
  @AuraEnabled(Cacheable=true)
  public static list<educx__Student__c> getStudDetails(Id recordId) {
    return [
      SELECT
        Id,
        educx__Hall_Ticket_No__c,
        educx__Email__c,
        educx__Phone_Number__c,
        educx__Name_of_The_Candidate__c,
        educx__Course_Code__r.Name,
        educx__Course_Code__r.educx__Course_Name__c,
        educx__Course_Code__r.educx__Course__c,
        educx__Fee_Paid__c,
        educx__Balance_Fee__c,
        educx__Total_Course_Fee__c,
        (SELECT Id, educx__Year__c, educx__Sem__c FROM educx__Academic_Years__r)
      FROM educx__Student__c
      WHERE Id = :recordId
    ];
  }
  @AuraEnabled(Cacheable=true)
  public static list<educx__Attendance__c> getStudentAttendance(
    String hallticketNo
  ) {
    return [
      SELECT
        Id,
        educx__Attendance_Status__c,
        educx__Total_Classes_Attended__c,
        educx__Total_Classes_Conducted__c,
        educx__Subject__r.Name,
        (SELECT Id, educx__Months__c FROM educx__AttendanceDetails__r)
      FROM educx__Attendance__c
      WHERE educx__Student_Id__r.educx__Hall_Ticket_No__c = :hallticketNo
      ORDER BY createdDate ASC
    ];
  }
  @AuraEnabled(Cacheable=true)
  public static list<educx__Payment_Details__c> getStudentPayments(
    String hallticketNo
  ) {
    return [
      SELECT
        Id,
        Name,
        educx__Fee_Type__c,
        educx__Amount_Paid__c,
        educx__Payment__r.educx__Year__c,
        educx__Payment__r.educx__Total_Amount_Paid__c,
        educx__Payment__r.educx__Total_Balance__c,
        CreatedDate
      FROM educx__Payment_Details__c
      WHERE
        educx__Payment__r.educx__Student__r.educx__Hall_Ticket_No__c = :hallticketNo
    ];
  }
  @AuraEnabled(Cacheable=true)
  public static list<educx__Approve_Request__c> getStudentRequests(
    String hallticketNo
  ) {
    return [
      SELECT
        Id,
        educx__Reason__c,
        educx__Document_Type__c,
        educx__Status__c,
        educx__Other_Reason__c,
        CreatedDate
      FROM educx__Approve_Request__c
      WHERE educx__Student_ID__r.educx__Hall_Ticket_No__c = :hallticketNo
    ];
  }
}