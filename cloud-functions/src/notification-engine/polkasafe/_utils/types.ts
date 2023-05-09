export interface IPolkasafeNotification {
	id: string,
	address: string,
	created_at: Date,
	message: string,
	link?: string,
	type: 'sent' | 'recieved' | 'cancelled' | 'info',
	network: string
}
