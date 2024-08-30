/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-06-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AcademicYearTriggerHandler {
    public static void runTrigger(
    System.TriggerOperation operation,
    List<educx__Academic_Year__c> newAcademicYear,
    Map<Id, educx__Academic_Year__c> oldAcademicYeareMap,
    List<educx__Academic_Year__c> oldAcademicYear
  ) {
    switch on operation {
      when AFTER_INSERT {
       AcademicYearHelper.changeStudentAcademicYear(newAcademicYear,null);
      }
      when AFTER_UPDATE {
        AcademicYearHelper.changeStudentAcademicYear(newAcademicYear,oldAcademicYeareMap);
       }
       when AFTER_DELETE {
        AcademicYearHelper.changeStudentAcademicYear(oldAcademicYear,null);
       }
      }
    }
  }