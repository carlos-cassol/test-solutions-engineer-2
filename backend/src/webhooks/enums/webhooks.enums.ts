export enum MaintenanceStatus {
	CREATED = 'maintenance.created',
	IDENTIFIED = 'maintenance.identified',
	APPROVED = 'maintenance.approved',
	EXECUTING = 'maintenance.executing',
	COMPLETED = 'maintenance.completed',
}

export enum MaintenanceType {
	PREVENTIVE = 'preventive',
	CORRECTIVE = 'corrective',
	EMERGENCY = 'emergency',
}
