public class EmailToStdWithCertificate {
    
	@AuraEnabled
    public static void sendEmailToStudentWithAttachment(String pdfData, String mail, String certificate, String filename) {

        Messaging.SingleEmailMessage mymail = new Messaging.SingleEmailMessage();
        Messaging.EmailFileAttachment fmail = new Messaging.EmailFileAttachment();

        fmail.setFileName(filename+'.pdf');
        Blob bdata = EncodingUtil.base64Decode(pdfData);
        fmail.setBody(bdata);
        mymail.setSubject('Certificate Details - ' + certificate); // Set the subject with Certificate parameter
        string[] toAdd = new string[]{ mail }; // Include the mail parameter in the recipient list
        mymail.setToAddresses(toAdd);
        mymail.setPlainTextBody('Please find the attachment');
        mymail.setFileAttachments(new Messaging.EmailFileAttachment[]{ fmail });
        Messaging.sendEmail(new Messaging.Email[]{ mymail });

    }
}