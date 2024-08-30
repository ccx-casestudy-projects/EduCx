import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import COLLEGE_LOGO from '@salesforce/resourceUrl/BEd_Header';
import MBA_Principal_Sign from '@salesforce/resourceUrl/MBA_Principal_Sign';
import MBA_Clerk_Sign from '@salesforce/resourceUrl/MBA_Clerk_Sign';
import { createRecord } from 'lightning/uiRecordApi';
import sendEmailToStudentWithAttachment from '@salesforce/apex/EmailToStdWithCertificate.sendEmailToStudentWithAttachment';

export default class TcTemplateMBA extends LightningElement {
    @api studentData;
    @track showSpinner = false;
    jsPdfInitialized = false;
    collegeLogo = COLLEGE_LOGO;
    @track dynamicContent = 'Fetching data..';
    @track currentData = 'Processing Transfer Certificates';

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
        const { jsPDF } = window.jspdf;
        const todaydate = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const currentDate = todaydate.toLocaleDateString('en-GB', options);
        const today = todaydate.toISOString().split('T')[0];
        const time = todaydate.toTimeString().split(' ')[0];
        const imgWidth = 180;
        const imgHeight = 60;

        // Extract day, month, and year
        const day = String(todaydate.getDate()).padStart(2, '0'); // Ensure two digits
        const month = String(todaydate.getMonth() + 1).padStart(2, '0'); // Ensure two digits (month is zero-based)
        const year = String(todaydate.getFullYear()).slice(-2); // Get last two digits of the year

        // Combine into ddmmyy format forreceipt number
        const formattedDate = `${day}${month}${year}`;


