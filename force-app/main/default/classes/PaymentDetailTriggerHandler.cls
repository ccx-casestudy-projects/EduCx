public class PaymentDetailTriggerHandler {
    public static void onAfterInsert(List<educx__Payment_Details__c> paymentDetails) {
        try {
            Map<String, Id> paymentDetailRecordTypeMap = new Map<String, Id>();
            Map<String, Id> paymentRecordTypeMap = new Map<String, Id>();
            Set<Id> processedPaymentIds = new Set<Id>();
            
            for (RecordType rt : [SELECT Id, DeveloperName, SObjectType FROM RecordType WHERE SObjectType IN ('educx__Payment_Details__c', 'educx__Payment__c')]) {
                if (rt.SObjectType == 'educx__Payment_Details__c') {
                    paymentDetailRecordTypeMap.put(rt.DeveloperName, rt.Id);
                } 
                if (rt.SObjectType == 'educx__Payment__c') {
                    paymentRecordTypeMap.put(rt.DeveloperName, rt.Id);
                }
            }
            
            
            Set<Id> paymentIds = new Set<Id>();
            for (educx__Payment_Details__c detail : paymentDetails) {
                paymentIds.add(detail.educx__Payment__c);
                system.debug('payment id--->'+detail.educx__Payment__c);
            }
            
            
            Map<Id, educx__Payment__c> paymentMap = new Map<Id, educx__Payment__c>([
                SELECT Id, educx__Student__c, RecordTypeId, educx__Special_Fee_Paid__c, educx__Tution_Fee_Paid__c, educx__Admission_Fee_Paid__c,
                educx__Management_Fee_Paid__c
                FROM educx__Payment__c
                WHERE Id IN :paymentIds
            ]);
            
            system.debug(' paymentmap--'+paymentMap);
            
            List<educx__Income__c> incomesToCreate = new List<educx__Income__c>();
            List<educx__Payment__c> paymentsToUpdate = new List<educx__Payment__c>();
            
            
            for (educx__Payment_Details__c detail : paymentDetails) {
                Id paymentId = detail.educx__Payment__c;
                Decimal amountPaid = detail.educx__Amount_Paid__c;
                String feeType = detail.educx__Fee_Type__c;
                educx__Payment__c payment = paymentMap.get(paymentId);
                
                if (payment != null) {
                    
                    educx__Income__c income = new educx__Income__c();
                    income.educx__Amount_Received__c = detail.educx__Amount_Paid__c;
                    income.educx__Student_Id__c = payment.educx__Student__c;
                    income.educx__Date_Received__c = detail.CreatedDate;
                    income.educx__Source__c = 'Student Fee';
                    income.educx__Receipt_Number__c = detail.Name;
                    incomesToCreate.add(income);
                    
                    
                    if (payment.RecordTypeId == paymentRecordTypeMap.get('Management_Record_Type')) {
                        if (feeType == 'Management Fee') {
                            payment.educx__Management_Fee_Paid__c = (payment.educx__Management_Fee_Paid__c != null ? payment.educx__Management_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Transportation Fee') {
                            payment.educx__Management_Transport_Fee_Paid__c = (payment.educx__Management_Transport_Fee_Paid__c != null ? payment.educx__Management_Transport_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Other Fee') {
                            payment.educx__Management_Other_Fee_Paid__c = (payment.educx__Management_Other_Fee_Paid__c != null ? payment.educx__Management_Other_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Exam Fee') {
                            payment.educx__Management_Exam_Fee_Paid__c = (payment.educx__Management_Exam_Fee_Paid__c != null ? payment.educx__Management_Exam_Fee_Paid__c : 0) + amountPaid;
                        }
                        
                    } else if (payment.RecordTypeId == paymentRecordTypeMap.get('Convenor_Record_Type')) {
                        if (feeType == 'Special Fee') {
                            payment.educx__Special_Fee_Paid__c = (payment.educx__Special_Fee_Paid__c != null ? payment.educx__Special_Fee_Paid__c : 0) + amountPaid;
                        } else if (feeType == 'Tution Fee') {
                            payment.educx__Tution_Fee_Paid__c = (payment.educx__Tution_Fee_Paid__c != null ? payment.educx__Tution_Fee_Paid__c : 0) + amountPaid;
                        } else if (feeType == 'Admission Fee') {
                            payment.educx__Admission_Fee_Paid__c = (payment.educx__Admission_Fee_Paid__c != null ? payment.educx__Admission_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Univeristy Fee') {
                            payment.educx__Convenor_University_Fee_Paid__c = (payment.educx__Convenor_University_Fee_Paid__c != null ? payment.educx__Convenor_University_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Transportation Fee') {
                            payment.educx__Convenor_Transport_Fee_Paid__c = (payment.educx__Convenor_Transport_Fee_Paid__c != null ? payment.educx__Convenor_Transport_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Other Fee') {
                            payment.educx__Convenor_Other_Fee_Paid__c = (payment.educx__Convenor_Other_Fee_Paid__c != null ? payment.educx__Convenor_Other_Fee_Paid__c : 0) + amountPaid;
                        }
                        else if (feeType == 'Exam Fee') {
                            payment.educx__Convenor_Exam_Fee_Paid__c = (payment.educx__Convenor_Exam_Fee_Paid__c != null ? payment.educx__Convenor_Exam_Fee_Paid__c : 0) + amountPaid;
                        }
                    }
                    if (!processedPaymentIds.contains(payment.Id)) {
                        paymentsToUpdate.add(payment);
                        for(educx__Payment__c py:paymentsToUpdate)
                        {	
                            system.debug('pids--'+py); 
                        }
                        processedPaymentIds.add(payment.Id); 
                    }
                }
            }
            
            if (!incomesToCreate.isEmpty()) {
                insert incomesToCreate;
            }
            
            if (!paymentsToUpdate.isEmpty()) {
                update paymentsToUpdate;
            }
        } catch (Exception e) {
            System.debug('Error in PaymentDetailTriggerHandler: ' + e.getMessage());
        }
    }
    
    
    public static void onAfterUpdate(List<educx__Payment_Details__c> newDetails, Map<Id, educx__Payment_Details__c> oldDetailsMap) {
    try {
        List<educx__Income__c> incomesToUpdate = new List<educx__Income__c>();
        Set<Id> paymentIds = new Set<Id>();
        Map<String, Id> paymentRecordTypeMap = new Map<String, Id>();
        Map<String, Decimal> receiptAmountMap = new Map<String, Decimal>();

        // Calculate the new total amounts for each receipt number
        for (educx__Payment_Details__c detail : newDetails) {
            paymentIds.add(detail.educx__Payment__c);
            if (receiptAmountMap.containsKey(detail.Name)) {
                receiptAmountMap.put(detail.Name, receiptAmountMap.get(detail.Name) + detail.educx__Amount_Paid__c);
            } else {
                receiptAmountMap.put(detail.Name, detail.educx__Amount_Paid__c);
            }
        }

        // Update the educx__Income__c records
        for (educx__Income__c income : [
            SELECT Id, educx__Receipt_Number__c, educx__Amount_Received__c
            FROM educx__Income__c
            WHERE educx__Receipt_Number__c IN :receiptAmountMap.keySet()
        ]) {
            if (receiptAmountMap.containsKey(income.educx__Receipt_Number__c)) {
                income.educx__Amount_Received__c = receiptAmountMap.get(income.educx__Receipt_Number__c);
                incomesToUpdate.add(income);
            }
        }

        // Get the record types
        for (RecordType rt : [
            SELECT Id, DeveloperName, SObjectType
            FROM RecordType
            WHERE SObjectType = 'educx__Payment__c'
        ]) {
            paymentRecordTypeMap.put(rt.DeveloperName, rt.Id);
        }

        // Fetch the payment records
        Map<Id, educx__Payment__c> paymentMap = new Map<Id, educx__Payment__c>([
            SELECT Id, RecordTypeId,
                educx__Management_Fee_Paid__c, educx__Management_Transport_Fee_Paid__c, educx__Management_Other_Fee_Paid__c, educx__Management_Exam_Fee_Paid__c,
                educx__Special_Fee_Paid__c, educx__Tution_Fee_Paid__c, educx__Admission_Fee_Paid__c, educx__Convenor_University_Fee_Paid__c,
                educx__Convenor_Transport_Fee_Paid__c, educx__Convenor_Other_Fee_Paid__c, educx__Convenor_Exam_Fee_Paid__c
            FROM educx__Payment__c 
            WHERE Id IN :paymentIds
        ]);

        // Initialize the map for payment records
        Map<Id, Map<String, Decimal>> paymentFeeTypeMap = new Map<Id, Map<String, Decimal>>();
        for (Id paymentId : paymentIds) {
            paymentFeeTypeMap.put(paymentId, new Map<String, Decimal>{
                'Management Fee' => 0,
                'Transportation Fee' => 0,
                'Other Fee' => 0,
                'Exam Fee' => 0,
                'Special Fee' => 0,
                'Tution Fee' => 0,
                'Admission Fee' => 0,
                'University Fee' => 0
            });
        }

        // Sum up the amounts for each fee type and track changes
        for (educx__Payment_Details__c detail : newDetails) {
            Id paymentId = detail.educx__Payment__c;
            String feeType = detail.educx__Fee_Type__c;
            Decimal newAmount = detail.educx__Amount_Paid__c;
            
            if (paymentFeeTypeMap.containsKey(paymentId)) {
                Decimal oldAmount = 0;
                educx__Payment_Details__c oldDetail = oldDetailsMap.get(detail.Id);
                if (oldDetail != null) {
                    oldAmount = oldDetail.educx__Amount_Paid__c;
                }
                Decimal currentAmount = paymentFeeTypeMap.get(paymentId).get(feeType);
                paymentFeeTypeMap.get(paymentId).put(feeType, currentAmount - oldAmount + newAmount);
            }
        }

        List<educx__Payment__c> paymentsToUpdate = new List<educx__Payment__c>();

        // Update the payments with the calculated totals
        for (educx__Payment__c payment : paymentMap.values()) {
            Map<String, Decimal> feeTypeAmounts = paymentFeeTypeMap.get(payment.Id);

            if (payment.RecordTypeId == paymentRecordTypeMap.get('Management_Record_Type')) {
                if (feeTypeAmounts.containsKey('Management Fee')) {
                    payment.educx__Management_Fee_Paid__c = feeTypeAmounts.get('Management Fee');
                }
                if (feeTypeAmounts.containsKey('Transportation Fee')) {
                    payment.educx__Management_Transport_Fee_Paid__c +=  feeTypeAmounts.get('Transportation Fee');
                }
                if (feeTypeAmounts.containsKey('Other Fee')) {
                    payment.educx__Management_Other_Fee_Paid__c += feeTypeAmounts.get('Other Fee');
                }
                if (feeTypeAmounts.containsKey('Exam Fee')) {
                    payment.educx__Management_Exam_Fee_Paid__c += feeTypeAmounts.get('Exam Fee');
                }
            } 
            else if (payment.RecordTypeId == paymentRecordTypeMap.get('Convenor_Record_Type')) {
                if (feeTypeAmounts.containsKey('Special Fee')) {
                    payment.educx__Special_Fee_Paid__c += feeTypeAmounts.get('Special Fee');
                }
                if (feeTypeAmounts.containsKey('Tution Fee')) {
                    payment.educx__Tution_Fee_Paid__c += feeTypeAmounts.get('Tution Fee');
                }
                if (feeTypeAmounts.containsKey('Admission Fee')) {
                    payment.educx__Admission_Fee_Paid__c += feeTypeAmounts.get('Admission Fee');
                }
                if (feeTypeAmounts.containsKey('University Fee')) {
                    payment.educx__Convenor_University_Fee_Paid__c += feeTypeAmounts.get('University Fee');
                }
                if (feeTypeAmounts.containsKey('Transportation Fee')) {
                    payment.educx__Convenor_Transport_Fee_Paid__c += feeTypeAmounts.get('Transportation Fee');
                }
                if (feeTypeAmounts.containsKey('Other Fee')) {
                    payment.educx__Convenor_Other_Fee_Paid__c += feeTypeAmounts.get('Other Fee');
                }
                if (feeTypeAmounts.containsKey('Exam Fee')) {
                    payment.educx__Convenor_Exam_Fee_Paid__c += feeTypeAmounts.get('Exam Fee');
                }
            }

            paymentsToUpdate.add(payment);
        }

        // Update the payments and incomes
        if (!paymentsToUpdate.isEmpty()) {
            update paymentsToUpdate;
        }
        if (!incomesToUpdate.isEmpty()) {
            update incomesToUpdate;
        }
    } catch (Exception e) {
        System.debug('Error in PaymentDetailTriggerHandler onAfterUpdate: ' + e.getMessage());
    }
}




    
    
  public static void handlePaymentDetailDeletions(List<educx__Payment_Details__c> oldDetailsList) {
    
    Map<Id, Map<String, Decimal>> paymentIdToFeeAmountMap = new Map<Id, Map<String, Decimal>>();
	List<educx__Income__c> incomesToDelete = new List<educx__Income__c>();
    Map<String, Id> paymentRecordTypeMap = new Map<String, Id>();
    Set<String> receiptNames = new Set<String>();
    

    for (RecordType rt : [SELECT Id, DeveloperName, SObjectType FROM RecordType WHERE SObjectType = 'educx__Payment__c']) {
        paymentRecordTypeMap.put(rt.DeveloperName, rt.Id);
    }

    
      
      
    for (educx__Payment_Details__c detail : oldDetailsList) {        
        receiptNames.add(detail.Name);
        Id paymentId = detail.educx__Payment__c;
        String feeType = detail.educx__Fee_Type__c;
        Decimal amountPaid = detail.educx__Amount_Paid__c;

        if (!paymentIdToFeeAmountMap.containsKey(paymentId)) {
            paymentIdToFeeAmountMap.put(paymentId, new Map<String, Decimal>());
        }
        Map<String, Decimal> feeAmountMap = paymentIdToFeeAmountMap.get(paymentId);

        if (!feeAmountMap.containsKey(feeType)) {
            feeAmountMap.put(feeType, 0);
        }
        feeAmountMap.put(feeType, feeAmountMap.get(feeType) - amountPaid);
    }

    
    if (!paymentIdToFeeAmountMap.isEmpty()) {
        List<educx__Payment__c> paymentsToUpdate = [
            SELECT Id, RecordTypeId,
                educx__Management_Fee_Paid__c, educx__Management_Transport_Fee_Paid__c, educx__Management_Other_Fee_Paid__c, educx__Management_Exam_Fee_Paid__c,
                educx__Special_Fee_Paid__c, educx__Tution_Fee_Paid__c, educx__Admission_Fee_Paid__c, educx__Convenor_University_Fee_Paid__c,
                educx__Convenor_Transport_Fee_Paid__c, educx__Convenor_Other_Fee_Paid__c, educx__Convenor_Exam_Fee_Paid__c
            FROM educx__Payment__c 
            WHERE Id IN :paymentIdToFeeAmountMap.keySet()
        ];
        
        

        for (educx__Payment__c payment : paymentsToUpdate) 
        {
            String recordType = payment.RecordTypeId;
            Map<String, Decimal> feeAmountMap = paymentIdToFeeAmountMap.get(payment.Id);

            if (recordType == paymentRecordTypeMap.get('Management_Record_Type')) 
            {
                if (feeAmountMap.containsKey('Management Fee')) 
                {
                    payment.educx__Management_Fee_Paid__c = (payment.educx__Management_Fee_Paid__c != null ? payment.educx__Management_Fee_Paid__c : 0) + feeAmountMap.get('Management Fee');
                }
                if (feeAmountMap.containsKey('Transportation Fee')) 
                {
                    payment.educx__Management_Transport_Fee_Paid__c = (payment.educx__Management_Transport_Fee_Paid__c != null ? payment.educx__Management_Transport_Fee_Paid__c : 0) + feeAmountMap.get('Transportation Fee');
                }
                if (feeAmountMap.containsKey('Other Fee')) 
                {
                    payment.educx__Management_Other_Fee_Paid__c = (payment.educx__Management_Other_Fee_Paid__c != null ? payment.educx__Management_Other_Fee_Paid__c : 0) + feeAmountMap.get('Other Fee');
                }
                if (feeAmountMap.containsKey('Exam Fee')) 
                {
                    payment.educx__Management_Exam_Fee_Paid__c = (payment.educx__Management_Exam_Fee_Paid__c != null ? payment.educx__Management_Exam_Fee_Paid__c : 0) + feeAmountMap.get('Exam Fee');
                }
            } 
            
            else if (recordType == paymentRecordTypeMap.get('Convenor_Record_Type')) {
                if (feeAmountMap.containsKey('Special Fee')) 
                {
                    payment.educx__Special_Fee_Paid__c = (payment.educx__Special_Fee_Paid__c != null ? payment.educx__Special_Fee_Paid__c : 0) + feeAmountMap.get('Special Fee');
                }
                if (feeAmountMap.containsKey('Tution Fee')) 
                {
                    payment.educx__Tution_Fee_Paid__c = (payment.educx__Tution_Fee_Paid__c != null ? payment.educx__Tution_Fee_Paid__c : 0) + feeAmountMap.get('Tution Fee');
                }
                if (feeAmountMap.containsKey('Admission Fee')) 
                {
                    payment.educx__Admission_Fee_Paid__c = (payment.educx__Admission_Fee_Paid__c != null ? payment.educx__Admission_Fee_Paid__c : 0) + feeAmountMap.get('Admission Fee');
                }
                if (feeAmountMap.containsKey('Univeristy Fee')) 
                {
                    payment.educx__Convenor_University_Fee_Paid__c = (payment.educx__Convenor_University_Fee_Paid__c != null ? payment.educx__Convenor_University_Fee_Paid__c : 0) + feeAmountMap.get('Univeristy Fee');
                }
                if (feeAmountMap.containsKey('Transportation Fee')) 
                {
                    payment.educx__Convenor_Transport_Fee_Paid__c = (payment.educx__Convenor_Transport_Fee_Paid__c != null ? payment.educx__Convenor_Transport_Fee_Paid__c : 0) + feeAmountMap.get('Transportation Fee');
                }
                if (feeAmountMap.containsKey('Other Fee')) 
                {
                    payment.educx__Convenor_Other_Fee_Paid__c = (payment.educx__Convenor_Other_Fee_Paid__c != null ? payment.educx__Convenor_Other_Fee_Paid__c : 0) + feeAmountMap.get('Other Fee');
                }
                if (feeAmountMap.containsKey('Exam Fee')) 
                {
                    payment.educx__Convenor_Exam_Fee_Paid__c = (payment.educx__Convenor_Exam_Fee_Paid__c != null ? payment.educx__Convenor_Exam_Fee_Paid__c : 0) + feeAmountMap.get('Exam Fee');
                }
            }
        }
        
        for(educx__Income__c incRecToDelete:[
        SELECT Id,educx__Receipt_Number__c
        FROM educx__Income__c
        WHERE educx__Receipt_Number__c IN :receiptNames])
		{
				incomesToDelete.add(incRecToDelete);
		}

    if (!incomesToDelete.isEmpty()) {
        delete incomesToDelete;
    }
        
       

        // Update payments with adjusted amounts
        if (!paymentsToUpdate.isEmpty()) {
            update paymentsToUpdate;
        }
    }
}


    
    
    
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValuesFeetype(String sObjectName, String fieldName) {
        System.debug('sObjectName : '+sObjectName +' fieldName : '+fieldName);
        List<String> picklistValues = new List<String>();
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(sObjectName);
        if (sObjectType != null) {
            Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
            Schema.DescribeFieldResult fieldDescribe = sObjectDescribe.fields.getMap().get(fieldName).getDescribe();
            for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                picklistValues.add(entry.getLabel());
            }
        }
        System.debug('picklistValues : '+picklistValues);
        return picklistValues;
    }
}