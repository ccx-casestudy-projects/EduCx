public class FeeStructureController {
  @AuraEnabled(cacheable=true)
  public static List<educx__Fee_Structure__c> getAllFeeStructure() {
    List<educx__Fee_Structure__c> feeStructureData = new List<educx__Fee_Structure__c>();
    try {
      feeStructureData = [SELECT Id, Name, educx__CourseCode__c, educx__CourseCode__r.Name, educx__CourseCode__r.educx__Course__c,
                          RecordTypeId, educx__G_O_Revised__c, educx__CourseCode__r.educx__Course_Name__c,educx__Year__c, educx__Admission_Fee__c, 
                          educx__Tution_Fee__c, educx__Special_Fee__c,educx__Total_Fee__c,educx__Management_Fee__c 
                          FROM educx__Fee_Structure__c ORDER BY educx__CourseCode__r.educx__Course_Name__c,educx__Year__c];
    } catch (Exception e) {
      System.debug('Error in getDetails method: ' + e.getMessage());
      throw new AuraHandledException('Error fetching fee structure details: ' + e.getMessage());
    }
    return feeStructureData;
  }

    @AuraEnabled(cacheable=true)
    public static Map<id,String> getRecordTypes(){
      Map<id,String> options = new Map<id,String>();

      List<RecordType> recordtype = [Select id, Name, SobjectType 
                                      FROM RecordType WHERE SobjectType='educx__Fee_Structure__c'];
            for (RecordType rec: recordtype){
                  options.put(rec.id, rec.Name);
            }
            return options;
    }

   @AuraEnabled
    public static educx__Fee_Structure__c saveFeeStructure(educx__Fee_Structure__c feeStructureUpsert) {
        try {
            upsert feeStructureUpsert;
            return feeStructureUpsert;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving Fee Structure: ' + e.getMessage());
        }
    }

  @AuraEnabled
  public static void deleteFeeStructure(List<String> feeStructureIds) {
    try {
      List<educx__Fee_Structure__c> structureToDelete = [SELECT Id FROM educx__Fee_Structure__c WHERE Id IN :feeStructureIds];
      if (!structureToDelete.isEmpty()) {
        delete structureToDelete;
      }
    } catch (Exception e) {
      throw new AuraHandledException('Error deleting Fee Structure: ' + e.getMessage());
    }
  }
}