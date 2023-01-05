interface IAddressBookEntry {
	name: string;
	address: string;
}

export interface IUser {
	address: string;
	email: string | null;
	multisigAddresses: string[];
	addressBook?: IAddressBookEntry[];
}
