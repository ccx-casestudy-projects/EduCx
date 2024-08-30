public class StudentUpdateBatch implements Database.Batchable<SObject> {
    private Set<Id> studentIds;
    private Map<Id, educx__Payment__c> paymentMap;
    
    public StudentUpdateBatch(Set<Id> managementQuotaStudentIds,List<educx__Payment__c> studentPayments) {
        this.studentIds = managementQuotaStudentIds;
        system.debug('stdid--->'+studentIds);
        this.paymentMap = new Map<Id, educx__Payment__c>();
        for (educx__Payment__c payment : studentPayments) {
            if (payment.educx__Student__c != null) {
                this.paymentMap.put(payment.educx__Student__c, payment);
            }
        }
    }
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, educx__Agreement_Fee__c, educx__Fee_Type__c, educx__Total_Course_Fee__c
            FROM educx__Student__c
            WHERE Id IN :studentIds AND educx__Agreement_Fee__c!= null
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<educx__Student__c> scope) {
        List<educx__Student__c> studentsToUpdate = new List<educx__Student__c>();
        
        try{
            
        
        
        for (educx__Student__c student : scope) {
            educx__Payment__c payment = paymentMap.get(student.Id);
            system.debug('recs--'+student);
            if (student.educx__Agreement_Fee__c!= null && student.educx__Fee_Type__c == 'Per Course') {
                student.educx__Total_Course_Fee__c = student.educx__Agreement_Fee__c;
                student.educx__Balance_Fee__c = student.educx__Agreement_Fee__c;
                
            }
            else if (student.educx__Fee_Type__c == 'Per Year') {
                student.educx__Total_Course_Fee__c = payment.educx__Management_Fee__c;
                student.educx__Balance_Fee__c =  payment.educx__Management_Fee__c;
            }
            studentsToUpdate.add(student);
        }
        
        if (!studentsToUpdate.isEmpty()) {
            update studentsToUpdate;
        }
        }
        catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    public void finish(Database.BatchableContext bc) {
        //  execution
    }
}