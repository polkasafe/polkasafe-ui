import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import cors = require('cors');
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { chainProperties, DEFAULT_MULTISIG_NAME, responseMessages } from './constants';
import { IMultisigAddress, IUser, IUserResponse } from './types';
import isValidSubstrateAddress from './utlils/isValidSubstrateAddress';
import getSubstrateAddress from './utlils/getSubstrateAddress';
import _createMultisig from './utlils/_createMultisig';
import '@polkadot/api-augment';
import getOnChainMultisigByAddress from './utlils/getOnChainMultisigByAddress';
import getOnChainMultisigMetaData from './utlils/getOnChainMultisigMetaData';

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
			functions.logger.error('Error in getConnectAddressToken :', { err, stack: (err as any).stack });
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
				const data = doc.data();
				if (data && data.created_at) {
					const addressDoc = {
						...data,
						created_at: data?.created_at.toDate()
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
			functions.logger.error('Error in connectAddress :', { err, stack: (err as any).stack });
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
			functions.logger.error('Error in addToAddressBook :', { err, stack: (err as any).stack });
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

		if (!Array.isArray(signatories)) return res.status(400).json({ error: responseMessages.invalid_params });

		if (isNaN(threshold) || Number(threshold) > signatories.length || signatories.length < 2) {
			return res.status(400).json({ error: responseMessages.invalid_threshold });
		}

		try {
			// sort is important to check if multisig with same signatories already exists
			const substrateSignatories = signatories.map((signatory) => getSubstrateAddress(String(signatory))).sort();

			// check if the multisig with same signatories already exists in our db
			const multisigQuerySnapshot = await firestoreDB
				.collection('multisigAddresses')
				.where('signatories', '==', substrateSignatories)
				.get();

			if (!multisigQuerySnapshot.empty) return res.status(400).json({ error: responseMessages.multisig_exists });

			const { multisigAddress, error: createMultiErr } = _createMultisig(substrateSignatories, Number(threshold), chainProperties[network].ss58Format);
			if (createMultiErr || !multisigAddress) return res.status(400).json({ error: createMultiErr || responseMessages.multisig_create_error });

			// check if multisig already exists on chain
			const { data: onChainMultisigData, error: onchainFetchErr } = await getOnChainMultisigByAddress(multisigAddress, network);
			if (onchainFetchErr) return res.status(400).json({ error: onchainFetchErr || responseMessages.onchain_multisig_fetch_error });
			if (onChainMultisigData && onChainMultisigData.count > 0) return res.status(400).json({ error: responseMessages.multisig_exists });

			const newMultisig: IMultisigAddress = {
				address: multisigAddress,
				created_at: new Date(),
				name: multisigName,
				signatories: substrateSignatories,
				network: String(network).toLowerCase(),
				threshold: Number(threshold)
			};

			const multisigRef = firestoreDB.collection('multisigAddresses').doc(multisigAddress);
			await multisigRef.set(newMultisig);

			functions.logger.info('New multisig created with an address of ', multisigAddress);
			return res.status(200).json({ data: newMultisig });
		} catch (err:unknown) {
			functions.logger.error('Error in createMultisig :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const getMultisigDataByMultisigAddress = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress, network } = req.body;
		if (!multisigAddress || !network) {
			return res.status(400).json({ error: responseMessages.missing_params });
		}

		try {
			// check if the multisig already exists in our db
			const multisigRef = await firestoreDB.collection('multisigAddresses').doc(String(multisigAddress)).get();
			if (multisigRef.exists) {
				const data = multisigRef.data();
				return res.status(200).json({ data: {
					...data,
					created_at: data?.created_at.toDate()
				} });
			}

			const { data: multisigMetaData, error: multisigMetaDataErr } = await getOnChainMultisigMetaData(multisigAddress, network);
			if (multisigMetaDataErr) return res.status(400).json({ error: multisigMetaDataErr || responseMessages.onchain_multisig_fetch_error });
			if (multisigMetaData && isNaN(multisigMetaData.threshold) || multisigMetaData.signatories.length <= 1) {
				return res.status(400).json({ error: responseMessages.multisig_not_found });
			}

			const newMultisig: IMultisigAddress = {
				address: multisigAddress,
				created_at: new Date(),
				name: DEFAULT_MULTISIG_NAME,
				signatories: multisigMetaData.signatories,
				network: String(network).toLowerCase(),
				threshold: Number(multisigMetaData.threshold)
			};

			// make a copy to db
			const newMultisigRef = firestoreDB.collection('multisigAddresses').doc(multisigAddress);
			await newMultisigRef.set(newMultisig);

			// TODO: after implementation, check if we should send this response before saving to db
			return res.status(200).json({ data: newMultisig });
		} catch (err:unknown) {
			functions.logger.error('Error in getMultisigByMultisigAddress :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.
