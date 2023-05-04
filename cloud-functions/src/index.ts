import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import cors = require('cors');
import { cryptoWaitReady, decodeAddress, encodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import {
	IAddressBookItem,
	IContactFormResponse,
	IFeedback,
	IMultisigAddress,
	IMultisigSettings,
	INotification,
	ITransaction,
	IUser,
	IUserResponse,
	IUserNotificationPreferences } from './types';
import isValidSubstrateAddress from './utlils/isValidSubstrateAddress';
import getSubstrateAddress from './utlils/getSubstrateAddress';
import _createMultisig from './utlils/_createMultisig';
import '@polkadot/api-augment';
import getOnChainMultisigMetaData from './utlils/getOnChainMultisigMetaData';
import getTransactionsByAddress from './utlils/getTransactionsByAddress';
import _getAssetsForAddress from './utlils/_getAssetsForAddress';
import { chainProperties, networks } from './constants/network_constants';
import { DEFAULT_MULTISIG_NAME, DEFAULT_USER_ADDRESS_NAME } from './constants/defaults';
import { responseMessages } from './constants/response_messages';
import getMultisigQueueByAddress from './utlils/getMultisigQueueByAddress';
import fetchTokenUSDValue from './utlils/fetchTokenUSDValue';
import decodeCallData from './utlils/decodeCallData';
import { ApiPromise, WsProvider } from '@polkadot/api';

admin.initializeApp();
const firestoreDB = admin.firestore();

// TODO: Remove cors before production
const corsHandler = cors({ origin: true });

const isValidRequest = async (address?:string, signature?:string, network?:string): Promise<{ isValid: boolean, error: string }> => {
	if (!address || !signature || !network) return { isValid: false, error: responseMessages.missing_headers };
	if (!isValidSubstrateAddress(address)) return { isValid: false, error: responseMessages.invalid_headers };
	if (!Object.values(networks).includes(network)) return { isValid: false, error: responseMessages.invalid_network };

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
		created_at: doc.data().created_at.toDate(),
		updated_at: doc.data().updated_at?.toDate() || doc.data().created_at.toDate()
	})) as IMultisigAddress[];
};

export const getConnectAddressToken = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const address = req.get('x-address');
		if (!address) return res.status(400).json({ error: responseMessages.missing_params });
		if (!isValidSubstrateAddress(address)) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			const token = `<Bytes>polkasafe-login-${uuidv4()}</Bytes>`;

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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const multisigAddresses = await getMultisigAddressesByAddress(substrateAddress);

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

					const resUser: IUserResponse = {
						address: addressDoc.address,
						email: addressDoc.email,
						created_at: addressDoc.created_at,
						addressBook: addressDoc.addressBook,
						multisigAddresses,
						multisigSettings: addressDoc.multisigSettings
					};

					return res.status(200).json({ data: resUser });
				}
			}

			const newAddress: IAddressBookItem = {
				name: DEFAULT_USER_ADDRESS_NAME,
				address: String(substrateAddress)
			};

			// else create a new user document
			const newUser:IUser = {
				address: String(substrateAddress),
				created_at: new Date(),
				email: null,
				addressBook: [newAddress],
				multisigSettings: {}
			};

			const newUserResponse: IUserResponse = {
				...newUser,
				multisigAddresses
			};

			await addressRef.set(newUser, { merge: true });
			return res.status(200).json({ data: newUserResponse });
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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const { name, address: addressToAdd } = req.body;
			if (!name || !addressToAdd) return res.status(400).json({ error: responseMessages.missing_params });
			const substrateAddressToAdd = getSubstrateAddress(String(addressToAdd));
			if (!substrateAddressToAdd) return res.status(400).json({ error: responseMessages.invalid_params });

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

