import { LightningElement, track, api, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import getPaymentDetails from "@salesforce/apex/FeeReceiptPdf.getPaymentDetails";
import Degree_Principal_Sign from '@salesforce/resourceUrl/Degree_Principal_Sign';
import BEd_COLLEGE_LOGO from '@salesforce/resourceUrl/BEd_Bonafide_Header';
import Degree_COLLEGE_LOGO from '@salesforce/resourceUrl/Degree_Header';
import Mba_COLLEGE_LOGO from '@salesforce/resourceUrl/MBA_header';

export default class GenerateFeeReceiptPdf extends LightningElement {

    @api recordIds;
    jsPdfInitialized = false;
    showSpinner = false;
    uploadFile = false;
    base64Data;
    fileName;
    @api stdrecordId;
    @track PaymentDetails;


    renderedCallback() {
        if (this.jsPdfInitialized) {
            return;
        }
        this.jsPdfInitialized = true;

        loadScript(this, jsPDF)
            .then(() => {
                console.log('jsPDF loaded successfully');
            })
            .catch(error => {
                console.error('Failed to load jsPDF', error);
            });
    }

    //getting data for generating pdf
    @wire(getPaymentDetails, { recordId: '$recordIds' })
    wiredPaymentRecordss(result) {
        if (result.data) {
            this.PaymentDetails = result.data;
            this.generatePDF2();
        } else if (result.error) {
            console.error('Error loading payment details:', result.error);
        }
    }

    //COVERTING IMAGE TO BASE64DATA
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

    //generating pdf and alignment code
    async generatePDF2() {
        this.showSpinner = true;

        if (!this.jsPdfInitialized) {
            console.error('jsPDF is not loaded yet');
            this.showSpinner = false;
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Verify if PaymentDetails is available
        if (!this.PaymentDetails || !this.PaymentDetails.length) {
            console.error('No payment details available');
            this.showSpinner = false;
            return;
        }

        //CONVERTING DATA INTO STRINGS
        const updatedPaymentList = this.PaymentDetails.map(entry => {
            const stringEntry = {};
            Object.keys(entry).forEach(key => {
                stringEntry[key] = String(entry[key]);
            });
            return stringEntry;
        });

        // Initialize variables for fee amounts
        let admissionFee = 0;
        let specialFee = 0;
        let transportFee = 0;
        let managementFee = 0;
        let universityFee = 0;
        let otherFee = 0;
        let examFee = 0;
        let tutionFee = 0;
        let receiptNo = updatedPaymentList[0].studentAutoNumber;
        let currentDate = updatedPaymentList[0].paymentDetailDate;
        let course = updatedPaymentList[0].studentCourseName;
        let paymentMode = updatedPaymentList[0].paymentType;
        this.stdrecordId = updatedPaymentList[0].studentId;
        let studentHallicket = updatedPaymentList[0].studentHallicket;

        // Initialize variables for the logo
        const imgWidth = 180;
        let imgHeight = 20;
        let logoYOffset = 20; // Initial Y offset for content below the logo

        try {
            let collegeLogo;
            if (['B.A.', 'B.Com', 'B.Sc.'].includes(course)) {
                collegeLogo = Degree_COLLEGE_LOGO;
            } else if (course === 'M.B.A.') {
                collegeLogo = Mba_COLLEGE_LOGO;
            } else if (course === 'B.Ed.') {
                collegeLogo = BEd_COLLEGE_LOGO;
            }

            if (collegeLogo) {
                const collegeLogoData = await this.getImageData(collegeLogo);
                doc.addImage(collegeLogoData, 'PNG', 10, 20, imgWidth, imgHeight);
                logoYOffset += imgHeight; // Adjust Y offset to utilize space below the logo
            }
        } catch (error) {
            console.error('Error adding image to PDF:', error);
        }

        // Date formatting
        const dateParts = currentDate.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        // Fee amount calculation
        updatedPaymentList.forEach(entry => {
            const typeOfFee = entry.typeOfFee;
            let amount = parseFloat(entry.amountPaid) || 0;

            switch (typeOfFee) {
                case 'Admission Fee':
                    admissionFee = amount;
                    break;
                case 'Tution Fee':
                    tutionFee = amount;
                    break;
                case 'Special Fee':
                    specialFee = amount;
                    break;
                case 'Transportation Fee':
                    transportFee = amount;
                    break;
                case 'Exam Fee':
                    examFee = amount;
                    break;
                case 'Management Fee':
                    managementFee = amount;
                    break;
                case 'University Fee':
                    universityFee = amount;
                    break;
                case 'Other Fee':
                    otherFee = amount;
                    break;
            }
        });

        // Total amount calculation
        const totalAmount = admissionFee + specialFee + examFee + tutionFee + transportFee + managementFee + universityFee + otherFee;

        // Draw borders
        doc.setLineWidth(0.2);
        doc.rect(5, 5, 200, 287);

        doc.setLineWidth(0.5);
        doc.rect(6, 6, 198, 285);

        // Draw the "RECEIPT" box
        const boxWidth = 20;
        const boxHeight = 6;
        const boxX = (doc.internal.pageSize.width - boxWidth) / 2;
        const boxY = 7;

        doc.setLineWidth(0.5);
        doc.rect(boxX, boxY, boxWidth, boxHeight);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const text = 'RECEIPT';
        const textWidth = doc.getTextWidth(text);
        const textX = boxX + (boxWidth - textWidth) / 2;
        const textY = boxY + (boxHeight + 4) / 2;

        doc.text(text, textX, textY);
        doc.text('Cell: 9392639172', textX + 70, textY);

        // Receipt details
        doc.setFontSize(12);
        doc.setFont('times', 'bolditalic');
        doc.text(`Receipt No: ${receiptNo}`, 10, logoYOffset + 10);
        doc.text(`Date: ${formattedDate}`, 140, logoYOffset + 10);
        doc.text(`Roll No: ${updatedPaymentList[0].studentHallicket || ''}`, 10, logoYOffset + 20);
        doc.text(`Course: ${course}`, 140, logoYOffset + 20);

        // Student details
        doc.setFont('times', 'bolditalic');
        doc.text('Mr. / Mrs. / Ms:', 10, logoYOffset + 30);
        doc.setFont('times', 'italic');
        doc.text(updatedPaymentList[0].studentName, 45, logoYOffset + 30);
        doc.line(45, logoYOffset + 31, 190, logoYOffset + 31);

        // Fee details in two columns
        const feeDetails = [
            { label: 'Tution Fee:', value: tutionFee },
            { label: 'Admission Fee:', value: admissionFee },
            { label: 'Special Fee:', value: specialFee },
            { label: 'Management Fee:', value: managementFee },
            { label: 'Exam Fee:', value: examFee },
            { label: 'Transport Fee:', value: transportFee },
            { label: 'University Fee:', value: universityFee },
            { label: 'Other Fee:', value: otherFee },
            { label: 'Total Amount:', value: totalAmount },
            { label: 'DD/Cash:', value: paymentMode }
        ];

        const rowHeight = 10;
        const startX1 = 10;
        const startX2 = 105;
        let startY = logoYOffset + 40; // Adjusted Y position for fee details

        doc.setFontSize(12);
        doc.setFont('times', 'bold');

        for (let i = 0; i < feeDetails.length; i++) {
            const fee = feeDetails[i];
            const x = i % 2 === 0 ? startX1 : startX2;
            const y = startY + Math.floor(i / 2) * rowHeight;
            doc.setFont('times', 'bolditalic');
            // TO PRINT LABEL
            doc.text(fee.label, x, y);
            doc.setFont('times', 'italic');
            // TO PRINT VALUE
            doc.text(fee.value.toString(), x + 35, y);

            // TO Draw underline
            doc.line(x + 35, y + 1, x + 85, y + 1); 
        }

        // Amount in words
        doc.setFont('times', 'bolditalic');
        doc.text('Rupees:', 10, startY + (Math.ceil(feeDetails.length / 2) * rowHeight));
        doc.setFont('times', 'italic');
        const amountInWords = `${this.convertToWords(totalAmount)} Rupees only`;

        const amountTextX = 30;
        const amountTextY = startY + (Math.ceil(feeDetails.length / 2) * rowHeight);
        doc.text(amountInWords, amountTextX, amountTextY);

        // Define the Y position for the underline
        const underlineY = amountTextY + 2; // Slightly below the text to create space

        // Get the width of the page
        const pageWidth = doc.internal.pageSize.width;

        // Draw the line across the page width
        doc.line(amountTextX, underlineY, pageWidth - 25, underlineY); // Adjust the end X position to be slightly before the right margin

        // Signatures
        doc.setFont('times', 'bolditalic');
        doc.text('Student Signature', 20, startY + (Math.ceil(feeDetails.length / 2) * rowHeight) + 30);
        doc.text('Authorised Signatory', 140, startY + (Math.ceil(feeDetails.length / 2) * rowHeight) + 30);
        try {
            const signatureData = await this.getImageData(Degree_Principal_Sign);
            doc.addImage(signatureData, 'PNG', 140, startY + (Math.ceil(feeDetails.length / 2) * rowHeight) + 10, 35, 10);
        } catch (error) {
            console.error('Error adding signature image to PDF:', error);
        }

        const footerText = '**This is a computer-generated document.';
        doc.text(footerText, 10, startY + (Math.ceil(feeDetails.length / 2) * rowHeight) + 50);

        studentHallicket
        // Save the PDF
        this.fileName = `${studentHallicket}_${formattedDate}_Fee_Receipt.pdf`;
        const pdfDataUri = doc.output('datauristring');
        this.base64Data = pdfDataUri.split(',')[1];
        this.uploadFile = true;

        this.showSpinner = false;
    }

    //CONVERTING TOTAL AMOUNT TO WORDS
    convertToWords(amount) {
        const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
        const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        if (amount === 0) {
            return "Zero";
        }

        let result = "";

        if (amount >= 10000000) {
            result += this.convertToWords(Math.floor(amount / 10000000)) + " Crore ";
            amount %= 10000000;
        }

        if (amount >= 100000) {
            result += this.convertToWords(Math.floor(amount / 100000)) + " Lakh ";
            amount %= 100000;
        }

        if (amount >= 1000) {
            result += this.convertToWords(Math.floor(amount / 1000)) + " Thousand ";
            amount %= 1000;
        }

        if (amount >= 100) {
            result += words[Math.floor(amount / 100)] + " Hundred ";
            amount %= 100;
        }

        if (amount > 0) {
            if (result !== "") {
                result += "and ";
            }

            if (amount < 10) {
                result += words[amount];
            } else if (amount < 20) {
                result += ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"][amount - 10];
                amount = 0; // The ones place is already considered
            } else {
                result += tens[Math.floor(amount / 10)];
                amount %= 10;

                if (amount > 0) {
                    result += "-" + words[amount];
                    result = result.trim();
                }
            }
        }

        return result;
    }

    //MESSAGE FROM CHILD
    handleSuccess(event) {
        this.uploadFile = false;
        this.showSpinner = false;
    }
}