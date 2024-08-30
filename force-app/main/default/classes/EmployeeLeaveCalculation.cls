public without sharing class EmployeeLeaveCalculation {

    public static void beforeleaveRecCreation(List<educx__Employee_Leave_Account__c> newEmployees) {
        for (educx__Employee_Leave_Account__c emp : newEmployees) {
            // Perform any updates to fields before insert
            Date today = Date.today();
            Decimal totalLeaves = 12 - today.month() + 1;

            // Casual Leaves
            emp.educx__Number_of_Balance_Leaves__c = today.month() - (today.month() - 1);
            emp.educx__Number_of_Availed_Leaves__c = 0;
        }
    }

    public static void empLeaveDetails(List<educx__Employee_Leave_Details__c> employeeLeaveDetails) {
        educx__Employee_Leave_Account__c leaveAcc;
        for (educx__Employee_Leave_Details__c eld : employeeLeaveDetails) {

            // Check if the leave status is "Approved"
            if (eld.educx__Leave_Status__c == 'Approved') {
                // Fetch the associated Employee record
                educx__Employees__c emp = [SELECT Id
                                           FROM educx__Employees__c
                                           WHERE Id = :eld.educx__Employee__c];

                // Fetch the leave record details
                educx__Employee_Leave_Details__c leave = [SELECT Id, educx__From_Date__c, educx__To_Date__c, Name
                                                         FROM educx__Employee_Leave_Details__c
                                                         WHERE Id = :eld.Id LIMIT 1];

                // Fetch the leave account details
                leaveAcc = [SELECT Id, educx__Number_of_Availed_Leaves__c, educx__Number_of_Balance_Leaves__c, educx__Loss_of_Pay__c
                           FROM educx__Employee_Leave_Account__c
                           WHERE Id = :eld.educx__Employee_Leave_Account__c LIMIT 1];

                Decimal LossOfPay = leaveAcc.educx__Loss_of_Pay__c;
                Integer leavesInThisRecord = 0;
                Decimal leavesInMonth = leaveAcc.educx__Number_of_Balance_Leaves__c;
                Decimal AvailedLeaves = leaveAcc.educx__Number_of_Availed_Leaves__c;

                System.debug('Processing leave request: ' + leave.Name);
                Date currentDate = Date.today();
                Integer currentMonth = currentDate.month();

                // Calculating Leave

                // Check if leave period overlaps with the current month
                if (leave.educx__From_Date__c != null && leave.educx__To_Date__c != null) {
                    // By taking the month we are equating the current month
                    if (leave.educx__From_Date__c.Month() == currentMonth && leave.educx__To_Date__c.Month() == currentMonth) {
                        // Calculating leaves
                        Integer totalLeaves = leave.educx__From_Date__c.daysBetween(leave.educx__To_Date__c) + 1;
                        leavesInThisRecord = leavesInThisRecord + totalLeaves;

                        // It calculates based on record (by considering its present month)
                        if (totalLeaves == leavesInMonth) {
                            leavesInMonth = 0;
                            AvailedLeaves = totalLeaves;
                        } else if (totalLeaves > leavesInMonth) {
                            AvailedLeaves = totalLeaves;
                            LossOfPay = LossOfPay + totalLeaves - leavesInMonth;
                            leavesInMonth = 0;
                        } else if (totalLeaves < leavesInMonth) {
                            leavesInMonth = leavesInMonth - totalLeaves;
                            AvailedLeaves = totalLeaves;
                        }
                    }

                    // Case where From Date equals the current month and To Date equals the next month
                    else if (
                        (leave.educx__From_Date__c.Month() == currentMonth && leave.educx__To_Date__c.Month() != currentMonth) ||
                        (leave.educx__To_Date__c.Month() == currentMonth && leave.educx__From_Date__c.Month() != currentMonth)) {

                        Integer lastDayOfMonth = Date.daysInMonth(leave.educx__From_Date__c.year(), leave.educx__From_Date__c.Month());
                        Integer leavesInLastMonth = lastDayOfMonth - leave.educx__From_Date__c.Day() + 1;
                        Integer totalLeaves1 = leavesInLastMonth + leave.educx__To_Date__c.Day();
                        leavesInThisRecord = totalLeaves1;

                        if (totalLeaves1 == leavesInMonth) {
                            leavesInMonth = leavesInMonth - totalLeaves1;
                            AvailedLeaves = totalLeaves1;
                        } else if (totalLeaves1 > leavesInMonth) {
                            AvailedLeaves = totalLeaves1;
                            LossOfPay = LossOfPay + totalLeaves1 - leavesInMonth;
                            leavesInMonth = 0;
                        } else if (totalLeaves1 < leavesInMonth) {
                            leavesInMonth = leavesInMonth - totalLeaves1;
                            AvailedLeaves = totalLeaves1;
                        }
                    }
                }

                // Update the leave account fields
                leaveAcc.educx__Number_of_Availed_Leaves__c = leaveAcc.educx__Number_of_Availed_Leaves__c + leavesInThisRecord;
                leaveAcc.educx__Loss_of_Pay__c = LossOfPay;
                leaveAcc.educx__Number_of_Balance_Leaves__c = leavesInMonth;
                update leaveAcc;
            }
        }
    }
    
    public static void validateOverlappingLeave(List<educx__Employee_Leave_Details__c> newLeaveList)
    {
        for (educx__Employee_Leave_Details__c newLeave : newLeaveList) 
        {
            List<educx__Employee_Leave_Details__c> overlappingLeaves = [ SELECT Id 
                														 FROM educx__Employee_Leave_Details__c
                														 WHERE educx__Employee__c = :newLeave.educx__Employee__c
                                                                         AND ((educx__From_Date__c <= :newLeave.educx__To_Date__c AND educx__To_Date__c >= :newLeave.educx__From_Date__c))
                														 AND Id != :newLeave.Id  
                														 LIMIT 1];

            
            if (!overlappingLeaves.isEmpty())
            {
                newLeave.addError('Leave already applied for the selected date range.');
            }
        }
    }

}