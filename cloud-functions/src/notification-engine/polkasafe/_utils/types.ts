export interface IPSNotification {
	id: string,
	address: string,
	created_at: Date,
	message: string,
	link?: string,
	type: 'sent' | 'recieved' | 'cancelled' | 'info',
	network: string
}

export interface IPSTransaction {
	callData?: string;
	callHash: string;
	created_at: Date;
	block_number: number;
	from: string;
	to: string;
	id: string;
	token: string;
	amount_usd: number;
	amount_token: number;
	network: string;
	note?: string;
}

export interface IPSMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
	network: string;
	created_at: Date;
	updated_at?: Date;
	threshold: number;
	proxy?: string
	disabled?: boolean
}

export interface IPSAddressBookItem {
	name: string;
	address: string;
}

export interface IPSMultisigSettings {
	deleted: boolean;
	name: string;
}

export interface IUser {
	address: string;
	email: string | null;
	addressBook?: IPSAddressBookItem[];
	created_at: Date;
	multisigAddresses: IPSMultisigAddress[];
	multisigSettings: { [multisigAddress: string]: IPSMultisigSettings};
}
