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

export interface IMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
}

export interface IUserResponse extends Omit<IUser, 'multisigAddresses'> {
	multisigAddresses: IMultisigAddress[];
}

export interface IToken {
	token: string;
}