        for (let i = 0; i < this.studentData.length; i++) {
            const row = this.studentData[i];
            this.currentData = `Processing Transfer Certificate Record ${i + 1} of ${this.studentData.length}`;

            const doc = new jsPDF();
            this.dynamicContent = 'Loading Details';

            const sno = `${row.educx__Student_ID__r.educx__Hall_Ticket_No__c}_TC_${formattedDate}`;
            const admissionNo = row.educx__Student_ID__r.Name;
            const date = currentDate;
            const studentName = row.educx__Student_ID__r.educx__Name_of_The_Candidate__c;
            const fatherName = row.educx__Student_ID__r.educx__Name_of_The_Father__c;
            const nationality = row.educx__Student_ID__r.educx__Nationality__c;
            const religion = row.educx__Student_ID__r.educx__Religion__c;
            const hallTicketNo = row.educx__Student_ID__r.educx__Hall_Ticket_No__c;
            const conduct = 'Good';
            const dateOfBirth = new Date(row.educx__Student_ID__r.educx__Date_of_Birth__c).toLocaleDateString('en-GB', options);
            const moles = [row.educx__Student_ID__r.educx__Identification_Mark_1__c, row.educx__Student_ID__r.educx__Identification_Mark_2__c]; // Multiple moles
            const approvalId = row.educx__Student_ID__c;
            const dateofJoining = row.educx__Student_ID__r.educx__Joining_Date__c;
            const subCaste = row.educx__Student_ID__r.educx__Caste__c;
            const medium = row.educx__Student_ID__r.educx__Course_Code__r.educx__Medium__c;
            const mail = row.educx__Student_ID__r.educx__Email__c;
            const cerificate = 'Transfer Certificate';

            try {
                const collegeLogoBlob = await fetch(this.collegeLogo).then(response => response.blob());
                const collegeLogoReader = new FileReader();
                const collegeLogoPromise = new Promise((resolve) => {
                    collegeLogoReader.onload = () => resolve(collegeLogoReader.result);
                    collegeLogoReader.readAsDataURL(collegeLogoBlob);
                });

                const clerkSignBlob = await fetch(MBA_Clerk_Sign).then(response => response.blob());
                const clerkSignReader = new FileReader();
                const clerkSignPromise = new Promise((resolve) => {
                    clerkSignReader.onload = () => resolve(clerkSignReader.result);
                    clerkSignReader.readAsDataURL(clerkSignBlob);
                });

                const principalSignBlob = await fetch(MBA_Principal_Sign).then(response => response.blob());
                const principalSignReader = new FileReader();
                const principalSignPromise = new Promise((resolve) => {
                    principalSignReader.onload = () => resolve(principalSignReader.result);
                    principalSignReader.readAsDataURL(principalSignBlob);
                });

                const [collegeLogoData, clerkSignData, principalSignData] = await Promise.all([
                    collegeLogoPromise,
                    clerkSignPromise,
                    principalSignPromise
                ]);

                // Set border color and text color to RGB (100, 149, 237)
                const borderColor = [100, 149, 237];
                doc.setTextColor(...borderColor);

                // Add outer border
                doc.setLineWidth(0.5);
                doc.setDrawColor(...borderColor);
                doc.rect(5, 5, 200, 287);

                // Add inner border
                doc.setLineWidth(0.2);
                doc.setDrawColor(...borderColor);
                doc.rect(6, 6, 198, 285);

                this.dynamicContent = 'Fetching College Logo';
                doc.addImage(collegeLogoData, 'PNG', 10, 20, imgWidth, imgHeight - 20);

                doc.setTextColor(0, 0, 0);
                doc.setLineWidth(0.4);
                doc.rect(63, 65, 90, 8);
                doc.setFont('times', 'bolditalic');
                doc.setFontSize(20);
                doc.text('TRANSFER CERTIFICATE', 65, 72);

                doc.setDrawColor(...borderColor);
                doc.setFontSize(15);

                doc.setFont('times', 'italic');
                doc.text('S. No:', 15, imgHeight + 30);
                doc.setFont('times', 'bolditalic');
                doc.text(sno, 30, imgHeight + 30);

                doc.setFont('times', 'italic');
                doc.text('Date:', 140, imgHeight + 30);
                doc.setFont('times', 'bolditalic');
                doc.text(date, 155, imgHeight + 30);

                const fieldStyles = {
                    label: { font: 'times', style: 'italic', size: 12 },
                    value: { font: 'times', style: 'bolditalic', size: 12 },
                    subLabel: { font: 'times', style: 'italic', size: 12 }
                };

                const fields = [
                    { label: 'Admission No', value: admissionNo, additional: { label: 'Roll No', value: hallTicketNo } },
                    { label: "Student's Name", value: studentName },
                    { label: "Father's Name", value: fatherName },
                    { label: 'Date of Birth', value: dateOfBirth },
                    { label: 'Nationality', value: nationality, additional: { label: 'Religion', value: religion } },
                    { label: 'Date of Admission to the College', value: dateofJoining },
                    { label: 'Date of Leaving the College', value: '30-05-2026' },
                    { label: 'Whether he/she belongs to S.C/S.T/B.C/O.C.', value: subCaste },
                    { label: 'Medium', value: medium },
                    { label: 'Conduct', value: conduct },
                    { label: 'Moles', value: moles }
                ];

                let cursorY = imgHeight + 50;
                const startX = 10;
                const lineHeight = 10; // Adjust line height as needed
                fields.forEach((field, index) => {
                    const label = `${index + 1}. ${field.label}:`;
                    const isSpecialField = ['Date of Admission to the College', 'Date of Leaving the College', 'Whether he/she belongs to S.C/S.T/B.C/O.C.'].includes(field.label);

                    if (field.additional) {
                        this.addText(doc, label, startX, cursorY, fieldStyles.label);
                        const valueX = startX + 50; // Adjusted X position for additional fields
                        this.addText(doc, field.value, valueX, cursorY, fieldStyles.value);
                        this.addUnderline(doc, valueX, cursorY + 1, 40);

                        const additionalLabelX = 110; // Adjusted X position for additional fields
                        this.addText(doc, `${field.additional.label}:`, additionalLabelX, cursorY, fieldStyles.label);
                        const additionalValueX = additionalLabelX + 20;
                        this.addText(doc, field.additional.value, additionalValueX, cursorY, fieldStyles.value);
                        this.addUnderline(doc, additionalValueX, cursorY + 1, 60);

                        cursorY += lineHeight; // Move cursor down after adding both labels and values
                    } else if (field.label === 'Moles') {
                        this.addText(doc, label, startX, cursorY, fieldStyles.label);
                        cursorY += lineHeight; // Move cursor down for moles

                        field.value.forEach((mole, moleIndex) => {
                            const moleLabel = `${moleIndex + 1}.`;
                            this.addText(doc, moleLabel, startX + 10, cursorY, fieldStyles.label);

                            const valueX = startX + 20;
                            this.addText(doc, mole, valueX, cursorY, fieldStyles.value);
                            this.addUnderline(doc, valueX, cursorY + 1, 160);

                            cursorY += lineHeight; // Move cursor down for each mole
                        });
                    } else {
                        this.addText(doc, label, startX, cursorY, fieldStyles.label);
                        const valueX = isSpecialField ? startX + 90 : startX + 50; // Adjust X position for special fields
                        this.addText(doc, field.value, valueX, cursorY, fieldStyles.value);
                        this.addUnderline(doc, valueX, cursorY + 1, isSpecialField ? 90 : 130); // Adjust underline width for special fields

                        cursorY += lineHeight; // Move cursor down after adding label and value
                    }
                });

                this.dynamicContent = 'Fetching Clerk Sign';
                doc.text('Clerk', 20, cursorY + 30);
                doc.addImage(clerkSignData, 'PNG', 20, cursorY, 40, 20);

                this.dynamicContent = 'Fetching Principal Sign';
                doc.text('Principal', 160, cursorY + 30);
                doc.addImage(principalSignData, 'PNG', 160, cursorY, 40, 20);

                const footerText = '**This is a computer-generated document.';
                doc.text(footerText, 10, cursorY + 40);

                // Increment the cursorY to prepare for the next page if needed
                cursorY += 50;

                const finalFilename = `${hallTicketNo}_Transfer_Certificate_${today}_${time}.pdf`;
                const pdfDataUri = doc.output('datauristring');
                const base64Data = pdfDataUri.split(',')[1];
                const data = {
                    fileName: finalFilename,
                    recordId: approvalId,
                    base64Data: base64Data
                };

                await this.sendEmail({ pdfData: base64Data, filename: finalFilename, mail: mail, cerificate: cerificate });
                await this.uploadDocument(data);
            } catch (error) {
                console.error('Error generating PDF:', error);
                this.dynamicContent = 'Failed to Generate Document';
            }

            // Manually trigger a reactive update
            this.currentData = `${this.currentData}`;
        }
        this.dynamicContent = 'Process Completed';
        this.showSpinner = false;
    }

    addText(doc, text, x, y, style) {
        doc.setFont(style.font, style.style);
        doc.setFontSize(style.size);
        doc.text(text, x, y);
    }

    addUnderline(doc, x, y, width) {
        doc.line(x, y, x + width, y);
    }

    async uploadDocument({ fileName, recordId, base64Data }) {
        const fields = {
            Title: fileName,
            PathOnClient: fileName,
            VersionData: base64Data,
            FirstPublishLocationId: recordId
        };

        const recordInput = { apiName: 'ContentVersion', fields };

        try {
            await createRecord(recordInput);
            this.dynamicContent = 'Document successfully uploaded to Salesforce';
        } catch (error) {
            this.dynamicContent = 'Failed to Upload Document';
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
}