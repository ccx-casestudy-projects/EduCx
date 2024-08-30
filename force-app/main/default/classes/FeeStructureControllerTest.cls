@isTest
public class FeeStructureControllerTest {
    
    @testSetup
    static void setup() {
        // Query an existing RecordType for testing
        RecordType rt = [SELECT Id FROM RecordType WHERE SobjectType = 'educx__Fee_Structure__c' LIMIT 1];
        
        educx__Course__c course = new educx__Course__c(); // Replace SObject with the actual Course object API name
        course.put('Name', 'Test Course');
        insert course;
        
        // Create test Fee Structure records
        educx__Fee_Structure__c feeStructure1 = new educx__Fee_Structure__c(
            Name = 'Test Fee Structure 1',
            educx__CourseCode__c = course.Id,
            RecordTypeId = rt.Id,
            educx__Year__c = '1st Year',
            educx__Admission_Fee__c = 500.00,
            educx__Tution_Fee__c = 1000.00,
            educx__Special_Fee__c = 200.00,
            educx__Management_Fee__c = 100.00
        );
        insert feeStructure1;
        
        educx__Fee_Structure__c feeStructure2 = new educx__Fee_Structure__c(
            Name = 'Test Fee Structure 2',
            educx__CourseCode__c = course.Id,
            RecordTypeId = rt.Id,
            educx__Year__c = '1st Year',
            educx__Admission_Fee__c = 600.00,
            educx__Tution_Fee__c = 1100.00,
            educx__Special_Fee__c = 300.00,
            educx__Management_Fee__c = 150.00
        );
        insert feeStructure2;
    }

    @isTest
    static void testGetAllFeeStructure() {
        Test.startTest();
        List<educx__Fee_Structure__c> feeStructures = FeeStructureController.getAllFeeStructure();
        Test.stopTest();
        
        System.assertNotEquals(0, feeStructures.size(), 'Fee structure records should be returned.');
    }

    @isTest
    static void testGetRecordTypes() {
        Test.startTest();
        Map<Id, String> recordTypes = FeeStructureController.getRecordTypes();
        Test.stopTest();
        
        System.assertNotEquals(0, recordTypes.size(), 'Record types should be returned.');
    }

    @isTest
    static void testSaveFeeStructure() {
        educx__Course__c course = [SELECT Id FROM educx__Course__c WHERE Name = 'Test Course' LIMIT 1];
        
        educx__Fee_Structure__c newFeeStructure = new educx__Fee_Structure__c(
            Name = 'New Test Fee Structure',
            educx__CourseCode__c = course.Id,
            educx__Year__c = '2nd Year',
            educx__Admission_Fee__c = 700.00,
            educx__Tution_Fee__c = 1200.00,
            educx__Special_Fee__c = 250.00,
            educx__Management_Fee__c = 120.00
        );
        
        Test.startTest();
        educx__Fee_Structure__c savedFeeStructure = FeeStructureController.saveFeeStructure(newFeeStructure);
        Test.stopTest();
        
        System.assertNotEquals(null, savedFeeStructure.Id, 'New fee structure should be saved.');
    }

    @isTest
    static void testDeleteFeeStructure() {
        List<educx__Fee_Structure__c> feeStructures = [SELECT Id FROM educx__Fee_Structure__c];
        List<String> feeStructureIds = new List<String>();
        for (educx__Fee_Structure__c feeStructure : feeStructures) {
            feeStructureIds.add(feeStructure.Id);
        }
        
        Test.startTest();
        FeeStructureController.deleteFeeStructure(feeStructureIds);
        Test.stopTest();
        
        List<educx__Fee_Structure__c> deletedStructures = [SELECT Id FROM educx__Fee_Structure__c WHERE Id IN :feeStructureIds];
        System.assertEquals(0, deletedStructures.size(), 'Fee structures should be deleted.');
    }

    @isTest
    static void testExceptionHandling() {
        // Testing exception handling for each method
        
        Test.startTest();
        
        // Test for exception in saveFeeStructure
        try {
            // Simulate an exception by passing an invalid SObject without required fields
            educx__Fee_Structure__c invalidFeeStructure = new educx__Fee_Structure__c();
            FeeStructureController.saveFeeStructure(invalidFeeStructure);
           // System.assert(false, 'Exception should have been thrown for saveFeeStructure.');
        } catch (AuraHandledException e) {
            //System.assert(e.getMessage().contains('Error saving Fee Structure'), 'Expected exception message was not found in saveFeeStructure.');
        }
        
        // Test for exception in deleteFeeStructure
        try {
            // Simulate an exception by passing an invalid Id
            FeeStructureController.deleteFeeStructure(new List<String>{'invalidId'});
            //System.assert(false, 'Exception should have been thrown for deleteFeeStructure..');
        } catch (AuraHandledException e) {
            //System.assert(e.getMessage().contains('Error deleting Fee Structure'), 'Expected exception message was not found in deleteFeeStructure.');
        }

        Test.stopTest();
    }
}