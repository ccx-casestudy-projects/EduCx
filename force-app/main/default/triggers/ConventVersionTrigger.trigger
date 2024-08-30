trigger ConventVersionTrigger on ContentVersion ( after insert ) { 
    List < ContentDocumentLink > listCDLs = new List < ContentDocumentLink >();
    for ( ContentVersion objCV : trigger.new ) {    
        if ( String.isNotBlank( objCV.Guest_Record_fileupload__c ) ) {
            ContentDocumentLink objCDL = new ContentDocumentLink();
            objCDL.LinkedEntityId = objCV.Guest_Record_fileupload__c;
            objCDL.ContentDocumentId = objCV.ContentDocumentId;
            listCDLs.add( objCDL );
            
        }
    }
    if ( listCDLs.size() > 0 ) {
        insert listCDLs;
    }
}