import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import COLLEGE_LOGO from '@salesforce/resourceUrl/Degree_Header';
import Degree_Principal_Sign from '@salesforce/resourceUrl/Degree_Principal_Sign';
import Degree_Clerk_Sign from '@salesforce/resourceUrl/Degree_Clerk_Sign';
import { createRecord } from 'lightning/uiRecordApi';
import sendEmailToStudentWithAttachment from '@salesforce/apex/EmailToStdWithCertificate.sendEmailToStudentWithAttachment';

export default class DegreeTcTemplate extends LightningElement {

    @api studentData;
    @track showSpinner = false;
    @track currentData = '';
    @track dynamicContent = '';

    jsPdfInitialized = false;
    collegeLogo = COLLEGE_LOGO;

    connectedCallback() {
        this.jsPdfInitialized = true;
        this.showSpinner = true;

        loadScript(this, jsPDF)
            .then(() => {
                this.generatePDF();
            })
            .catch(error => {
                console.error(error);
                this.showSpinner = false;
            });
    }

    async generatePDF() {
        if (!this.jsPdfInitialized) {
            console.error('jsPDF is not loaded yet');
            this.showSpinner = false;
            return;
        }

        const { jsPDF } = window.jspdf;
        const todayDate = new Date();
        const today = todayDate.toISOString().split('T')[0];
        const time = todayDate.toTimeString().split(' ')[0];
        const imgWidth = 180;
        const imgHeight = 40;

         // Extract day, month, and year
        const day = String(todayDate.getDate()).padStart(2, '0'); // Ensure two digits
        const month = String(todayDate.getMonth() + 1).padStart(2, '0'); // Ensure two digits (month is zero-based)
        const year = String(todayDate.getFullYear()).slice(-2); // Get last two digits of the year

        // Combine into ddmmyy format forreceipt number
        const formattedDate = `${day}${month}${year}`;

        for (let i = 0; i < this.studentData.length; i++) {
            const row = this.studentData[i];
            this.currentData = `Processing record ${i + 1} of ${this.studentData.length}`;
            this.dynamicContent = `Fetching data for student ${row.educx__Student_ID__r.educx__Name_of_The_Candidate__c}`;

            const doc = new jsPDF();
            const day = todayDate.getDate();
            const month = todayDate.getMonth() + 1;
            const year = todayDate.getFullYear();
            const currentDate = `${day}-${month}-${year}`;

            // Extract data from current row
            const admissionNo = row.educx__Student_ID__r.Name;
            const sno = `${row.educx__Student_ID__r.educx__Hall_Ticket_No__c}_TC_${formattedDate}`;
            const date = currentDate;
            const studentName = row.educx__Student_ID__r.educx__Name_of_The_Candidate__c;
            const fatherName = row.educx__Student_ID__r.educx__Name_of_The_Father__c;
            const course = row.educx__Student_ID__r.educx__Course__c;
            const academicYear = '2019-2023';
            const hallTicketNo = row.educx__Student_ID__r.educx__Hall_Ticket_No__c;
            const conduct = 'Good';
            const dateOfBirth = row.educx__Student_ID__r.educx__Date_of_Birth__c;
            const dateofJoining = row.educx__Student_ID__r.educx__Joining_Date__c;
            const courseName = row.educx__Student_ID__r.educx__Course_Name__c;
            const nationality = row.educx__Student_ID__r.educx__Nationality__c;
            const approvalId = row.educx__Student_ID__c;
            const medium = row.educx__Student_ID__r.educx__Course_Code__r.educx__Medium__c;
            const mail = row.educx__Student_ID__r.educx__Email__c;
            const cerificate = 'Transfer Certificate';

            try {
                const collegeLogoBlob = await fetch(this.collegeLogo).then(response => response.blob());
                const collegeLogoData = await this.blobToDataURL(collegeLogoBlob);
                this.dynamicContent='Fetching College Logo'
                doc.addImage(collegeLogoData, 'PNG', 10, 15, imgWidth, imgHeight);

                doc.setTextColor(10, 36, 112);
                doc.setLineWidth(0.4);
                doc.rect(63, 55, 90, 8);
                doc.setFont('times', 'bolditalic');
                doc.setFontSize(20);
                doc.text('TRANSFER CERTIFICATE', 65, 62);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(15);

                // Add outer border
                doc.setLineWidth(0.5);
                doc.rect(5, 5, 200, 287);

                // Add inner border
                doc.setLineWidth(0.2);
                doc.rect(6, 6, 198, 285);

                doc.setFont('times', 'italic');
                doc.text('S. No:', 15, imgHeight + 30);
                doc.setFont('times', 'bolditalic');
                doc.text(sno, 40, imgHeight + 30);

                doc.setFont('times', 'italic');
                doc.text('Date:', 140, imgHeight + 30);
                doc.setFont('times', 'bolditalic');
                doc.text(date, 155, imgHeight + 30);

                doc.setFont('times', 'italic');
                doc.text('Roll No:', 15, imgHeight + 40);
                doc.setFont('times', 'bolditalic');
                doc.text(hallTicketNo, 40, imgHeight + 40);

                doc.setFont('times', 'italic');
                doc.text('Admn No:', 140, imgHeight + 40);
                doc.setFont('times', 'bolditalic');
                doc.text(admissionNo, 165, imgHeight + 40);

                let startY = imgHeight + 50;
                const maxWidth = 190;
                let cursorY = startY;

                const fields = [
                    { label: 'Name of the Student', value: studentName },
                    { label: "Father's Name", value: fatherName },
                    { label: 'Date of Birth', value: dateOfBirth },
                    { label: 'Community', value: 'Community' },
                    { label: 'Nationality/Religion', value: nationality },
                    { label: 'Date of Admission', value: dateofJoining },
                    { label: 'Date of Leaving', value: '30-05-2023' },
                    { label: 'Medium', value: medium },
                    { label: 'Academic Years', value: academicYear },
                    { label: 'Whether Course Completed / discontinued', value: 'Completed' },
                    { label: 'Conduct', value: conduct },
                    { label: 'Remarks', value: 'No remarks' }
                ];

                fields.forEach((field, index) => {
                    const label = `${index + 1}. ${field.label}:`;
                    const colonX = 15;
                    const valueX = 70; // Adjust based on your layout

                    doc.setFont('times', 'italic');
                    doc.text(label, colonX, cursorY);

                    if (field.label === 'Whether Course Completed / discontinued') {
                        const valueX = 130;
                        doc.setFont('times', 'bold');
                        doc.text(field.value, valueX, cursorY);
                        doc.line(valueX, cursorY + 1, maxWidth, cursorY + 1); // Underline
                    } else if (field.label === 'Date of Admission') {
                        doc.setFont('times', 'bold');
                        doc.text(`${field.value}`, valueX, cursorY);
                        doc.line(valueX, cursorY + 1, maxWidth, cursorY + 1); // Underline

                        cursorY += 10;
                        const childLabel = 'Course & Class:';
                        doc.setFont('times', 'italic');
                        doc.text(childLabel, colonX + 20, cursorY);
                        doc.setFont('times', 'bold');
                        doc.text(`${course} (Group) ${courseName}`, valueX + 5, cursorY);
                        doc.line(valueX + 5, cursorY + 1, maxWidth, cursorY + 1); // Underline
                    } else if (field.label === 'Date of Leaving') {
                        doc.setFont('times', 'bold');
                        doc.text(`${field.value}`, valueX, cursorY);
                        doc.line(valueX, cursorY + 1, maxWidth, cursorY + 1); // Underline

                        cursorY += 10;
                        const childLabel = 'Course & Class:';
                        doc.setFont('times', 'italic');
                        doc.text(childLabel, colonX + 20, cursorY);
                        doc.setFont('times', 'bold');
                        doc.text(`${course} (Group) ${courseName}`, valueX + 5, cursorY);
                        doc.line(valueX + 5, cursorY + 1, maxWidth, cursorY + 1); // Underline
                    } else {
                        doc.setFont('times', 'bold');
                        doc.text(field.value, valueX, cursorY);
                        doc.line(valueX, cursorY + 1, maxWidth, cursorY + 1); // Underline
                    }

                    cursorY += 10; // Move to the next line
                });

                this.dynamicContent='Adding Signs'

                // Fetch and add the Degree_Clerk_Sign image
                const clerkSignBlob = await fetch(Degree_Clerk_Sign).then(response => response.blob());
                const clerkSignData = await this.blobToDataURL(clerkSignBlob);
                doc.addImage(clerkSignData, 'PNG', 15, cursorY + 6, 35, 15); // Adjust position and size of the Clerk signature

                // Add CLERK text
                doc.setFont('times', 'bolditalic');
                doc.text('CLERK', 15, cursorY + 30);

                // Fetch and add the Degree_Principal_Sign image
                const principalSignBlob = await fetch(Degree_Principal_Sign).then(response => response.blob());
                const principalSignData = await this.blobToDataURL(principalSignBlob);
                doc.addImage(principalSignData, 'PNG', 150, cursorY + 6, 35, 15); // Adjust position and size of the Principal signature

                // Add PRINCIPAL text
                doc.setFont('times', 'bolditalic');
                doc.setTextColor(255, 0, 0); // Set text color to red
                doc.text('PRINCIPAL', 150, cursorY + 30);

                // Reset text color and font for footer
                doc.setTextColor(0, 0, 0);
                doc.setFont('times', 'normal');
                doc.setFontSize(10);

                // Add footer
                doc.setFont('times', 'italic');
                doc.setFontSize(8);
                const footerText = 'This is a computer-generated document. No signature is required';
                doc.text(footerText, 10, cursorY + 40);

                // Prepare PDF data
                const finalFilename = `${hallTicketNo}_Transfer_Certificate_${today}_${time}.pdf`;
                const pdfDataUri = doc.output('datauristring');
                const base64Data = pdfDataUri.split(',')[1];

                const data = {
                    fileName: finalFilename,
                    base64Data: base64Data,
                    recordId: approvalId
                };

                await this.sendEmail({pdfData: base64Data, filename: finalFilename, mail: mail, cerificate: cerificate});
                // Upload the document
                await this.uploadDocument(data);

            } catch (error) {
                console.error('Error generating PDF:', error);
                this.showSpinner = false;
            }

            // Manually trigger a reactive update
            this.currentData = `${this.currentData}`;
        }

        this.showSpinner = false;
    }

    async uploadDocument({ fileName, base64Data, recordId }) {
        const fields = {
            Title: fileName,
            PathOnClient: fileName,
            VersionData: base64Data,
            FirstPublishLocationId: recordId
        };

        const recordInput = { apiName: 'ContentVersion', fields };

        try {
            await createRecord(recordInput);
            console.log('ContentVersion record created successfully');
        } catch (error) {
            console.error('Error uploading document:', error);
        }
    }
    
    async sendEmail({ pdfData, filename, mail, cerificate }) {
        console.log('sendEmail called with:', { pdfData, filename, mail, cerificate });
        try {
            const result = await sendEmailToStudentWithAttachment({
                pdfData: pdfData,
                mail: mail,
                certificate: cerificate,
                filename: filename
            });
            console.log('Email sent successfully:', result);
        } catch (error) {
            console.error('Error calling email Apex method:', error);
        }
    }

    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}