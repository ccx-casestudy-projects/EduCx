// verticalButtonGroup.js
import { LightningElement,api } from 'lwc';

export default class NavigationMenu extends LightningElement {
    
    currentContent = '';
    isStudentManagement = false;
    @api isFeeManagement = false;
    isFacultyManagement = false;
    isCourseManagement = false;
    isProcurementManagement = false;
    isExamManagement = false;
    isTimeTablesAlmanacManagement = false;
    isEventManagement = false;
    isLibraryManagement = false;
    isDocumentsManagement = false;
    isAttendanceManagement = false;
    isAlumniManagement = false;
    isAlmanacManagement=false;
    isApprovalManagement=false;
    connectedCallback() {
        
        this.isStudentManagement = true;
        
    }

    // Method to handle button click events
    handleButtonClick(event) {
        const buttonName = event.target.name;
        // Reset all flags to false
        this.resetFlags();

        // Set the current content based on buttonName
        this.currentContent = buttonName.replace('_', ' ');

        // Set the appropriate flag based on buttonName to true
        switch(buttonName) {
            case 'Student_Management':
                this.isStudentManagement = true;
                break;
            case 'Fee_Management':
                this.isFeeManagement = true;
                break;
            case 'Faculty_Management':
                this.isFacultyManagement = true;
                break;
            case 'Course_Management':
                this.isCourseManagement = true;
                break;
            case 'Procurement_Management':
                this.isProcurementManagement = true;
                break;
            case 'Exam_Management':
                this.isExamManagement = true;
                break;
            case 'Time_Tables_Management':
                this.isTimeTablesManagement = true;
                break;
            case 'Event_Management':
                this.isEventManagement = true;
                break;
            case 'Library_Management':
                this.isLibraryManagement = true;
                break;
            case 'Documents_Management':
                this.isDocumentsManagement = true;
                break;
            case 'Attendance_Management':
                this.isAttendanceManagement = true;
                break;
            case 'Alumni_Management':
                this.isAlumniManagement = true;
                break;
                 case 'Almanac_Management':
                this.isAlmanacManagement = true;
                break;
                case 'Approval_Management':
                    this.isApprovalManagement = true;
                    break;
            default:
                break;
        }
    }

    // Method to reset all flags to false
    resetFlags() {
        this.isStudentManagement = false;
        this.isFeeManagement = false;
        this.isFacultyManagement = false;
        this.isCourseManagement = false;
        this.isProcurementManagement = false;
        this.isExamManagement = false;
        this.isTimeTablesManagement = false;
        this.isEventManagement = false;
        this.isLibraryManagement = false;
        this.isDocumentsManagement = false;
        this.isAttendanceManagement = false;
        this.isAlumniManagement = false;
        this.isAlmanacManagement=false;
        this.isApprovalManagement=false;
    }
    
}