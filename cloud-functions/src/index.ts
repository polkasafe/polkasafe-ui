import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import cors = require('cors');
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { IContactFormResponse, IFeedback, IMultisigAddress, IUser, IUserResponse } from './types';
import isValidSubstrateAddress from './utlils/isValidSubstrateAddress';
import getSubstrateAddress from './utlils/getSubstrateAddress';
import _createMultisig from './utlils/_createMultisig';
import '@polkadot/api-augment';
import getOnChainMultisigByAddress from './utlils/getOnChainMultisigByAddress';
import getOnChainMultisigMetaData from './utlils/getOnChainMultisigMetaData';
import getTransactionsByAddress from './utlils/getTransactionsByAddress';
import _getAssetsForAddress from './utlils/_getAssetsForAddress';
import { chainProperties } from './constants/network_constants';
import { DEFAULT_MULTISIG_NAME } from './constants/defaults';
import { responseMessages } from './constants/response_messages';

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

				// check if address already exists in address book
				const addressIndex = addressBook.findIndex((a) => a.address == substrateAddressToAdd);
				if (addressIndex > -1) {
					addressBook[addressIndex] = { name, address: substrateAddressToAdd };
					await addressRef.set({ addressBook }, { merge: true });
					return res.status(200).json({ data: addressBook });
				}

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

		// check if signatories contain duplicate addresses
		if ((new Set(signatories)).size !== signatories.length) return res.status(400).json({ error: responseMessages.duplicate_signatories });

		try {
			// sort is important to check if multisig with same signatories already exists
			const substrateSignatories = signatories.map((signatory) => getSubstrateAddress(String(signatory))).sort();

			// check if substrateSignatories contains the address of the user
			const substrateAddress = getSubstrateAddress(String(address));
			if (!substrateSignatories.includes(substrateAddress)) return res.status(400).json({ error: responseMessages.invalid_params });

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
			await multisigRef.set(newMultisig, { merge: true });

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

export const getTransactionsForMultisig = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress, network, limit, page } = req.body;
		if (!multisigAddress || !network || isNaN(limit) || isNaN(page)) return res.status(400).json({ error: responseMessages.missing_params });
		if (Number(limit) > 100 || Number(limit) <= 0) return res.status(400).json({ error: responseMessages.invalid_limit });
		if (Number(page) <= 0) return res.status(400).json({ error: responseMessages.invalid_page });

		try {
			const { data: transactionsArr, error: transactionsError } = await getTransactionsByAddress(multisigAddress, network, Number(limit), Number(page));
			if (transactionsError || !transactionsArr) return res.status(400).json({ error: transactionsError || responseMessages.transfers_fetch_error });

			res.status(200).json({ data: transactionsArr });

			// make a copy to db after response is sent
			// single batch will do because there'll never be more than 100 transactions
			const firestoreBatch = firestoreDB.batch();

			transactionsArr.forEach((transaction) => {
				const transactionRef = firestoreDB.collection('transactions').doc(transaction.id);
				firestoreBatch.set(transactionRef, transaction);
			});

			await firestoreBatch.commit();
			return;
		} catch (err:unknown) {
			functions.logger.error('Error in getTransactionsForMultisig :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const getAssetsForAddress = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { address: addressToFetch, network } = req.body;
		if (!addressToFetch || !network) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const { data: assetsArr, error: assetsError } = await _getAssetsForAddress(addressToFetch, network);
			if (assetsError || !assetsArr) return res.status(400).json({ error: assetsError || responseMessages.assets_fetch_error });

			res.status(200).json({ data: assetsArr });

			// make a copy to db after response is sent
			const assetsRef = firestoreDB.collection('assets').doc(addressToFetch);
			assetsRef.set({ assets: assetsArr });
			return;
		} catch (err:unknown) {
			functions.logger.error('Error in getTransactionsForMultisig :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const deleteMultisig = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress } = req.body;
		if (!multisigAddress ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const multisigRef = firestoreDB.collection('multisigAddresses').doc(multisigAddress);
			await multisigRef.delete();

			functions.logger.info('Deleted multisig with an address of ', multisigAddress);
			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in createMultisig :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const addFeedback = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { review, rating } = req.body;
		if (!review || isNaN(rating) || rating <= 0 || rating > 5 ) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			const feedbackRef = firestoreDB.collection('feedbacks').doc();
			const newFeedback: IFeedback = {
				address: String(address),
				rating: Number(rating),
				review: String(review)
			};

			await feedbackRef.set(newFeedback);

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in addFeedback :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const addContactFormResponse = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const { name, email, message } = req.body;
		if (!name || !email || !message ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const contactFormResponseRef = firestoreDB.collection('contactFormResponses').doc();
			const newContactFormResponse: IContactFormResponse = {
				name: String(name),
				email: String(email),
				message: String(message)
			};

			await contactFormResponseRef.set(newContactFormResponse);

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in addContactFormResponse :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const updateEmail = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		const { isValid, error } = await isValidRequest(address, signature);
		if (!isValid) return res.status(400).json({ error });

		const { email } = req.body;
		if (!email ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			addressRef.update({ email: String(email) });

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in updateEmail :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});
