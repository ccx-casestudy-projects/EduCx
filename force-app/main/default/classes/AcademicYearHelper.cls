/**
* @description       : 
* @author            : ChangeMeIn@UserSettingsUnder.SFDoc
* @group             : 
* @last modified on  : 08-06-2024
* @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AcademicYearHelper {
    public static void changeStudentAcademicYear(list<educx__Academic_Year__c> AcademicYear,map<id,educx__Academic_Year__c> oldAcademicYeareMap) {
        set<id> studentIds = new  set<id> ();
        List<educx__Student__c> studentsToUpdate = new List<educx__Student__c>();
        if(oldAcademicYeareMap!=null){
            for(educx__Academic_Year__c ay:AcademicYear){
                if(ay.educx__Academic_year__c==oldAcademicYeareMap.get(ay.id).educx__Academic_year__c){
                    return;
                }
                else{
                    studentIds.add(ay.educx__Student__c);
                }
            }
        }
        else{
            for(educx__Academic_Year__c ay:AcademicYear){
                studentIds.add(ay.educx__Student__c);
            }
        }
        List<educx__Student__c> students = [
            SELECT Id, educx__Current_Academic_Year__c, 
            (SELECT educx__Academic_year__c 
             FROM Academic_Years__r 
             ORDER BY educx__Academic_year__c DESC 
             LIMIT 1) 
            FROM educx__Student__c 
            WHERE Id IN :studentIds ];
        for (educx__Student__c student : students) {
            if (student.Academic_Years__r != null && !student.Academic_Years__r.isEmpty()) {
                educx__Academic_Year__c relatedYear = student.Academic_Years__r[0];
                student.educx__Current_Academic_Year__c = relatedYear.educx__Academic_year__c;
                
                studentsToUpdate.add(student);
            }
        }
        if (!studentsToUpdate.isEmpty()) {
            update studentsToUpdate;
        }
    }
}