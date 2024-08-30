/**
@Name              : loginControllerTest
@description       : Student/Employee Logins & Requests,Student Payments.
@author            : Satya Umesh
@Created on        : 08-12-2024

Modifications Log
Ver   Date         Author            Modification
1.0   08-12-2024   Satya Umesh       Initial Version
**/

@istest
public class loginControllerTest {
    @testsetup
    public static Void setUpData(){
		Date dateOfBirth=Date.newInstance(2004,08,09);
		Date joiningDate=Date.newInstance(2024,07,09);
		
		educx__Course__c cours=new educx__Course__c();
			cours.Name='420';
			cours.educx__Course_Duration__c='2 Years';
			cours.educx__Course_Level__c='UG';
			cours.educx__Course__c='B.A.';
			cours.educx__Course_Name__c='Economics/Pol.Science/History';
			cours.educx__Medium__c='English';
		insert cours;
		
        educx__Student__c stud=new educx__Student__c();
			stud.educx__Name_of_The_Candidate__c='TestClass Student';
			stud.educx__Aadhar_Number__c='1234 5678 1289';
			stud.educx__Admission_Type__c='Convenor Quota';
			stud.educx__ICET_Rank__c='1500';
			stud.educx__ICET_Hall_Ticket_No__c='2437124607';
			stud.educx__Identification_Mark_1__c='A Mole On Left hand';
			stud.educx__Identification_Mark_2__c='A Mole On Forehead';
			stud.educx__IsFirstYear__c=true;
			stud.educx__Date_of_Birth__c=dateOfBirth;
			stud.educx__Gender__c='Male';
			stud.educx__Email__c='educx@gmail.com';
			stud.educx__Phone_Number__c='9381439715';
            stud.educx__Father_Phone__c='6303279607';
			stud.educx__Year__c='1st Year';
			stud.educx__SSC_Registration_No__c='2259245606';
			stud.educx__SSC_Year_of_Passing__c='2022';
			stud.educx__Course__c='B.A.';
			stud.educx__Course_Code__c=cours.Id;
			stud.educx__Semester__c='I';
			stud.educx__Joining_Date__c=joiningDate;
			stud.educx__Parent_Income__c=150000;
        insert stud;
        
        educx__Student__c stud1=[Select Id,educx__Hall_Ticket_No__c,
                                educx__SSC_Registration_No__c From educx__Student__c 
                                Where educx__SSC_Registration_No__c='2259245606'];
            stud1.educx__Hall_Ticket_No__c='24071A12H7';
        update stud1;
        
        educx__Attendance__c stuAtten=new educx__Attendance__c();
            stuAtten.educx__Student_Id__c=stud.Id;
            stuAtten.educx__Course__c=cours.Id;
            stuAtten.educx__Semester__c='I';
        insert stuAtten;
        
        educx__Approve_Request__c stuAproveReq=new educx__Approve_Request__c();
            stuAproveReq.educx__Student_ID__c=stud.Id;
            stuAproveReq.educx__Document_Type__c='Bonafide Certificate';
            stuAproveReq.educx__Reason__c='Graduated';
        insert stuAproveReq;
    }
    @istest
    public static Void checkAllMethods(){
        educx__Student__c stud=[Select Id,educx__Hall_Ticket_No__c,
                                educx__SSC_Registration_No__c From educx__Student__c 
                                Where educx__SSC_Registration_No__c='2259245606'];
        
        Test.starttest();
            List<educx__Password__c> pswd=loginController.checkPasswordWithUserName
                                            (stud.educx__Hall_Ticket_No__c,'Vivekananda@123','Student');
            List<educx__Student__c> studRec=loginController.getStudentDetails
                                            (stud.educx__Hall_Ticket_No__c);
            List<educx__Student__c> studRecId=loginController.getStudDetails
                                            (stud.id);
            List<educx__Attendance__c> studAttenRec=loginController.getStudentAttendance
                                            (stud.educx__Hall_Ticket_No__c);
            List<educx__Payment_Details__c> studPayments=loginController.getStudentPayments
                                            (stud.educx__Hall_Ticket_No__c);
            list<educx__Approve_Request__c> stuRequests=loginController.getStudentRequests
                                            (stud.educx__Hall_Ticket_No__c);
        Test.stoptest();
        
        Assert.areEqual('Vivekananda@123', pswd[0].educx__Password__c);
        Assert.areEqual('9381439715', studRec[0].educx__Phone_Number__c);
        Assert.areEqual('TestClass Student', studRecId[0].educx__Name_of_The_Candidate__c);
        Assert.areEqual(1, studAttenRec.size());        
        Assert.areNotEqual(1, studPayments.size());
        Assert.areEqual(1,stuRequests.size());
    }
}