export const removeFromAddressBook = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const { name, address: addressToAdd } = req.body;
			if (!name || !addressToAdd) return res.status(400).json({ error: responseMessages.missing_params });
			const substrateAddressToAdd = getSubstrateAddress(String(addressToAdd));
			if (!substrateAddressToAdd) return res.status(400).json({ error: responseMessages.invalid_params });

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			const doc = await addressRef.get();
			if (doc.exists) {
				const addressDoc = {
					...doc.data(),
					created_at: doc.data()?.created_at.toDate()
				} as IUser;
				const addressBook = addressDoc.addressBook || [];

				// check if address exists in address book
				const addressIndex = addressBook.findIndex((a) => a.address == substrateAddressToAdd);
				if (addressIndex > -1) {
					addressBook.splice(addressIndex, 1);
					await addressRef.set({ addressBook }, { merge: true });
					return res.status(200).json({ data: addressBook });
				}
			}
			return res.status(400).json({ error: responseMessages.invalid_params });
		} catch (err:unknown) {
			functions.logger.error('Error in removeFromAddressBook :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const createMultisig = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { signatories, threshold, multisigName, proxyAddress, disabled } = req.body;
		if (!signatories || !threshold || !multisigName) {
			return res.status(400).json({ error: responseMessages.missing_params });
		}

		if (!Array.isArray(signatories) || signatories.length < 2) return res.status(400).json({ error: responseMessages.invalid_params });

		if (isNaN(threshold) || Number(threshold) > signatories.length) {
			return res.status(400).json({ error: responseMessages.invalid_threshold });
		}

		// cannot send proxy address if disabled is true
		if (proxyAddress && disabled) return res.status(400).json({ error: responseMessages.invalid_params });

		// check if signatories contain duplicate addresses
		if ((new Set(signatories)).size !== signatories.length) return res.status(400).json({ error: responseMessages.duplicate_signatories });

		try {
			const substrateAddress = getSubstrateAddress(String(address));
			let oldProxyMultisigRef = null;

			if (proxyAddress) {
				const proxyMultisigQuery = await firestoreDB.collection('multisigAddresses').where('proxy', '==', proxyAddress).limit(1).get();
				if (!proxyMultisigQuery.empty) {
					// check if the multisig linked to this proxy has this user as a signatory.
					const multisigDoc = proxyMultisigQuery.docs[0];
					const multisigData = multisigDoc.data();
					oldProxyMultisigRef = multisigDoc.ref;
					if (!multisigData.signatories.includes(substrateAddress)) return res.status(400).json({ error: responseMessages.unauthorised });
				}
			}

			const substrateSignatories = signatories.map((signatory) => getSubstrateAddress(String(signatory))).sort();

			// check if substrateSignatories contains the address of the user (not if creating a new proxy)
			if (!proxyAddress && !substrateSignatories.includes(substrateAddress)) return res.status(400).json({ error: responseMessages.missing_user_signatory });

			const { multisigAddress, error: createMultiErr } = _createMultisig(substrateSignatories, Number(threshold), chainProperties[network].ss58Format);
			if (createMultiErr || !multisigAddress) return res.status(400).json({ error: createMultiErr || responseMessages.multisig_create_error });

			const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

			// change user's multisig settings to deleted: false and set the name
			const newMultisigSettings: IMultisigSettings = {
				deleted: false,
				name: multisigName
			};

			// check if the multisig exists in our db
			const multisigRef = firestoreDB.collection('multisigAddresses').doc(encodedMultisigAddress);
			const multisigDoc = await multisigRef.get();

			if (multisigDoc.exists) {
				const multisigDocData = multisigDoc.data();

				const resData: {[key:string]: any} = {
					...multisigDocData,
					name: multisigName,
					created_at: multisigDocData?.created_at?.toDate(),
					updated_at: multisigDocData?.updated_at?.toDate() || multisigDocData?.created_at.toDate()
				};

				if (proxyAddress) {
					const batch = firestoreDB.batch();

					batch.update(multisigRef, {
						proxy: proxyAddress,
						disabled: false,
						updated_at: new Date()
					});

					if (oldProxyMultisigRef) {
						batch.update(oldProxyMultisigRef, {
							proxy: '',
							disabled: true,
							updated_at: new Date()
						});
					}

					await batch.commit();

					resData.proxy = proxyAddress;
					resData.disabled = false;
				}

				res.status(200).json({ data: resData });

				await firestoreDB.collection('addresses').doc(substrateAddress).set({
					'multisigSettings': {
						[encodedMultisigAddress]: newMultisigSettings
					}
				}, { merge: true });

				return;
			}

			const newDate = new Date();

			const newMultisig: IMultisigAddress = {
				address: encodedMultisigAddress,
				created_at: newDate,
				updated_at: newDate,
				disabled: disabled || false,
				name: multisigName,
				signatories: substrateSignatories,
				network: String(network).toLowerCase(),
				threshold: Number(threshold)
			};

			if (proxyAddress) {
				newMultisig.proxy = proxyAddress;
			}

			await multisigRef.set(newMultisig, { merge: true });

			functions.logger.info('New multisig created with an address of ', encodedMultisigAddress);
			res.status(200).json({ data: newMultisig });

			if (oldProxyMultisigRef) {
				await oldProxyMultisigRef.update({
					proxy: '',
					disabled: true,
					updated_at: newDate
				});
			}

			await firestoreDB.collection('addresses').doc(substrateAddress).set({
				'multisigSettings': {
					[encodedMultisigAddress]: newMultisigSettings
				}
			}, { merge: true });

			return;
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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress } = req.body;
		if (!multisigAddress || !network) {
			return res.status(400).json({ error: responseMessages.missing_params });
		}

		try {
			const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

			// check if the multisig already exists in our db
			const multisigRef = await firestoreDB.collection('multisigAddresses').doc(String(encodedMultisigAddress)).get();
			if (multisigRef.exists) {
				const data = multisigRef.data();
				return res.status(200).json({ data: {
					...data,
					created_at: data?.created_at.toDate(),
					updated_at: data?.updated_at?.toDate() || data?.created_at.toDate()
				} });
			}

			const { data: multisigMetaData, error: multisigMetaDataErr } = await getOnChainMultisigMetaData(encodedMultisigAddress, network);
			if (multisigMetaDataErr) return res.status(400).json({ error: multisigMetaDataErr || responseMessages.onchain_multisig_fetch_error });
			if (!multisigMetaData) return res.status(400).json({ error: responseMessages.multisig_not_found_on_chain });

			const newMultisig: IMultisigAddress = {
				address: encodedMultisigAddress,
				created_at: new Date(),
				updated_at: new Date(),
				name: DEFAULT_MULTISIG_NAME,
				signatories: multisigMetaData.signatories || [],
				network: String(network).toLowerCase(),
				threshold: Number(multisigMetaData.threshold) || 0
			};

			res.status(200).json({ data: newMultisig });

			if (newMultisig.signatories.length > 1 && newMultisig.threshold) {
				// make a copy to db
				const newMultisigRef = firestoreDB.collection('multisigAddresses').doc(encodedMultisigAddress);
				await newMultisigRef.set(newMultisig);
			}
			return;
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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress, limit, page } = req.body;
		if (!multisigAddress || !network || isNaN(limit) || isNaN(page)) return res.status(400).json({ error: responseMessages.missing_params });
		if (Number(limit) > 100 || Number(limit) <= 0) return res.status(400).json({ error: responseMessages.invalid_limit });
		if (Number(page) <= 0) return res.status(400).json({ error: responseMessages.invalid_page });

		try {
			const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);
			const { data: transactionsArr, error: transactionsError } = await getTransactionsByAddress(encodedMultisigAddress, network, Number(limit), Number(page), firestoreDB);
			if (transactionsError || !transactionsArr) return res.status(400).json({ error: transactionsError || responseMessages.transfers_fetch_error });

			res.status(200).json({ data: transactionsArr });

			// make a copy to db after response is sent
			// single batch will do because there'll never be more than 100 transactions
			const firestoreBatch = firestoreDB.batch();

			transactionsArr.forEach((transaction) => {
				const transactionRef = firestoreDB.collection('transactions').doc(transaction.callHash);
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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { address: addressToFetch } = req.body;
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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress } = req.body;
		if (!multisigAddress ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));
			const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

			const newMultisigSettings: IMultisigSettings = {
				name: DEFAULT_MULTISIG_NAME,
				deleted: true
			};

			// delete multisig for user
			firestoreDB.collection('addresses').doc(substrateAddress).set({
				'multisigSettings': {
					[encodedMultisigAddress]: newMultisigSettings
				}
			}, { merge: true });

			functions.logger.info('Deleted multisig ', encodedMultisigAddress, ' for user ', substrateAddress);
			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in deleteMultisig :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const addFeedback = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { review, rating } = req.body;
		if (isNaN(rating) || Number(rating) <= 0 || Number(rating) > 5 ) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));
			const feedbackRef = firestoreDB.collection('feedbacks').doc();
			const newFeedback: IFeedback = {
				address: substrateAddress,
				rating: Number(rating),
				review: String(review) || ''
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
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
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

export const getMultisigQueue = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { multisigAddress, limit, page } = req.body;
		if (!multisigAddress || !network || isNaN(limit) || isNaN(page)) return res.status(400).json({ error: responseMessages.missing_params });
		if (Number(limit) > 100 || Number(limit) <= 0) return res.status(400).json({ error: responseMessages.invalid_limit });
		if (Number(page) <= 0) return res.status(400).json({ error: responseMessages.invalid_page });

		try {
			const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);
			const { data: queueItemsArr, error: queueItemsError } = await getMultisigQueueByAddress(
				encodedMultisigAddress,
				network,
				Number(limit),
				Number(page),
				firestoreDB
			);

			if (queueItemsError || !queueItemsArr) return res.status(400).json({ error: queueItemsError || responseMessages.queue_fetch_error });

			res.status(200).json({ data: queueItemsArr });

			// TODO: make a copy to db after response is sent
			// single batch will do because there'll never be more than 100 transactions
			// const firestoreBatch = firestoreDB.batch();

			// transactionsArr.forEach((transaction) => {
			// const transactionRef = firestoreDB.collection('transactions').doc(transaction.callHash);
			// firestoreBatch.set(transactionRef, transaction);
			// });

			// await firestoreBatch.commit();
			return;
		} catch (err:unknown) {
			functions.logger.error('Error in getMultisigQueue :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const addTransaction = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { amount_token, block_number, callData, callHash, from, to, note } = req.body;
		if (isNaN(amount_token) || !block_number || !callHash || !from || !network || !to ) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			const usdValue = await fetchTokenUSDValue(network);
			const newTransaction: ITransaction = {
				callData,
				callHash,
				created_at: new Date(),
				block_number: Number(block_number),
				from,
				to,
				token: chainProperties[network].tokenSymbol,
				amount_usd: usdValue ? `${Number(amount_token) * usdValue}` : '',
				amount_token: String(amount_token),
				network,
				note: note || ''
			};

			const transactionRef = firestoreDB.collection('transactions').doc(String(callHash));
			await transactionRef.set(newTransaction);

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in addTransaction :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const renameMultisig = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { address: mutisigAddress, name } = req.body;
		if (!mutisigAddress || !name ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));
			const encodedMultisigAddress = encodeAddress(mutisigAddress, chainProperties[network].ss58Format);

			const multisigDocData = (await firestoreDB.collection('multisigAddresses').doc(encodedMultisigAddress).get()).data() as IMultisigAddress;

			if (multisigDocData.signatories.includes(substrateAddress)) {
				const newMultisigSettings: IMultisigSettings = {
					name,
					deleted: false
				};

				// delete multisig for user
				firestoreDB.collection('addresses').doc(substrateAddress).set({
					'multisigSettings': {
						[encodedMultisigAddress]: newMultisigSettings
					}
				}, { merge: true });
			} else {
				return res.status(403).json({ error: responseMessages.invalid_params });
			}

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in renameMultisig :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const sendNotification = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { addresses, link, message, type } = req.body;
		if (!addresses || !Array.isArray(addresses) || !message || !network ) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			const newNotificationRef = firestoreDB.collection('notifications').doc();

			const newNotification: INotification = {
				id: newNotificationRef.id,
				addresses: addresses,
				created_at: new Date(),
				message,
				link: link ? String(link) : '',
				type,
				network
			};

			await newNotificationRef.set(newNotification);

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in sendNotification :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const getNotifications = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		try {
			const substrateAddress = getSubstrateAddress(String(address));
			const notificationsQuery = firestoreDB
				.collection('notifications')
				.where('addresses', 'array-contains', substrateAddress)
				.orderBy('created_at', 'desc')
				.limit(10);

			const notificationsSnapshot = await notificationsQuery.get();

			const notifications: INotification[] = notificationsSnapshot.docs.map((doc) => ({
				...doc.data(),
				created_at: doc.data().created_at.toDate()
			} as INotification));

			return res.status(200).json({ data: notifications });
		} catch (err:unknown) {
			functions.logger.error('Error in getNotifications :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const updateTransactionNote = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { callHash, multisigAddress, note } = req.body;
		if (!callHash || !note ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const txRef = firestoreDB.collection('transactions').doc(callHash);
			const txDoc = await txRef.get();
			const txDocData = txDoc.data() as ITransaction;

			if (txDoc.exists && txDocData.from === substrateAddress) {
				txRef.update({ note: String(note) });
				return res.status(200).json({ data: responseMessages.success });
			}

			const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

			if (!encodedMultisigAddress && !txDoc.exists) return res.status(400).json({ error: responseMessages.missing_params });

			// get signatories for multisig
			const multisigAddressDoc = await firestoreDB.collection('multisigAddresses').doc(txDoc.exists && txDocData.from ? txDocData.from : encodedMultisigAddress).get();

			if (multisigAddressDoc.exists && (multisigAddressDoc.data() as IMultisigAddress).signatories.includes(substrateAddress)) {
				txRef.set({ callHash, note: String(note) }, { merge: true });
				return res.status(200).json({ data: responseMessages.success });
			}

			return res.status(400).json({ error: responseMessages.invalid_params });
		} catch (err:unknown) {
			functions.logger.error('Error in updateTransactionNote :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const getTransactionNote = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { callHash } = req.body;
		if (!callHash ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const txRef = firestoreDB.collection('transactions').doc(callHash);
			const txDoc = await txRef.get();

			return res.status(200).json({ data: txDoc.exists ? (txDoc.data() as ITransaction).note || '' : '' });
		} catch (err:unknown) {
			functions.logger.error('Error in getTransactionNote :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const addAppsAlertRecipient = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { email } = req.body;
		if (!email) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const recipientsRef = firestoreDB.collection('metaData').doc('appsAlertRecipients');
			const recipients = (await recipientsRef.get()).data();

			if (recipients && recipients.emails?.includes(email)) return res.status(200).json({ data: responseMessages.success });

			const newRecipients = recipients ? [...recipients.emails, email] : [email];

			await recipientsRef.set({
				emails: newRecipients
			}, { merge: true });

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in addAppsAlertRecipient :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const setTransactionCallData = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { callHash, callData } = req.body;
		if (!callHash || !callData || !network ) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			if (!Object.values(networks).includes(network)) return res.status(400).json({ error: responseMessages.invalid_params });

			const provider = new WsProvider(chainProperties[network].rpcEndpoint);
			const api = new ApiPromise({ provider });
			await api.isReady;

			if (!api || !api.isReady) return res.status(500).json({ error: responseMessages.internal });

			const { data, error } = decodeCallData(callData, api);
			if (error || !data) return res.status(400).json({ error: responseMessages.invalid_params });
			if (data?.extrinsicCall?.hash.toHex() !== callHash) return res.status(400).json({ error: responseMessages.invalid_params });

			// is valid call data
			const txRef = firestoreDB.collection('transactions').doc(callHash);
			txRef.set({ callData: String(callData) }, { merge: true });

			return res.status(200).json({ error: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in setTransactionCallData :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const updateNotificationPreferences = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { notificationPreferences } = req.body as { notificationPreferences: IUserNotificationPreferences };
		if (!notificationPreferences ||
			typeof notificationPreferences !== 'object' ||
			!('channelPreferences' in notificationPreferences && 'triggerPreferences' in notificationPreferences) ||
			typeof notificationPreferences.channelPreferences !== 'object' ||
			typeof notificationPreferences.triggerPreferences !== 'object') return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			addressRef.update({ notificationPreferences });

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in updateNotificationPreferences :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// set
// TODO: return BE data first and then save data to BE and return data from BE;
// store last updated at
