trigger PaymentTrigger on educx__Payment__c (after insert , after update) {
    
     if(trigger.isAfter && trigger.isInsert)
    {
        PaymentTriggerHandler.handlePayments(trigger.new);
	}
    
     if(trigger.isAfter && trigger.isUpdate)
    {
        PaymentTriggerHandler.updateStudentPaymentInfo(trigger.new);
	}

}