public class FileUploadController {
    @AuraEnabled
    public static string uploadFileToRecord(String base64Data, String fileName, String recordId) {
        Blob fileContent = EncodingUtil.base64Decode(base64Data);
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = fileName;
        contentVersion.PathOnClient = fileName;
        contentVersion.VersionData = fileContent;
        contentVersion.FirstPublishLocationId = recordId;
        insert contentVersion;
        return 'ok';
    }
}