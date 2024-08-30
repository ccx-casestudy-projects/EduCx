import { LightningElement, track, api,wire } from 'lwc';
import insertStudentData from '@salesforce/apex/StudentController.insertStudentData';
import populateCourseDetails from '@salesforce/apex/StudentController.populateCourseDetails';
import getCourses from '@salesforce/apex/StudentController.getCourses';
export default class StudentRegistration extends LightningElement {
    @api showRegForm = false;
    @track currentStep = '1';
    @track MainInfo = true;
    @track StudentInformationDetails = false;
    @track ParentIncomeDetails = false;
    @track ContactDetails = false;
    @track PreviousStudyDetails = false;
    @track BankDetails = false;
    @track AttachmentDetails = false;
    closeRegPopUp() {
        const closeFormEvent = new CustomEvent('close');
        this.dispatchEvent(closeFormEvent);
        this.showRegForm = false;
    }

    handleStepClick(event) {
        const step = event.target.dataset.step;
        this.resetSteps();
        this[step] = true;
        this.currentStep = step;
    }

    resetSteps() {
        this.MainInfo = false;
        this.StudentInformationDetails = false;
        this.ParentIncomeDetails = false;
        this.ContactDetails = false;
        this.PreviousStudyDetails = false;
        this.BankDetails = false;
        this.AttachmentDetails = false;
        this.CourseDetails = false;
    }
    validateAllFields() {
        const inputFields = [...this.template.querySelectorAll('lightning-input-field')];
        let allValid = true;

        inputFields.forEach(inputField => {
            if (!inputField.reportValidity()) {
                allValid = false;
            }
        });

        return allValid;
    }

    nextStep() {
        if (!this.validateAllFields()) {
            event.preventDefault();
            return;
        }
        this.resetSteps();
        switch (this.currentStep) {
            case '1':
                this.StudentInformationDetails = true;
                this.currentStep = '2';
                break;
            case '2':
                this.CourseDetails = true;
                this.currentStep = '3';
                break;
            case '3':
                this.ParentIncomeDetails = true;
                this.currentStep = '4';
                break;
            case '4':
                this.ContactDetails = true;
                this.currentStep = '5';
                break;
            case '5':
                this.BankDetails = true;
                this.currentStep = '6';
                break;
            case '6':
                this.PreviousStudyDetails = true;
                this.currentStep = '7';
                break;
            case '7':
                this.AttachmentDetails = true;
                this.currentStep = '8';
                break;
            default:
                this.MainInfo = true;
                this.currentStep = '1';
        }

    }

    @track hallTktNo = '';
    @track StdAdmType = '';
    @track StdIdentMarks1 = '';
    @track StdIdentMarks2 = '';
    @track StdRank = '';
    @track AgrFee = '';
    @track FeeType = '';
    @track ICETHallTktNo = '';

    @track StdName = '';
    @track StdDOB = '';
    @track StdNationality = '';
    @track StdCaste = '';
    @track Stdgender = '';
    @track StdSpecialCategory = '';
    @track Stdreligion = '';
    @track Stdsubcaste = '';

    @track sscRegNo = '';
    @track AadharNo = '';
    @track StdCourse = '';
    @track sscYOP = '';
    @track Doj = '';
    @track specializatn = '';
    @track firstYear = false;
    @track StdCourseName = '';
    @track CourseYear = '';
    @track CourseSem = '';

    @track fatherName = '';
    @track ParentOccupation = '';
    @track fatherPhn = '';
    @track motherName = '';
    @track parentIncome = '';

    @track StdEmail = '';
    @track StdPhnNo = '';
    @track StdAltPhn = '';
    @track IsAddressSame = false;

    @track permanentStreet = '';
    @track permanentCity = '';
    @track permanentState = '';
    @track permanentPostalCode = '';
    @track permanentCountry = '';

    @track communicationStreet = '';
    @track communicationCity = '';
    @track communicationState = '';
    @track communicationPostalCode = '';
    @track communicationCountry = '';

    @track bankName = '';
    @track bankAccNo = '';
    @track branchName = '';
    @track Ifsc = '';

    StdHallTktChange(event) {
        this.hallTktNo = event.target.value;
    }
    StdAdmTypeChange(event) {
        this.StdAdmType = event.target.value;
    }
    StdIdentMarks1Change(event) {
        this.StdIdentMarks1 = event.target.value;
    }
    StdIdentMarks2Change(event) {
        this.StdIdentMarks2 = event.target.value;
    }
    StdRankChange(event) {
        this.StdRank = event.target.value;
    }
    AgrFeeChange(event) {
        const value = event.target.value;
        if (this.StdAdmType === 'Convenor Quota' || !value) {
            this.AgrFee = 0; // Set to 0 for Convenor Quota or if no value is provided
        } else {
            this.AgrFee = value; // Use the provided value
        }
        this.updateFeeFieldsState(); // Ensure fields are updated after change
    }
    FeeTypeChange(event) {
        this.FeeType = event.target.value;
    }
    ICETHallTktNoChange(event) {
        this.ICETHallTktNo = event.target.value;
    }
    get isManagementQuota() {
        return this.StdAdmType !== 'Management Quota' && this.StdAdmType !== 'Spot Registration';
    }

