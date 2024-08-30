import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import COLLEGE_LOGO from '@salesforce/resourceUrl/Degree_Header';
import Degree_Principal_Sign from '@salesforce/resourceUrl/Degree_Principal_Sign';
import Degree_Clerk_Sign from '@salesforce/resourceUrl/Degree_Clerk_Sign';
import { createRecord } from 'lightning/uiRecordApi';
import sendEmailToStudentWithAttachment from '@salesforce/apex/EmailToStdWithCertificate.sendEmailToStudentWithAttachment';

export default class DegreeBonafideTemplate extends LightningElement {
    @api studentData;
    @track showSpinner = false;
    @track currentData = '';
    @track dynamicContent = '';

    jsPdfInitialized = false;
    collegeLogo = COLLEGE_LOGO;

    connectedCallback() {
        this.jsPdfInitialized = true;
        this.showSpinner = true;
        this.loadJsPDF();
    }

    loadJsPDF() {
        loadScript(this, jsPDF)
            .then(() => {
                this.generatePDF();
            })
            .catch(error => {
                console.error('Error loading jsPDF:', error);
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

        for (let i = 0; i < this.studentData.length; i++) {
            const row = this.studentData[i];
            this.currentData = `Processing record ${i + 1} of ${this.studentData.length}`;
            this.dynamicContent = `Fetching data for student ${row.educx__Student_ID__r.Name}`;

            try {
                const doc = new jsPDF();
                const imgWidth = 180;
                const imgHeight = 60;

                const collegeLogoData = await this.getImageData(this.collegeLogo);
                doc.setLineWidth(0.5);
                doc.rect(5, 5, 200, 287);
                doc.setLineWidth(0.2);
                doc.rect(6, 6, 198, 285);
                doc.addImage(collegeLogoData, 'PNG', 10, 20, imgWidth, imgHeight-30);
                doc.setFont('times', 'italic');

                doc.setTextColor(10, 36, 112);
                doc.setLineWidth(0.4);
                doc.rect(63, 55, 90, 8);
                doc.setFont('times', 'bolditalic');
                doc.setFontSize(20);
                doc.text('BONAFIDE CERTIFICATE', 65, 62);

                doc.setTextColor(0, 0, 0);
                doc.setFont('times', 'italic');
                doc.setFontSize(15);

                // Admission No
                const admissionNo = row.educx__Student_ID__r.Name;
                const admissionNoText = `Admission No: `;
                doc.setFont('times', 'italic');
                doc.text(admissionNoText, 10, imgHeight + 35);
                doc.setFont('times', 'bold');
                const admissionNoWidth = doc.getTextWidth(admissionNo);
                doc.text(admissionNo, 10 + doc.getTextWidth(admissionNoText), imgHeight + 35);
                doc.line(10 + doc.getTextWidth(admissionNoText), imgHeight + 37, 10 + doc.getTextWidth(admissionNoText) + admissionNoWidth, imgHeight + 37);

                // Date
                const date = new Date().toLocaleDateString('en-GB');
                const dateText = `Date: `;
                doc.setFont('times', 'italic');
                doc.text(dateText, 150, imgHeight + 35);
                doc.setFont('times', 'bold');
                const dateWidth = doc.getTextWidth(date);
                doc.text(date, 150 + doc.getTextWidth(dateText), imgHeight + 35);
                doc.line(150 + doc.getTextWidth(dateText), imgHeight + 37, 150 + doc.getTextWidth(dateText) + dateWidth, imgHeight + 37);

                // Content with bolditalic words and underlining
                const studentName = row.educx__Student_ID__r.educx__Name_of_The_Candidate__c;
                const fatherName = row.educx__Student_ID__r.educx__Name_of_The_Father__c;
                const course = row.educx__Student_ID__r.educx__Course__c;
                const academicYear = '2019-2023'; // Use appropriate field if available
                const hallTicketNo = row.educx__Student_ID__r.educx__Hall_Ticket_No__c;
                const dateOfBirth = new Date(row.educx__Student_ID__r.educx__Date_of_Birth__c).toLocaleDateString('en-GB');
                const mail = row.educx__Student_ID__r.educx__Email__c;
                const cerificate = 'Bonafide Certificate';

                const content = `This is to certify that Mr./ Miss ${studentName} S/o. D/o. ${fatherName} is / was a student of B.Sc. / B.Com. / B.A. ${course} (Group) of this College during the academic year ${academicYear} bearing the Hall Ticket No. ${hallTicketNo}. His / Her Conduct is / was found to be good / satisfactory, during his / her stay in the college and his / her date of birth as per records is ${dateOfBirth}.`;

                const startY = imgHeight + 55;
                const maxWidth = 190;
                let cursorX = 10;
                let cursorY = startY;

                const words = content.split(/(\s+|[,])/).filter(Boolean);

                const boldItalicWords = new Set([
                    ...studentName.split(' '),
                    ...fatherName.split(' '),
                    academicYear,
                    hallTicketNo.replace(/[\s,.]/g, ''),
                    dateOfBirth.replace(/[\s,.]/g, ''),
                    course.replace(/[\s,.]/g, '')
                ]);

                words.forEach(word => {
                    const cleanWord = word.replace(/[\s,.]/g, '');
                    let wordWidth = doc.getTextWidth(word);

                    if (boldItalicWords.has(cleanWord)) {
                        doc.setFont('times', 'bolditalic');
                    } else {
                        doc.setFont('times', 'italic');
                    }

                    if (cursorX + wordWidth > 10 + maxWidth) {
                        cursorX = 10;
                        cursorY += 10;
                    }

                    doc.text(word, cursorX, cursorY);

                    // Underline the word if it's in boldItalicWords
                    if (boldItalicWords.has(cleanWord)) {
                        doc.line(cursorX, cursorY + 1, cursorX + wordWidth, cursorY + 1); // draw underline
                    }

                    cursorX += wordWidth;
                });

                cursorY += 30;

                const clerkSignData = await this.getImageData(Degree_Clerk_Sign);
                doc.addImage(clerkSignData, 'PNG', 10, cursorY - 15, 50, 25);
                doc.setFont('times', 'bold');
                doc.text('CLERK', 10, cursorY + 15);

                const principalSignData = await this.getImageData(Degree_Principal_Sign);
                doc.addImage(principalSignData, 'PNG', 140, cursorY - 15, 50, 25);
                doc.setTextColor(255, 0, 0);
                doc.setFont('times', 'bold');
                doc.text('PRINCIPAL', 140, cursorY + 15);

                doc.setTextColor(0, 0, 0);
                doc.setFont('times', 'normal');
                doc.setFontSize(10);
                const footerText = '**This is a computer-generated document.';
                doc.text(footerText, 10, cursorY + 30);

                const finalFilename = `${hallTicketNo}_Bonafide_${today}_${time}.pdf`;
                const pdfDataUri = doc.output('datauristring');
                const base64Data = pdfDataUri.split(',')[1];

                const data = {
                    fileName: finalFilename,
                    base64Data: base64Data,
                    recordId: row.educx__Student_ID__c
                };

                await this.sendEmail({pdfData: base64Data, filename: finalFilename, mail: mail, cerificate: cerificate});
                await this.uploadDocument(data);
                this.currentData = `Finished processing record ${i + 1}`;
            } catch (error) {
                console.error('Error generating PDFs for record:', i + 1, error);
                this.showToast('Error', 'Failed to generate PDFs for some records', 'error');
            }
        }

        this.currentData = 'Processing complete';
        this.showSpinner = false;
    }

    async getImageData(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
        });
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

    async uploadDocument(data) {
        try {
            const fileFields = {
                Title: data.fileName,
                PathOnClient: data.fileName,
                VersionData: data.base64Data,
                FirstPublishLocationId: data.recordId
            };

            const fileRecordInput = {
                apiName: 'ContentVersion',
                fields: fileFields
            };

            await createRecord(fileRecordInput);
        } catch (error) {
            console.error('Error uploading document:', error);
        }
    }
}