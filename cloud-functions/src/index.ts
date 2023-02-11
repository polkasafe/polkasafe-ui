import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import cors = require('cors');
import { checkAddress, cryptoWaitReady, decodeAddress, encodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { responseMessages } from './constants';
import { IMultisigAddress, IUser, IUserResponse } from './types';

admin.initializeApp();

const firestoreDB = admin.firestore();

// TODO: Remove cors before production
const corsHandler = cors({ origin: true });

const isValidRequest = async (address?:string, signature?:string): Promise<{ isValid: boolean, error: string }> => {
	if (!address || !signature) return { isValid: false, error: responseMessages.missing_params };
	if (!isValidSubstrateAddress(address)) return { isValid: false, error: responseMessages.invalid_params };

	const isValid = await isValidSignature(signature, address);
	if (!isValid) return { isValid: false, error: responseMessages.invalid_signature };
	return { isValid: true, error: '' };
};

const isValidSubstrateAddress = (address:string): boolean => {
	return Boolean(checkAddress(address, 42));
};

const isValidSignature = async (signature:string, address:string) => {
	try {
		await cryptoWaitReady();
		const hexPublicKey = u8aToHex(decodeAddress(address));

		const addressDoc = await firestoreDB.collection('addresses').doc(address).get();
		const addressData = addressDoc.data();
		if (!addressData?.token) return false;

		return signatureVerify(addressData?.token, signature, hexPublicKey).isValid;
	} catch (e) {
		return false;
	}
};

const getMultisigAddressesByAddress = async (address:string) => {
	const multisigAddresses = await admin
		.firestore()
		.collection('multisigAddresses')
		.where('signatories', 'array-contains', address)
		.get();

	return multisigAddresses.docs.map((doc) => doc.data()) as IMultisigAddress[];
};

const getSubstrateAddress = (address: string): string => {
	if (address.startsWith('0x')) return address;
	return encodeAddress(address, 42);
};

export const getConnectAddressToken = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const address = req.get('x-address');
		if (!address) return res.status(400).json({ error: responseMessages.missing_params });
		if (!isValidSubstrateAddress(address)) return res.status(400).json({ error: responseMessages.invalid_params });

		const substrateAddress = getSubstrateAddress(String(address));

		// check if address doc already exists
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);

		const token = `<Bytes>${uuidv4()}</Bytes>`;

		try {
			await addressRef.set({ address: substrateAddress, token }, { merge: true });
			return res.status(200).json({ data: token });
		} catch (err:unknown) {
			functions.logger.error('Error in firestore call :', { err });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const connectAddress = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const substrateAddress = getSubstrateAddress(String(address));

		// check if address doc already exists
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);

		try {
			const doc = await addressRef.get();
			if (doc.exists) {
				const addressDoc = doc.data() as IUser;
				const multisigAddresses = await getMultisigAddressesByAddress(substrateAddress);

				const resUser: IUserResponse = {
					address: addressDoc.address,
					email: addressDoc.email,
					addressBook: addressDoc.addressBook,
					multisigAddresses
				};
				return res.status(200).json({ data: resUser });
			}

			// else create a new user document
			const newUser:IUser = {
				address: String(substrateAddress),
				email: null,
				multisigAddresses: [],
				addressBook: []
			};

			await addressRef.set(newUser);
			return res.status(200).json({ data: newUser });
		} catch (err:unknown) {
			functions.logger.error('Error in firestore call :', { err });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const addToAddressBook = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const substrateAddress = getSubstrateAddress(String(address));

		const { name, address: addressToAdd } = req.body;
		const substrateAddressToAdd = getSubstrateAddress(String(addressToAdd));
		if (!name || !substrateAddressToAdd) return res.status(400).json({ error: responseMessages.missing_params });

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);

		try {
			const doc = await addressRef.get();
			if (doc.exists) {
				const addressDoc = doc.data() as IUser;
				const addressBook = addressDoc.addressBook || [];
				const newAddressBook = [...addressBook, { name, address: substrateAddressToAdd }];
				await addressRef.set({ addressBook: newAddressBook }, { merge: true });
				return res.status(200).json({ data: newAddressBook });
			}
			return res.status(400).json({ error: responseMessages.invalid_params });
		} catch (err:unknown) {
			functions.logger.error('Error in firestore call :', { err });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.
