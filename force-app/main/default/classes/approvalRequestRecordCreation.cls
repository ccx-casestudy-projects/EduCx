public with sharing class approvalRequestRecordCreation {
  @AuraEnabled
  public static void approvalRequest(
    List<String> documentTypes,
    Id studentID,
    String courseName,
    String reason,
    String otherReasonText
  ) {
    List<educx__Approve_Request__c> newRequests = new List<educx__Approve_Request__c>();

    for (String docType : documentTypes) {
      educx__Approve_Request__c newRequest = new educx__Approve_Request__c(
        educx__Document_Type__c = docType,
        educx__Student_ID__c = studentID,
        educx__Course_Name__c = courseName,
        educx__Status__c = 'Pending',
        educx__Reason__c = reason,
        educx__Other_Reason__c = otherReasonText
      );
      newRequests.add(newRequest);
    }

    if (!newRequests.isEmpty()) {
      insert newRequests;
      /*if (uploadedFiles != null && !uploadedFiles.isEmpty()) {
                for (educx__Approve_Request__c request : newRequests) {
                    for (Map<String, String> file : uploadedFiles) {
                        Attachment newAttachment = new Attachment(
                            ParentId = request.Id,
                            Name = file.get('Name'),
                            Body = EncodingUtil.base64Decode(file.get('Body')),
                            ContentType = file.get('ContentType')
                        );
                        insert newAttachment;
                    }
                }
       }*/
    }
  }
}