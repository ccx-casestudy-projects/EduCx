trigger PaymentDetailTrigger on educx__Payment_Details__c (after insert, after update, after delete) 
{
    
	 if(trigger.isAfter && trigger.isInsert)
    {
        PaymentDetailTriggerHandler.onAfterInsert(trigger.new);
	}
    
    if(trigger.isAfter && trigger.isUpdate)
    {
        PaymentDetailTriggerHandler.onAfterUpdate(trigger.new,trigger.oldmap);
	}
    if(trigger.isAfter && trigger.isDelete)
    {
         PaymentDetailTriggerHandler.handlePaymentDetailDeletions(Trigger.oldMap.values());
	}
}