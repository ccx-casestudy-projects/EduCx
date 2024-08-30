public class LeaveSchedular implements Schedulable 
{
    public static void execute(SchedulableContext sc) 
    {
        List<educx__Employee_Leave_Account__c> emps = [SELECT Id, educx__Employee__c,educx__Number_of_Availed_Leaves__c, educx__Number_of_Balance_Leaves__c ,educx__Loss_of_Pay__c
                 									   FROM educx__Employee_Leave_Account__c];
        
        // Check if emps is not null and not empty
        if (emps != null && !emps.isEmpty()) {
            System.debug('Total employees:- ' + emps.size());

            for (educx__Employee_Leave_Account__c empLeaveAcc : emps) {
                System.debug('employee Id:- ' + empLeaveAcc .Id);

                if (empLeaveAcc  != null) {
                    try 
			{
                       // empLeaveAcc .educx__Number_of_Availed_Leaves__c=0;
                        empLeaveAcc .educx__Loss_of_Pay__c=0;
                        empLeaveAcc .educx__Number_of_Balance_Leaves__c=empLeaveAcc.educx__Number_of_Balance_Leaves__c+1;
                       }
                    catch (Exception ex) {
                        System.debug('Exception during leave processing for employee ' + empLeaveAcc .Id + ': ' + ex.getMessage());
                    }
                }
            }
            update emps;
        }
    }
}

/*LeaveSchedular e = new LeaveSchedular();
//String cronExpression = '0 48 10 29 * ?';
//String cronExpression = '0 59 23 L * ?';
id jobId=system.Schedule('leaveMonthlyUpdateJob',cronExpression,e);*/