    updateFeeFieldsState() {
        const feeFields = this.template.querySelectorAll('.fee-field');
        feeFields.forEach(field => {
            field.disabled = !this.isManagementQuota;
        });
    }


    StudentNameChange(event) {
        this.StdName = event.target.value;
    }

    DOBChange(event) {
        this.StdDOB = event.target.value;
    }
    StdNationalityChange(event) {
        this.StdNationality = event.target.value;
    }
    StdCasteChange(event) {
        this.StdCaste = event.target.value;
    }
    StdgenderChange(event) {
        this.Stdgender = event.target.value;
    }
    StdSpecialCategoryChange(event) {
        this.StdSpecialCategory = event.target.value;
    }
    StdreligionChange(event) {
        this.Stdreligion = event.target.value;
    }
    StdsubcasteChange(event) {
        this.Stdsubcaste = event.target.value;
    }
    StdFathPhnChange(event) {
        this.StdFathPhn = event.target.value;
    }

    SSCRegNoChange(event) {
        this.sscRegNo = event.target.value;
    }
    AadharNoChange(event) {
        this.AadharNo = event.target.value;
    }
    @wire(getCourses)
    wiredCourseValues({ error, data }) {
        if (data) {
            this.CourseOptions = data.map(course => {
                return { label: course.Name, value: course.Id };
            });
        } else if (error) {
            console.error('Error fetching course picklist values:', error);
        }
    }
    handleCourseChange(event) {
        this.selectedCourse = event.target.value;
        populateCourseDetails({ courseId: this.selectedCourse })
            .then(result => {
                if (result) {
                    this.StdCourse = result.educx__Course__c;
                    this.StdCourseName = result.educx__Course_Name__c;
                } else {
                    this.StdCourse = '';
                    this.StdCourseName = '';
                }
            })
            .catch(error => {
                console.error('Error fetching course details:', error);
            });
    }
    sscYOPChange(event) {
        this.sscYOP = event.target.value;
    }
    DojChange(event) {
        this.Doj = event.target.value;
    }
    StdCourseChange(event) {
        this.StdCourse = event.target.value;
    }
    StdCourseNameChange(event) {
        this.StdCourseName = event.target.value;
    }
    CourseYearChange(event) {
        this.CourseYear = event.target.value;
    }
    CourseSemChange(event) {
        this.CourseSem = event.target.value;
    }
    //parentIncomeDetails
    fatherNameChange(event) {
        this.fatherName = event.target.value;
    }
    ParentOccupationChange(event) {
        this.ParentOccupation = event.target.value;
    }
    fatherPhnChange(event) {
        this.fatherPhn = event.target.value;
    }
    motherNameChange(event) {
        this.motherName = event.target.value;
    }
    parentIncomeChange(event) {
        this.parentIncome = event.target.value;
    }
    //contact details
    StudentMailChange(event) {
        this.StdEmail = event.target.value;
    }
    StdPhnNoChange(event) {
        this.StdPhnNo = event.target.value;
    }
    StdAltPhnChange(event) {
        this.StdAltPhn = event.target.value;
    }
    IsAddressSameChange(event) {
        this.IsAddressSame = event.target.value;
        if (this.IsAddressSame) {
            this.communicationStreet = this.permanentStreet;
            this.communicationCity = this.permanentCity;
            this.communicationState = this.permanentState;
            this.communicationPostalCode = this.permanentPostalCode;
            this.communicationCountry = this.permanentCountry;
        }
        else {
            this.communicationStreet = '';
            this.communicationCity = '';
            this.communicationState = '';
            this.communicationPostalCode = '';
            this.communicationCountry = '';
        }
    }
    get isCommAddressDisabled() {
        return this.IsAddressSame;
    }
    CommunicationStreetChange(event) {
        this.communicationStreet = event.target.value;
    }

    CommunicationCityChange(event) {
        this.communicationCity = event.target.value;
    }

    CommunicationStateChange(event) {
        this.communicationState = event.target.value;
    }

    CommunicationPostalCodeChange(event) {
        this.communicationPostalCode = event.target.value;
    }

    CommunicationCountryChange(event) {
        this.communicationCountry = event.target.value;
    }
    //bank details
    bankNameChange(event) {
        this.bankName = event.target.value;
    }
    bankAccNoChange(event) {
        this.bankAccNo = event.target.value;
    }
    branchNameChange(event) {
        this.branchName = event.target.value;
    }
    IfscChange(event) {
        this.Ifsc = event.target.value;
    }

    PermanentStreetChange(event) {
        this.permanentStreet = event.target.value;
    }
    PermanentCityChange(event) {
        this.permanentCity = event.target.value;
    }

    PermanentStateChange(event) {
        this.permanentState = event.target.value;
    }

    PermanentPostalCodeChange(event) {
        this.permanentPostalCode = event.target.value;
    }

