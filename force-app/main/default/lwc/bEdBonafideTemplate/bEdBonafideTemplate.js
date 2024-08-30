import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import COLLEGE_LOGO from '@salesforce/resourceUrl/BEd_Bonafide_Header';
import BEd_Principal_Sign from '@salesforce/resourceUrl/BEd_Principal_Sign';
import BEd_Clerk_Sign from '@salesforce/resourceUrl/BEd_Clerk_Sign';
import { createRecord } from 'lightning/uiRecordApi';
import sendEmailToStudentWithAttachment from '@salesforce/apex/EmailToStdWithCertificate.sendEmailToStudentWithAttachment';

export default class BEdBonafideTemplate extends LightningElement {
    @api studentData;
    @track showSpinner = false;
    jsPdfInitialized = false;
    collegeLogo = COLLEGE_LOGO;
    @track dynamicContent = 'Fetching data..';
    @track currentData = 'Processing Bonafides';

    connectedCallback() {
        this.jsPdfInitialized = true;
        this.showSpinner = true;

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
        const { jsPDF } = window.jspdf;
        const todaydate = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const currentDate = todaydate.toLocaleDateString('en-GB', options);
        const today = todaydate.toISOString().split('T')[0];
        const time = todaydate.toTimeString().split(' ')[0];
        const imgWidth = 180;
        const imgHeight = 30;

        for (let i = 0; i < this.studentData.length; i++) {
            const row = this.studentData[i];
            this.currentData = `Processing Bonafide Record ${i + 1} of ${this.studentData.length}`;

            const doc = new jsPDF();
            this.dynamicContent = 'Loading Details';

            const admissionNo = row.educx__Student_ID__r.Name;
            const date = currentDate;
            const studentName = row.educx__Student_ID__r.educx__Name_of_The_Candidate__c;
            const fatherName = row.educx__Student_ID__r.educx__Name_of_The_Father__c;
            const course = row.educx__Student_ID__r.educx__Course__c;
            const academicYear = row.educx__Student_ID__r.educx__Current_Academic_Year__c;
            const dateOfBirth = new Date(row.educx__Student_ID__r.educx__Date_of_Birth__c).toLocaleDateString('en-GB', options);
            const DOBInWords = this.convertDateToWords(row.educx__Student_ID__r.educx__Date_of_Birth__c);
            const approvalId = row.educx__Student_ID__c;
            const mail = row.educx__Student_ID__r.educx__Email__c;
            const cerificate = 'Bonafide Certificate';



            try {
                const collegeLogoBlob = await fetch(this.collegeLogo).then(response => response.blob());
                const collegeLogoData = await this.blobToDataURL(collegeLogoBlob);

                const clerkSignBlob = await fetch(BEd_Clerk_Sign).then(response => response.blob());
                const clerkSignData = await this.blobToDataURL(clerkSignBlob);

                const principalSignBlob = await fetch(BEd_Principal_Sign).then(response => response.blob());
                const principalSignData = await this.blobToDataURL(principalSignBlob);

                doc.setLineWidth(0.5);
                doc.rect(5, 5, 200, 287);

                doc.setLineWidth(0.2);
                doc.rect(6, 6, 198, 285);
                this.dynamicContent = 'Fetching College Logo';
                doc.addImage(collegeLogoData, 'PNG', 15, 20, imgWidth, imgHeight);

                doc.setTextColor(10, 36, 112);
                doc.setLineWidth(0.4);
                doc.rect(65, 52, 90, 8);
                doc.setFont('times', 'bolditalic');
                doc.setFontSize(20);
                doc.text('BONAFIDE CERTIFICATE', 67, 59);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(16);
                doc.setFont('times', 'italic');
                this.dynamicContent = 'Generating Content';
                const admissionNoText = `Admission No: ${admissionNo}`;
                const admissionNoX = 10;
                const admissionNoY = imgHeight + 45;
                doc.setFont('times', 'italic');
                doc.text(admissionNoText.replace(admissionNo, ''), admissionNoX, admissionNoY);

                doc.setFont('times', 'bolditalic');
                doc.text(admissionNo, admissionNoX + doc.getTextWidth(admissionNoText.replace(admissionNo, '')), admissionNoY);
                doc.line(admissionNoX + doc.getTextWidth(admissionNoText.replace(admissionNo, '')), admissionNoY + 2, admissionNoX + doc.getTextWidth(admissionNoText), admissionNoY + 2);

                const dateText = `Date: ${date}`;
                const dateX = 150;
                const dateY = imgHeight + 45;
                doc.setFont('times', 'italic');
                doc.text(dateText.replace(date, ''), dateX, dateY);

                doc.setFont('times', 'bolditalic');
                doc.text(date, dateX + doc.getTextWidth(dateText.replace(date, '')), dateY);
                doc.line(dateX + doc.getTextWidth(dateText.replace(date, '')), dateY + 2, dateX + doc.getTextWidth(dateText), dateY + 2);

                doc.setFont('times', 'italic');

                const content = `This is to certify that Mister/ Kumari ${studentName} S/o , D/o ${fatherName} is / was a Bonafide student of this Institution. He/She studying/studied Class ${course} Year ${academicYear} . During his/her study period, his/her character is/was found Good. His/Her date of Birth according to school Admission register is ${dateOfBirth} in Words ${DOBInWords} .`;
                const startY = imgHeight + 60;
                const maxWidth = 190;
                let cursorX = 20;
                let cursorY = startY;

                const words = content.split(/(\s+|[,])/).filter(Boolean);

                const boldItalicWords = new Set([
                    ...studentName.split(' '),
                    ...fatherName.split(' '),
                    academicYear,
                    ...DOBInWords.split(' '),
                    ...dateOfBirth.split(' '),
                    course,
                ]);

                words.forEach(word => {
                    const cleanWord = word.replace(/[,]/g, '');
                    if (boldItalicWords.has(cleanWord)) {
                        doc.setFont('times', 'bolditalic');
                    } else {
                        doc.setFont('times', 'italic');
                    }

                    const wordWidth = doc.getTextWidth(word);
                    if (cursorX + wordWidth > 10 + maxWidth) {
                        cursorX = 10;
                        cursorY += 10;
                    }

                    doc.text(word, cursorX, cursorY);

                    if (boldItalicWords.has(cleanWord)) {
                        const underlineStartX = cursorX;
                        const underlineEndX = cursorX + wordWidth;
                        const underlineY = cursorY + 1;
                        doc.line(underlineStartX, underlineY, underlineEndX, underlineY);
                    }

                    cursorX += wordWidth;
                });

                cursorY += 30;
                this.dynamicContent = 'Adding Signs';
                doc.addImage(clerkSignData, 'PNG', 10, cursorY - 15, 50, 20);

                doc.setFont('times', 'bolditalic');
                doc.text('CLERK', 10, cursorY + 20);

                doc.addImage(principalSignData, 'PNG', 140, cursorY - 15, 50, 20);

                doc.setTextColor(255, 0, 0);
                doc.text('PRINCIPAL', 140, cursorY + 20);

                doc.setTextColor(0, 0, 0);
                doc.setFont('times', 'normal');
                doc.setFontSize(10);
                const footerText = '**This is a computer-generated document.';

                doc.text(footerText, 10, cursorY + 30);

                const hallTicketNo = row.educx__Student_ID__r.educx__Hall_Ticket_No__c;
                const finalFilename = `${hallTicketNo}_Bonafide_${today}_${time}.pdf`;
                const pdfDataUri = doc.output('datauristring');
                const base64Data = pdfDataUri.split(',')[1];
                const data = {
                    fileName: finalFilename,
                    recordId: approvalId,
                    base64Data: base64Data
                };
                await this.sendEmail({pdfData: base64Data, filename: finalFilename, mail: mail, cerificate: cerificate});
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
            this.showToast('Success', 'Document uploaded successfully.', 'success');
        } catch (error) {
            console.error('Error uploading document:', error);
            this.showToast('Error', 'Error uploading document. Check console for details.', 'error');
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

    async blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    convertDateToWords(date) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const [year, month, day] = date.split('-').map(Number);

        const dayInWords = this.numberToWords(day);
        const yearInWords = this.numberToWords(year);

        return `${dayInWords} ${months[month - 1]} ${yearInWords}`;
    }

    numberToWords(number) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (number === 0) return 'Zero';

        if (number < 10) return ones[number];
        if (number < 20) return teens[number - 10];

        if (number < 100) {
            const ten = Math.floor(number / 10);
            const one = number % 10;
            return `${tens[ten]}${one ? ` ${ones[one]}` : ''}`;
        }

        if (number < 1000) {
            const hundred = Math.floor(number / 100);
            const remainder = number % 100;
            return `${ones[hundred]} Hundred${remainder ? ` ${this.numberToWords(remainder)}` : ''}`;
        }

        if (number < 10000) {
            const thousand = Math.floor(number / 1000);
            const remainder = number % 1000;
            return `${ones[thousand]} Thousand${remainder ? ` ${this.numberToWords(remainder)}` : ''}`;
        }

        return '';
    }

}