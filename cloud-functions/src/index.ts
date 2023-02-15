import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import cors = require('cors');
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { chainProperties, responseMessages } from './constants';
import { IMultisigAddress, IUser, IUserResponse } from './types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import isValidSubstrateAddress from './utlils/isValidSubstrateAddress';
import getSubstrateAddress from './utlils/getSubstrateAddress';
import _createMultisig from './utlils/_createMultisig';
import '@polkadot/api-augment';

const IS_DEVELOPMENT = true;

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

	return multisigAddresses.docs.map((doc) => ({
		...doc.data(),
		created_at: doc.data().created_at.toDate()
	})) as IMultisigAddress[];
};

export const getConnectAddressToken = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const address = req.get('x-address');
		if (!address) return res.status(400).json({ error: responseMessages.missing_params });
		if (!isValidSubstrateAddress(address)) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			// check if address doc already exists
			const token = `<Bytes>${uuidv4()}</Bytes>`;

			const substrateAddress = getSubstrateAddress(String(address));
			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
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

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			// check if address doc already exists
			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			const doc = await addressRef.get();
			if (doc.exists) {
				const addressDoc = {
					...doc.data(),
					created_at: doc.data()?.created_at.toDate()
				} as IUser;

				const multisigAddresses = await getMultisigAddressesByAddress(substrateAddress);

				const resUser: IUserResponse = {
					address: addressDoc.address,
					email: addressDoc.email,
					created_at: addressDoc.created_at,
					addressBook: addressDoc.addressBook,
					multisigAddresses
				};

				return res.status(200).json({ data: resUser });
			}

			// else create a new user document
			const newUser:IUser = {
				address: String(substrateAddress),
				created_at: new Date(),
				email: null,
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

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const { name, address: addressToAdd } = req.body;
			const substrateAddressToAdd = getSubstrateAddress(String(addressToAdd));
			if (!name || !substrateAddressToAdd) return res.status(400).json({ error: responseMessages.missing_params });

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			const doc = await addressRef.get();
			if (doc.exists) {
				const addressDoc = {
					...doc.data(),
					created_at: doc.data()?.created_at.toDate()
				} as IUser;
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

export const createMultisig = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { signatories, threshold, multisigName, network } = req.body;
		if (!signatories || !threshold || !multisigName || !network) {
			return res.status(400).json({ error: responseMessages.missing_params });
		}

		if (Array.isArray(signatories)) {
			if (signatories.length < 2) {
				return res.status(400).json({ error: responseMessages.min_singatories });
			}
		} else {
			return res.status(400).json({ error: responseMessages.invalid_params });
		}

		if (isNaN(threshold) || threshold > signatories.length) {
			return res.status(400).json({ error: responseMessages.invalid_threshold });
		}

		try {
			// sort is important to check if multisig with same signatories already exists
			const substrateSignatories = signatories.map((signatory) => getSubstrateAddress(String(signatory))).sort();

			// check if the multisig with same signatories already exists
			const multisigQuerySnapshot = await firestoreDB
				.collection('multisigAddresses')
				.where('signatories', '==', substrateSignatories)
				.get();

			if (!multisigQuerySnapshot.empty) return res.status(400).json({ error: responseMessages.multisig_exists });

			const provider = new WsProvider(chainProperties?.[String(network).toLowerCase()]?.rpcEndpoint);
			const api = await ApiPromise.create({ provider });

			const options = { genesisHash: IS_DEVELOPMENT ? undefined : api.genesisHash.toString(), name: multisigName.trim() };
			const { multisigAddress, error } = _createMultisig(substrateSignatories, threshold, options);
			if (error || !multisigAddress) return res.status(400).json({ error: error || responseMessages.internal });

			functions.logger.info('New multisig created with an address of ', multisigAddress);

			const newMultisig: IMultisigAddress = {
				address: multisigAddress,
				created_at: new Date(),
				name: multisigName,
				signatories: substrateSignatories,
				network: String(network).toLowerCase()
			};

			const multisigRef = firestoreDB.collection('multisigAddresses').doc(multisigAddress);
			await multisigRef.set(newMultisig);

			return res.status(200).json({ data: newMultisig });
		} catch (err:unknown) {
			functions.logger.error('Error in firestore call :', { err });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.