    PermanentCountryChange(event) {
        this.permanentCountry = event.target.value;
    }
    @track Rtf = '';

    @track StudentId;
    SubmitStudentInfo() {

        let studentData = {

            educx__Hall_Ticket_No__c: this.hallTktNo,
            educx__Admission_Type__c: this.StdAdmType,
            educx__Identification_Mark_1__c: this.StdIdentMarks1,
            educx__Identification_Mark_2__c: this.StdIdentMarks2,
            educx__ICET_Rank__c: this.StdRank,
            educx__Agreement_Fee__c: this.AgrFee,
            educx__Fee_Type__c: this.FeeType,
            educx__ICET_Hall_Ticket_No__c: this.ICETHallTktNo,
            educx__Aadhar_Number__c: this.AadharNo,
            educx__Is_RTF__c: this.Rtf,

            educx__Name_of_The_Father__c: this.fatherName,
            educx__Parent_Occupation__c: this.ParentOccupation,
            educx__Father_Phone__c: this.fatherPhn,
            educx__Name_of_The_Mother__c: this.motherName,
            educx__Parent_Income__c: this.parentIncome,
            educx__Alternate_Mobile_No__c: this.StdAltPhn,


            educx__Name_of_The_Candidate__c: this.StdName,
            educx__Date_of_Birth__c: this.StdDOB,
            educx__Nationality__c: this.StdNationality,
            educx__Caste__c: this.StdCaste,
            educx__Gender__c: this.Stdgender,
            educx__Special_Category__c: this.StdSpecialCategory,
            educx__Religion__c: this.Stdreligion,
            educx__Sub_Caste__c: this.Stdsubcaste,

            educx__SSC_Registration_No__c: this.sscRegNo,
            educx__SSC_Year_of_Passing__c: this.sscYOP,
            educx__Joining_Date__c: this.Doj,
            educx__Course_Code__c: this.StdCourseCode,
            educx__Course__c: this.StdCourse,
            educx__Course_Name__c: this.StdCourseName,
            educx__IsFirstYear__c: this.firstYear,
            educx__Year__c: this.CourseYear,
            educx__Semester__c: this.CourseSem,

            educx__Email__c: this.StdEmail,
            educx__Phone_Number__c: this.StdPhnNo,

            educx__Permanent_Address__Street__s: this.permanentStreet,
            educx__Permanent_Address__City__s: this.permanentCity,
            educx__Permanent_Address__StateCode__s: this.permanentState,
            educx__Permanent_Address__PostalCode__s: this.permanentPostalCode,
            educx__Permanent_Address__CountryCode__s: this.permanentCountry,

            educx__Communication_Address__Street__s: this.communicationStreet,
            educx__Communication_Address__City__s: this.communicationCity,
            educx__Communication_Address__StateCode__s: this.communicationState,
            educx__Communication_Address__PostalCode__s: this.communicationPostalCode,
            educx__Communication_Address__CountryCode__s: this.communicationCountry,

            educx__Bank_Name__c: this.bankName,
            educx__Bank_Account_Number__c: this.bankAccNo,
            educx__Branch_Name__c: this.branchName,
            educx__IFSC_Code__c: this.Ifsc,
        };

        // Serialize the object to JSON
        let studentDataJson = JSON.stringify(studentData);

        insertStudentData({ studentData: studentDataJson })
            .then((result) => {
                this.StudentId = result;
                 this.template.querySelector('c-toast-message').showToast('Registration done Successfully !!!', 'Success', 'success');
            })
            .catch(error => {
                console.error("err: " + JSON.stringify(error));
                 this.template.querySelector('c-toast-message').showToast('An error occurred while Registration !!', 'Error', 'error');
            });
        this.nextStep();
    }
    @track itemList = [{ id: 0 }];
    keyIndex = 0;

    addRow() {
        if (this.itemList.length < 7) { // Limit the number of rows to 7
            ++this.keyIndex;
            this.itemList = [...this.itemList, { id: this.keyIndex }];
        }
    }

    removeRow(event) {
        if (this.itemList.length > 1) { // Ensure there's at least one row left
            const indexToRemove = parseInt(event.target.dataset.id, 10);
            if (!isNaN(indexToRemove)) {
                this.itemList = this.itemList.filter(item => item.id !== indexToRemove);
            }
        }
    }

    handleSubmit() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            isValid = isValid && element.reportValidity();
        });

        if (isValid) {
            this.template.querySelectorAll('lightning-record-edit-form').forEach(element => {
                element.submit();
            });
             this.template.querySelector('c-toast-message').showToast('Study details saved successfully.', '', 'success');
            this.nextStep();
        } else {
            console.log('Error saving study details');
             this.template.querySelector('c-toast-message').showToast('Error saving study details.', '', 'error');
        }
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                if (!field.classList.contains('studentfield')) {
                    field.reset();
                }
            });
        }
    }
    @track previewDetails = false;
    @track editPage=false;
    handlePreviewClose(event){
        this.editPage=false;
    }
    handlePreview() {
        this.editPage=true;
        this.closeRegPopUp();
    }
}