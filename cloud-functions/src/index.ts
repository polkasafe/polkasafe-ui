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
	IUserNotificationTriggerPreferences,
	IUserNotificationChannelPreferences,
	ITransactionFields } from './types';
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

import { CHANNEL, DISCORD_BOT_SECRETS, IUserNotificationPreferences, NOTIFICATION_ENGINE_API_KEY, NOTIFICATION_SOURCE, TELEGRAM_BOT_TOKEN } from './notification-engine/notification_engine_constants';
import callNotificationTrigger from './notification-engine/global-utils/callNotificationTrigger';
import TelegramBot = require('node-telegram-bot-api');
import isValidWeb3Address from './notification-engine/global-utils/isValidWeb3Address';
import { IPSUser } from './notification-engine/polkasafe/_utils/types';
import getSourceFirebaseAdmin from './notification-engine/global-utils/getSourceFirebaseAdmin';
import { InteractionResponseType, InteractionType } from 'discord.js';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { verifyKey } from 'discord-interactions';
import getPSUser from './notification-engine/polkasafe/_utils/getPSUser';
import sendDiscordMessage from './notification-engine/global-utils/sendDiscordMessage';
import sendSlackMessage from './notification-engine/global-utils/sendSlackMessage';
import { IPAUser } from './notification-engine/polkassembly/_utils/types';
import scheduledApprovalReminder from './notification-engine/polkasafe/scheduledApprovalReminder';

admin.initializeApp();
const firestoreDB = admin.firestore();

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

			const DEFAULT_NOTIFICATION_PREFERENCES : IUserNotificationPreferences = {
				channelPreferences: {
					[CHANNEL.IN_APP]: {
						name: CHANNEL.IN_APP,
						enabled: true,
						handle: String(substrateAddress),
						verified: true
					}
				},
				triggerPreferences: {}
			};

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
						address: encodeAddress(addressDoc.address, chainProperties[network].ss58Format),
						email: addressDoc.email,
						created_at: addressDoc.created_at,
						addressBook: addressDoc.addressBook?.map((item) => ({ ...item, address: encodeAddress(item.address, chainProperties[network].ss58Format) })),
						multisigAddresses: multisigAddresses.map((item) => (
							{ ...item,
								signatories: item.signatories.map((signatory) => encodeAddress(signatory, chainProperties[network].ss58Format))
							})),
						multisigSettings: addressDoc.multisigSettings,
						notification_preferences: addressDoc.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES,
						transactionFields: addressDoc.transactionFields
					};

					res.status(200).json({ data: resUser });
					if (addressDoc.notification_preferences) return;

					// set default notification preferences if not set
					await doc.ref.update({ notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES });
					return;
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
				multisigSettings: {},
				notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES
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
					return res.status(200).json({ data: addressBook.map((item) => ({ ...item, address: encodeAddress(item.address, chainProperties[network].ss58Format) })) });
				}

				const newAddressBook = [...addressBook, { name, address: substrateAddressToAdd }];
				await addressRef.set({ addressBook: newAddressBook }, { merge: true });
				return res.status(200).json({ data: newAddressBook.map((item) => ({ ...item, address: encodeAddress(item.address, chainProperties[network].ss58Format) })) });
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
					signatories: multisigDocData?.signatories?.map((signatory: string) => encodeAddress(signatory, chainProperties[network].ss58Format)),
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

			const newMultisigWithEncodedSignatories = {
				...newMultisig,
				signatories: newMultisig.signatories.map((signatory: string) => encodeAddress(signatory, chainProperties[network].ss58Format)) };

			if (proxyAddress) {
				newMultisig.proxy = proxyAddress;
			}

			await multisigRef.set(newMultisig, { merge: true });

			functions.logger.info('New multisig created with an address of ', encodedMultisigAddress);
			res.status(200).json({ data: newMultisigWithEncodedSignatories });

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

		const { amount_token, block_number, callData, callHash, from, to, note, transactionFields } = req.body;
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
				note: note || '',
				transactionFields: transactionFields || {}
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

export const getNotificationPreferencesForAddress = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { address: addressToFetch = '' } = req.body;
		if (!addressToFetch) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(addressToFetch));
			const addressDoc = await firestoreDB.collection('addresses').doc(substrateAddress).get();
			const addressData = addressDoc.data() as IUser;

			return res.status(200).json({ data: addressData.notification_preferences || null });
		} catch (err:unknown) {
			functions.logger.error('Error in getNotificationPreferencesForAddress :', { err, stack: (err as any).stack });
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

export const updateNotificationTriggerPreferences = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { triggerPreferences } = req.body as { triggerPreferences: {[index: string]: IUserNotificationTriggerPreferences} };
		if (!triggerPreferences ||
			typeof triggerPreferences !== 'object') return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			addressRef.update({ ['notification_preferences.triggerPreferences']: triggerPreferences });

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in updateNotificationTriggerPreferences :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const updateNotificationChannelPreferences = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { channelPreferences } = req.body as { channelPreferences: {[index: string]: IUserNotificationChannelPreferences} };
		if (!channelPreferences || typeof channelPreferences !== 'object') return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			addressRef.update({ ['notification_preferences.channelPreferences']: channelPreferences });

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in updateNotificationChannelPreferences :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// Notification Engine

export const notify = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		functions.logger.info('notify called with body', req.body);
		const apiKey = req.get('x-api-key');
		const source = req.get('x-source');

		if (!apiKey || !NOTIFICATION_ENGINE_API_KEY || apiKey !== NOTIFICATION_ENGINE_API_KEY) return res.status(401).json({ error: responseMessages.unauthorised });
		if (!source || !Object.values(NOTIFICATION_SOURCE).includes(source as any)) return res.status(400).json({ error: responseMessages.invalid_headers });

		const { trigger, args } = req.body;
		if (!trigger) return res.status(400).json({ error: responseMessages.missing_params });
		if (args && (typeof args !== 'object' || Array.isArray(args))) return res.status(400).json({ error: responseMessages.invalid_params });

		try {
			await callNotificationTrigger(source as NOTIFICATION_SOURCE, trigger, args);

			return res.status(200).json({ data: 'Notification(s) sent successfully.' });
		} catch (err:unknown) {
			functions.logger.error('Error in notify :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// Polkasafe

exports.scheduledPolkasafeApprovalReminder = functions.pubsub.schedule('every 1 hours').onRun(async () => {
	functions.logger.info('scheduledPolkasafeApprovalReminder ran at : ', new Date());
	await scheduledApprovalReminder();
	return;
});

export const verifyEmail = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const { email, token } = req.body;
		if (!email || !token) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const addressSnapshot = await firestoreDB.collection('addresses').where('notification_preferences.channelPreferences.email.verification_token', '==', token).where('notification_preferences.channelPreferences.email.handle', '==', email).limit(1).get();
			if (addressSnapshot.empty) return res.status(400).json({ error: responseMessages.invalid_params });
			const addressDoc = addressSnapshot.docs[0];
			const addressDocData = addressDoc.data();
			const verifyEmail = addressDocData?.notification_preferences?.channelPreferences?.email?.handle;
			const verifyToken = addressDocData?.notification_preferences?.channelPreferences?.email?.verification_token;
			if (token === verifyToken && email === verifyEmail) {
				addressDoc.ref.update({ ['notification_preferences.channelPreferences.email.verified']: true });
				return res.status(200).json({ data: responseMessages.success });
			} else {
				return res.status(400).json({ error: responseMessages.invalid_params });
			}
		} catch (err:unknown) {
			functions.logger.error('Error in verifyEmail :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const polkasafeTelegramBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		functions.logger.info('polkasafeTelegramBotCommands req', { req } );

		try {
			const { message = null, edited_message = null } = req.body;
			let text = null;
			let chat = null;

			if (message) {
				text = message.text;
				chat = message.chat;
			} else if (edited_message) {
				text = edited_message.text;
				chat = edited_message.chat;
			}

			if (!text || !chat) {
				return res.status(400).json({ error: responseMessages.missing_params });
			}

			if (!TELEGRAM_BOT_TOKEN[NOTIFICATION_SOURCE.POLKASAFE]) {
				functions.logger.error('TELEGRAM_BOT_TOKEN[NOTIFICATION_SOURCE.POLKASAFE] not found');
				return res.status(500).json({ error: responseMessages.internal });
			}

			const bot = new TelegramBot(TELEGRAM_BOT_TOKEN[NOTIFICATION_SOURCE.POLKASAFE], { polling: false });

			if (text.startsWith('/start')) {
				await bot.sendMessage(
					chat.id,
					`Welcome to the Polkasafe Bot!

				To interact with this bot, you can use the following commands:

				- '/add <web3Address> <verificationToken>': Use this command to add a web3 address to Polkasafe bot.
				
				- '/remove <web3Address> <verificationToken>': Use this command to remove a web3 address from Polkasafe bot.

				Please note that you need to replace '<web3Address>' with the actual web3 address you want to add or remove, and '<verificationToken>' with the token provided for verification.
				`
				);
				return res.sendStatus(200);
			}

			if (text.startsWith('/add')) {
				const commandParts = text.split(' ');
				const web3Address = commandParts[1];
				const verificationToken = commandParts[2];

				if (!web3Address || !verificationToken) {
					await bot.sendMessage(
						chat.id,
						'Invalid command. Please use the following format: /add <web3Address> <verificationToken>'
					);
					return res.sendStatus(200);
				}

				// check if the address is valid
				if (!isValidWeb3Address(web3Address)) {
					await bot.sendMessage(
						chat.id,
						'Invalid web3 address.'
					);
					return res.sendStatus(200);
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

				// check if address exists TODO: use getPSUser
				const addressRef = await firestore_db.collection('addresses').doc(web3Address).get();
				if (!addressRef.exists) {
					await bot.sendMessage(
						chat.id,
						'Address not found.'
					);
					return res.sendStatus(200);
				}

				// check if the verification token is valid
				const addressData = addressRef.data() as IPSUser;
				if (!addressData.notification_preferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token) {
				// Sending a reply to the user
					await bot.sendMessage(
						chat.id,
						'No verification token found.'
					);
					return res.sendStatus(200);
				} else if (addressData.notification_preferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token === verificationToken) {
					const newNotificationPreferences = {
						...(addressData.notification_preferences || {}),
						channelPreferences: {
							...(addressData.notification_preferences?.channelPreferences || {}),
							[CHANNEL.TELEGRAM]: {
								name: CHANNEL.TELEGRAM,
								enabled: true,
								verified: true,
								handle: String(chat.id),
								verification_token: ''
							}
						}
					};

					// update the address with the telegram chat id
					await firestore_db.collection('addresses').doc(web3Address).update({
						notification_preferences: newNotificationPreferences
					});

					// Sending a reply to the user
					await bot.sendMessage(
						chat.id,
						'Address added successfully. You will now receive notifications on this chat.'
					);
					return res.sendStatus(200);
				} else {
					await bot.sendMessage(
						chat.id,
						'Invalid verification token.'
					);
					return res.sendStatus(200);
				}
			}

			if (text.startsWith('/remove')) {
				const commandParts = text.split(' ');
				const web3Address = commandParts[1];
				const verificationToken = commandParts[2];

				if (!web3Address || !verificationToken) {
					await bot.sendMessage(
						chat.id,
						'Invalid command. Please use the following format: /remove <web3Address> <verificationToken>'
					);
					return res.sendStatus(200);
				}

				// check if the address is valid
				if (!isValidWeb3Address(web3Address)) {
					await bot.sendMessage(
						chat.id,
						'Invalid web3 address.'
					);
					return res.sendStatus(200);
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

				// check if address exists
				const addressRef = await firestore_db.collection('addresses').doc(web3Address).get();
				if (!addressRef.exists) {
					await bot.sendMessage(
						chat.id,
						'Address not found.'
					);
					return res.sendStatus(200);
				}

				// check if the verification token is valid
				const addressData = addressRef.data() as IPSUser;
				if (!addressData.notification_preferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token) {
				// Sending a reply to the user
					await bot.sendMessage(
						chat.id,
						'No verification token found.'
					);
					return res.sendStatus(200);
				} else if (addressData.notification_preferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token === verificationToken) {
					const newNotificationPreferences = {
						...(addressData.notification_preferences || {}),
						channelPreferences: {
							...(addressData.notification_preferences?.channelPreferences || {}),
							[CHANNEL.TELEGRAM]: {
								name: CHANNEL.TELEGRAM,
								enabled: false,
								verified: false,
								handle: '',
								verification_token: ''
							}
						}
					};

					// update the address with the telegram chat id
					await firestore_db.collection('addresses').doc(web3Address).update({
						notification_preferences: newNotificationPreferences
					});

					// Sending a reply to the user
					await bot.sendMessage(
						chat.id,
						'Address removed successfully. You will not receive notifications on this chat anymore.'
					);
					return res.sendStatus(200);
				} else {
					await bot.sendMessage(
						chat.id,
						'Invalid verification token.'
					);
					return res.sendStatus(200);
				}
			}

			return res.sendStatus(200);
		} catch (err:unknown) {
			functions.logger.error('Error in polkasafeTelegramBotCommands :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const polkasafeDiscordBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		functions.logger.info('polkasafeDiscordBotCommands called', { req });

		const POLKASAFE_DISCORD_BOT_SECRETS = DISCORD_BOT_SECRETS[NOTIFICATION_SOURCE.POLKASAFE];
		try {
			if (!POLKASAFE_DISCORD_BOT_SECRETS.publicKey) return res.status(500).send('DISCORD_PUBLIC_KEY is not set.');

			const signature = req.headers['x-signature-ed25519'];
			const timestamp = req.headers['x-signature-timestamp'];

			if (!signature || !timestamp) return res.status(401).send('Invalid request signature.');

			const isValidRequest = verifyKey(
				req.rawBody,
				String(signature),
				String(timestamp),
				POLKASAFE_DISCORD_BOT_SECRETS.publicKey
			);
			if (!isValidRequest) return res.status(401).send('Invalid request signature.');

			const interactionReq = req.body;
			if (!interactionReq || !interactionReq.type) return res.status(400).send('Invalid request body.');

			functions.logger.info('Interaction received');

			if (interactionReq.type === InteractionType.Ping) {
				return res.status(200).send({
					type: InteractionResponseType.Pong
				});
			}

			if (!interactionReq.data) return res.status(400).send('Invalid request body.');

			const { name, options } = interactionReq.data;
			if (!name || !options) return res.status(400).send('Invalid request body.');

			if (name === 'remove') {
				const web3Address = options[0]?.value;
				const verificationToken = options[1]?.value;
				if (!web3Address || !verificationToken) return res.status(400).send('Invalid request body.');

				if (!isValidWeb3Address(web3Address)) {
					return res.status(200).send({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `Web3 address ${web3Address} is invalid.`
						}
					});
				}

				// Discord needs a response within 3 seconds
				res.status(200).send({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `Removing address: ${web3Address}.`
					}
				});

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

				const addressData = await getPSUser(firestore_db, web3Address).catch(async () => {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `Address: ${web3Address} not found. Please sign up on Polkasafe to receive notifications.`);
					return null;
				});
				if (!addressData) return;

				if (!addressData.notification_preferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token) {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `No verification token found for address: ${web3Address}.`);
					return;
				} else if (addressData.notification_preferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token === verificationToken) {
					const newNotificationPreferences = {
						...(addressData.notification_preferences || {}),
						channelPreferences: {
							...(addressData.notification_preferences?.channelPreferences || {}),
							[CHANNEL.DISCORD]: {
								name: CHANNEL.DISCORD,
								enabled: false,
								verified: false,
								handle: '',
								verification_token: ''
							}
						}
					};

					await firestore_db.collection('addresses').doc(web3Address).update({
						notification_preferences: newNotificationPreferences
					});

					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `Web3 address ${web3Address} removed. You will not receive notifications on this channel anymore.`);
					return;
				} else {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `Invalid verification token for address: ${web3Address}.`);
					return;
				}
			} else if (name === 'add') {
				const web3Address = options[0]?.value;
				const verificationToken = options[1]?.value;
				if (!web3Address || !verificationToken) return res.status(400).send('Invalid request body.');

				if (!isValidWeb3Address(web3Address)) {
					return res.status(200).send({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content: `Web3 address ${web3Address} is invalid.`
						}
					});
				}

				// Discord needs a response within 3 seconds
				res.status(200).send({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `Adding address: ${web3Address}.`
					}
				});

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

				const addressData = await getPSUser(firestore_db, web3Address).catch(async () => {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `Address: ${web3Address} not found. Please sign up on Polkasafe to receive notifications.`);
					return null;
				});
				if (!addressData) return;

				if (!addressData.notification_preferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token) {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `No verification token found for address: ${web3Address}.`);
					return;
				} else if (addressData.notification_preferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token === verificationToken) {
					const newNotificationPreferences = {
						...(addressData.notification_preferences || {}),
						channelPreferences: {
							...(addressData.notification_preferences?.channelPreferences || {}),
							[CHANNEL.DISCORD]: {
								name: CHANNEL.DISCORD,
								enabled: true,
								verified: true,
								handle: interactionReq.channel_id,
								verification_token: ''
							}
						}
					};

					await firestore_db.collection('addresses').doc(web3Address).update({
						notification_preferences: newNotificationPreferences
					});

					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `Web3 address ${web3Address} added. You will now receive notifications on this channel.`);
					return;
				} else {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASAFE, interactionReq.channel_id, `Invalid verification token for address: ${web3Address}.`);
					return;
				}
			}

			return res.status(200).end();
		} catch (err:unknown) {
			functions.logger.error('Error in polkasafeDiscordBotCommands :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const registerPolkasafeDiscordBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const apiKey = req.get('x-api-key');

		const POLKASAFE_DISCORD_BOT_SECRETS = DISCORD_BOT_SECRETS[NOTIFICATION_SOURCE.POLKASAFE];

		if (!apiKey || !NOTIFICATION_ENGINE_API_KEY || apiKey !== NOTIFICATION_ENGINE_API_KEY || !POLKASAFE_DISCORD_BOT_SECRETS.clientId || !POLKASAFE_DISCORD_BOT_SECRETS.token) return res.status(401).json({ error: responseMessages.unauthorised });

		if (!POLKASAFE_DISCORD_BOT_SECRETS.token) return res.status(500).send('DISCORD_BOT_TOKEN is not set.');

		const commands = [
			{
				name: 'remove',
				description: 'Remove a web3 address from Polkasafe',
				type: 1,
				options: [
					{
						name: 'web3-address',
						description: 'The address to remove',
						type: 3,
						required: true
					},
					{
						name: 'verification-token',
						description: 'The verification token',
						type: 3,
						required: true
					}
				]
			},
			{
				name: 'add',
				description: 'Add a web3 address to Polkasafe',
				type: 1,
				options: [
					{
						name: 'web3-address',
						description: 'The address to add',
						type: 3,
						required: true
					},
					{
						name: 'verification-token',
						description: 'The verification token',
						type: 3,
						required: true
					}
				]
			}
		];

		try {
			console.log('Started refreshing application (/) commands.');

			const rest = new REST({ version: '9' }).setToken(POLKASAFE_DISCORD_BOT_SECRETS.token);

			await rest.put(
				Routes.applicationCommands(POLKASAFE_DISCORD_BOT_SECRETS.clientId),
				{ body: commands },
			);

			console.log('Successfully registered application (/) commands.');

			return res.status(200).send('Commands registered successfully.');
		} catch (err:unknown) {
			functions.logger.error('Error in telegramBotCommands :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const polkasafeSlackBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// slack needs an acknowledgement response within 3 seconds
			res.status(200).end();
			const { command, text, user_id } = req.body;
			functions.logger.info('polkasafeSlackBotCommands req :', { req });

			if (command == '/polkasafe-add') {
				await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Adding address...');

				const [web3Address, verificationToken] = text.split(' ');

				if (!web3Address || !verificationToken) {
					// Send a response back to Slack
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Invalid command. Please use the following format: /polkasafe-add <web3Address> <verificationToken>');
					return;
				}

				// check if the address is valid
				if (!isValidWeb3Address(web3Address)) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Invalid web3 address.');
					return;
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

				// check if address exists
				const addressData = await getPSUser(firestore_db, web3Address).catch(async () => {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), `Address: ${web3Address} not found. Please sign up on Polkasafe to receive notifications.`);
					return null;
				});
				if (!addressData) return;

				// check if the verification token is valid
				if (!addressData.notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token) {
				// Sending a reply to the user
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'No verification token found. Please generate a new token from Polkasafe and try again.');
					return;
				} else if (addressData.notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token === verificationToken) {
					const newNotificationPreferences = {
						...(addressData.notification_preferences || {}),
						channelPreferences: {
							...(addressData.notification_preferences?.channelPreferences || {}),
							[CHANNEL.SLACK]: {
								name: CHANNEL.SLACK,
								enabled: true,
								verified: true,
								handle: String(user_id),
								verification_token: ''
							}
						}
					};

					// update the address with the telegram chat id
					await firestore_db.collection('addresses').doc(web3Address).update({
						notification_preferences: newNotificationPreferences
					});

					// Sending a reply to the user
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Address added successfully. You will now receive notifications on this chat.');
					return;
				} else {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Invalid verification token.');
					return;
				}
			}

			if (command === '/polkasafe-remove') {
				await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Removing address...');
				const [web3Address, verificationToken] = text.split(' ');

				if (!web3Address || !verificationToken) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Invalid command. Please use the following format: /polkasafe-remove <web3Address> <verificationToken>');
					return;
				}

				// check if the address is valid
				if (!isValidWeb3Address(web3Address)) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Invalid web3 address.');
					return;
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

				// check if address exists
				const addressRef = await firestore_db.collection('addresses').doc(web3Address).get();
				if (!addressRef.exists) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Address not found. Please sign up on Polkasafe to receive notifications.');
					return;
				}

				// check if the verification token is valid
				const addressData = addressRef.data() as IPSUser;
				if (!addressData.notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token) {
					// Sending a reply to the user
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'No verification token found. Please generate a new token from Polkasafe and try again.');
					return;
				} else if (addressData.notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token === verificationToken) {
					const newNotificationPreferences = {
						...(addressData.notification_preferences || {}),
						channelPreferences: {
							...(addressData.notification_preferences?.channelPreferences || {}),
							[CHANNEL.SLACK]: {
								name: CHANNEL.SLACK,
								enabled: false,
								verified: false,
								handle: '',
								verification_token: ''
							}
						}
					};

					// update the address with the telegram chat id
					await firestore_db.collection('addresses').doc(web3Address).update({
						notification_preferences: newNotificationPreferences
					});

					// Sending a reply to the user
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Address removed successfully. You will not receive notifications on this chat anymore.');
					return;
				} else {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASAFE, String(user_id), 'Invalid verification token.');
					return;
				}
			}
		} catch (err:unknown) {
			functions.logger.error('Error in polkasafeSlackBotCommands :', { err, stack: (err as any).stack });
			if (!res.headersSent) res.status(500).json({ error: responseMessages.internal });
		}

		return;
	});
});

export const getChannelVerifyToken = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const address = req.get('x-address');
		const apiKey = req.get('x-api-key');
		const source = req.get('x-source');

		if (source === NOTIFICATION_SOURCE.POLKASAFE && !address) return res.status(400).json({ error: responseMessages.missing_params });
		if (source === NOTIFICATION_SOURCE.POLKASAFE && !isValidSubstrateAddress(address || '')) return res.status(400).json({ error: responseMessages.invalid_params });

		if (!apiKey || !NOTIFICATION_ENGINE_API_KEY || apiKey !== NOTIFICATION_ENGINE_API_KEY) return res.status(401).json({ error: responseMessages.unauthorised });
		if (!source || !Object.values(NOTIFICATION_SOURCE).includes(source as any)) return res.status(400).json({ error: responseMessages.invalid_headers });

		const { channel, userId = null } = req.body as { channel: CHANNEL, userId: number | string | null };
		if (!channel) return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const token = uuidv4();

			if (source === NOTIFICATION_SOURCE.POLKASAFE) {
				const substrateAddress = getSubstrateAddress(String(address));
				const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
				await addressRef.update({ [`notification_preferences.channelPreferences.${channel}.verification_token`]: token });
			} else if (source === NOTIFICATION_SOURCE.POLKASSEMBLY) {
				if (isNaN(Number(userId))) return res.status(400).json({ error: responseMessages.missing_params });

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				const paUserDoc = await firestore_db.collection('users').doc(String(userId)).get();
				if (!paUserDoc.exists) return res.status(400).json({ error: responseMessages.invalid_params });

				const token_expires_at = new Date();
				token_expires_at.setDate(token_expires_at.getDate() + 3);

				await paUserDoc.ref.update({
					[`notification_preferences.channelPreferences.${channel}.verification_token`]: token,
					[`notification_preferences.channelPreferences.${channel}.verification_token_expires`]: token_expires_at
				});
			}

			return res.status(200).json({ data: token });
		} catch (err:unknown) {
			functions.logger.error('Error in getChannelVerifyToken :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

// Polkassembly

export const polkassemblyTelegramBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		functions.logger.info('polkassemblyTelegramBotCommands req', { req } );

		try {
			const { message = null, edited_message = null } = req.body;
			let text = null;
			let chat = null;

			if (message) {
				text = message.text;
				chat = message.chat;
			} else if (edited_message) {
				text = edited_message.text;
				chat = edited_message.chat;
			}

			if (!text || !chat) {
				return res.status(400).json({ error: responseMessages.missing_params });
			}

			if (!TELEGRAM_BOT_TOKEN[NOTIFICATION_SOURCE.POLKASSEMBLY]) {
				functions.logger.error('TELEGRAM_BOT_TOKEN[NOTIFICATION_SOURCE.POLKASSEMBLY] not found');
				return res.status(500).json({ error: responseMessages.internal });
			}

			const bot = new TelegramBot(TELEGRAM_BOT_TOKEN[NOTIFICATION_SOURCE.POLKASSEMBLY], { polling: false });

			if (text.startsWith('/start')) {
				await bot.sendMessage(
					chat.id,
					`Welcome to the Polkassembly Bot!

				To interact with this bot, you can use the following commands:

				- '/add <username><space><verificationToken>': Use this command to add a username to Polkassembly Bot.

				- '/remove <username><space><verificationToken>': Use this command to remove a username from Polkassembly Bot

				Please note that you need to replace '<username>' with the actual username you want to add or remove, and '<verificationToken>' with the token provided for verification.
				`
				);
				return res.sendStatus(200);
			}

			if (text.startsWith('/add')) {
				const commandParts = text.split(' ');
				const username = commandParts[1];
				const verificationToken = commandParts[2];

				if (!username || !verificationToken) {
					await bot.sendMessage(
						chat.id,
						'Invalid command. Please use the following format: /add <username><space><verificationToken>'
					);
					return res.sendStatus(200);
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				// check if the username is valid
				const userDocSnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();
				if (userDocSnapshot.empty) {
					await bot.sendMessage(
						chat.id,
						`User with username ${username} not found.`
					);
					return res.sendStatus(200);
				}

				// check if the verification token is valid
				const userDoc = userDocSnapshot.docs[0];
				const userData = userDoc.data() as IPAUser;

				const storedVerificationToken = userData.notification_preferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token || null;

				if (!storedVerificationToken || verificationToken !== storedVerificationToken) {
					await bot.sendMessage(
						chat.id,
						'Invalid verification token.'
					);
					return res.sendStatus(200);
				}

				const newNotificationPreferences = {
					...(userData.notification_preferences || {}),

					channelPreferences: {
						...(userData.notification_preferences?.channelPreferences || {}),
						[CHANNEL.TELEGRAM]: {
							name: CHANNEL.TELEGRAM,
							enabled: true,
							verified: true,
							handle: String(chat.id),
							verification_token: ''
						}
					}
				};

				// update the address with the telegram chat id
				await userDoc.ref.update({
					notification_preferences: newNotificationPreferences
				});

				// Sending a reply to the user
				await bot.sendMessage(
					chat.id,
					'Address added successfully. You will now receive notifications on this chat.'
				);
				return res.sendStatus(200);
			}

			if (text.startsWith('/remove')) {
				const commandParts = text.split(' ');
				const username = commandParts[1];
				const verificationToken = commandParts[2];

				if (!username || !verificationToken) {
					await bot.sendMessage(
						chat.id,
						'Invalid command. Please use the following format: /remove <web3Address><space><verificationToken>'
					);
					return res.sendStatus(200);
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				// check if the username is valid
				const userDocSnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();
				if (userDocSnapshot.empty) {
					await bot.sendMessage(
						chat.id,
						`User with username ${username} not found.`
					);
					return res.sendStatus(200);
				}

				// check if the verification token is valid
				const userDoc = userDocSnapshot.docs[0];
				const userData = userDoc.data() as IPAUser;

				const storedVerificationToken = userData.notification_preferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token || null;

				if (!storedVerificationToken || verificationToken !== storedVerificationToken) {
					await bot.sendMessage(
						chat.id,
						'Invalid verification token.'
					);
					return res.sendStatus(200);
				}

				const newNotificationPreferences = {
					...(userData.notification_preferences || {}),
					channelPreferences: {
						...(userData.notification_preferences?.channelPreferences || {}),
						[CHANNEL.TELEGRAM]: {
							name: CHANNEL.TELEGRAM,
							enabled: false,
							verified: false,
							handle: '',
							verification_token: ''
						}
					}
				};

				// update the address with the telegram chat id
				await userDoc.ref.update({
					notification_preferences: newNotificationPreferences
				});

				// Sending a reply to the user
				await bot.sendMessage(
					chat.id,
					'Address removed successfully. You will not receive notifications on this chat anymore.'
				);
				return res.sendStatus(200);
			}

			return res.sendStatus(200);
		} catch (err:unknown) {
			functions.logger.error('Error in polkassemblyTelegramBotCommands :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const polkassemblyDiscordBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		functions.logger.info('polkassemblyDiscordBotCommands called', { req });

		const POLKASSEMBLY_DISCORD_BOT_SECRETS = DISCORD_BOT_SECRETS[NOTIFICATION_SOURCE.POLKASSEMBLY];
		try {
			if (!POLKASSEMBLY_DISCORD_BOT_SECRETS.publicKey) return res.status(500).send('DISCORD_PUBLIC_KEY is not set.');

			const signature = req.headers['x-signature-ed25519'];
			const timestamp = req.headers['x-signature-timestamp'];

			if (!signature || !timestamp) return res.status(401).send('Invalid request signature.');

			const isValidRequest = verifyKey(
				req.rawBody,
				String(signature),
				String(timestamp),
				POLKASSEMBLY_DISCORD_BOT_SECRETS.publicKey
			);
			if (!isValidRequest) return res.status(401).send('Invalid request signature.');

			const interactionReq = req.body;
			if (!interactionReq || !interactionReq.type) return res.status(400).send('Invalid request body.');

			functions.logger.info('Interaction received');

			if (interactionReq.type === InteractionType.Ping) {
				return res.status(200).send({
					type: InteractionResponseType.Pong
				});
			}

			if (!interactionReq.data) return res.status(400).send('Invalid request body.');

			const { name, options } = interactionReq.data;
			if (!name || !options) return res.status(400).send('Invalid request body.');

			if (name === 'remove') {
				const username = options[0]?.value;
				const verificationToken = options[1]?.value;
				if (!username || !verificationToken) return res.status(400).send('Invalid request body.');

				// Discord needs a response within 3 seconds
				res.status(200).send({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `Removing username: ${username}.`
					}
				});

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				// check if the username is valid
				const userDocSnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();
				if (userDocSnapshot.empty) {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, interactionReq.channel_id, `Username: ${username} not found. Please use your polkassembly username to interact with the bot.`);
					return;
				}

				// check if the verification token is valid
				const userDoc = userDocSnapshot.docs[0];
				const userData = userDoc.data() as IPAUser;

				const storedVerificationToken = userData.notification_preferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token || null;

				if (!storedVerificationToken || verificationToken !== storedVerificationToken) {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, interactionReq.channel_id, 'Invalid verification token.');
					return;
				}

				const newNotificationPreferences = {
					...(userData.notification_preferences || {}),
					channelPreferences: {
						...(userData.notification_preferences?.channelPreferences || {}),
						[CHANNEL.DISCORD]: {
							name: CHANNEL.DISCORD,
							enabled: false,
							verified: false,
							handle: '',
							verification_token: ''
						}
					}
				};

				await userDoc.ref.update({
					notification_preferences: newNotificationPreferences
				});

				await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, interactionReq.channel_id, `${username} removed successfully. You will not receive notifications on this channel anymore.`);
				return;
			} else if (name === 'add') {
				const username = options[0]?.value;
				const verificationToken = options[1]?.value;
				if (!username || !verificationToken) return res.status(400).send('Invalid request body.');

				// Discord needs a response within 3 seconds
				res.status(200).send({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: `Adding username: ${username}.`
					}
				});

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				const userDocSnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();
				if (userDocSnapshot.empty) {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, interactionReq.channel_id, `Username: ${username} not found. Please use your polkassembly username to interact with the bot.`);
					return;
				}

				// check if the verification token is valid
				const userDoc = userDocSnapshot.docs[0];
				const userData = userDoc.data() as IPAUser;

				const storedVerificationToken = userData.notification_preferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token || null;

				if (!storedVerificationToken || verificationToken !== storedVerificationToken) {
					await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, interactionReq.channel_id, 'Invalid verification token.');
					return;
				}

				const newNotificationPreferences = {
					...(userData.notification_preferences || {}),
					channelPreferences: {
						...(userData.notification_preferences?.channelPreferences || {}),
						[CHANNEL.DISCORD]: {
							name: CHANNEL.DISCORD,
							enabled: true,
							verified: true,
							handle: interactionReq.channel_id,
							verification_token: ''
						}
					}
				};

				await userDoc.ref.update({
					notification_preferences: newNotificationPreferences
				});

				await sendDiscordMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, interactionReq.channel_id, `${username} added successfully. You will receive notifications on this channel.`);
				return;
			}

			return res.status(200).end();
		} catch (err:unknown) {
			functions.logger.error('Error in polkassemblyDiscordBotCommands :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const registerPolkassemblyDiscordBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const apiKey = req.get('x-api-key');

		const POLKASSEMBLY_DISCORD_BOT_SECRETS = DISCORD_BOT_SECRETS[NOTIFICATION_SOURCE.POLKASSEMBLY];

		if (!apiKey || !NOTIFICATION_ENGINE_API_KEY || apiKey !== NOTIFICATION_ENGINE_API_KEY || !POLKASSEMBLY_DISCORD_BOT_SECRETS.clientId || !POLKASSEMBLY_DISCORD_BOT_SECRETS.token) return res.status(401).json({ error: responseMessages.unauthorised });

		if (!POLKASSEMBLY_DISCORD_BOT_SECRETS.token) return res.status(500).send('DISCORD_BOT_TOKEN is not set.');

		const commands = [
			{
				name: 'remove',
				description: 'Remove a username from Polkassembly bot.',
				type: 1,
				options: [
					{
						name: 'username',
						description: 'The username to stop recieving notifications for',
						type: 3,
						required: true
					},
					{
						name: 'verification-token',
						description: 'The verification token',
						type: 3,
						required: true
					}
				]
			},
			{
				name: 'add',
				description: 'Add a username to Polkassembly bot.',
				type: 1,
				options: [
					{
						name: 'username',
						description: 'The username to start recieving notifications for',
						type: 3,
						required: true
					},
					{
						name: 'verification-token',
						description: 'The verification token',
						type: 3,
						required: true
					}
				]
			}
		];

		try {
			console.log('Started refreshing application (/) commands.');

			const rest = new REST({ version: '9' }).setToken(POLKASSEMBLY_DISCORD_BOT_SECRETS.token);

			await rest.put(
				Routes.applicationCommands(POLKASSEMBLY_DISCORD_BOT_SECRETS.clientId),
				{ body: commands },
			);

			console.log('Successfully registered application (/) commands.');

			return res.status(200).send('Commands registered successfully.');
		} catch (err:unknown) {
			functions.logger.error('Error in telegramBotCommands :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});

export const polkassemblySlackBotCommands = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			// slack needs an acknowledgement response within 3 seconds
			res.status(200).end();
			const { command, text, user_id } = req.body;
			functions.logger.info('polkassemblySlackBotCommands req :', { req });

			if (command == '/polkassembly-add') {
				await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Adding username...');

				const [username, verificationToken] = text.split(' ');

				if (!username || !verificationToken) {
					// Send a response back to Slack
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Invalid command. Please use the following format: /polkassembly-add <username> <verificationToken>');
					return;
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				const userDocSnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();
				if (userDocSnapshot.empty) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), `Username: ${username} not found. Please use your polkassembly username to interact with the bot.`);
					return;
				}

				// check if the verification token is valid
				const userDoc = userDocSnapshot.docs[0];
				const userData = userDoc.data() as IPAUser;

				const storedVerificationToken = userData.notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token || null;

				// check if the verification token is valid
				if (!storedVerificationToken || verificationToken !== storedVerificationToken) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Invalid verification token.');
					return;
				}

				const newNotificationPreferences = {
					...(userData.notification_preferences || {}),
					channelPreferences: {
						...(userData.notification_preferences?.channelPreferences || {}),
						[CHANNEL.SLACK]: {
							name: CHANNEL.SLACK,
							enabled: true,
							verified: true,
							handle: String(user_id),
							verification_token: ''
						}
					}
				};

				// update the address with the slack chat id
				await userDoc.ref.update({
					notification_preferences: newNotificationPreferences
				});

				// Sending a reply to the user
				await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Username added successfully. You will now receive notifications on this chat.');
				return;
			}

			if (command === '/polkassembly-remove') {
				await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Removing username...');
				const [username, verificationToken] = text.split(' ');

				if (!username || !verificationToken) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Invalid command. Please use the following format: /polkassembly-remove <username> <verificationToken>');
					return;
				}

				const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

				const userDocSnapshot = await firestore_db.collection('users').where('username', '==', username).limit(1).get();
				if (userDocSnapshot.empty) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), `Username: ${username} not found. Please use your polkassembly username to interact with the bot.`);
					return;
				}

				// check if the verification token is valid
				const userDoc = userDocSnapshot.docs[0];
				const userData = userDoc.data() as IPAUser;

				const storedVerificationToken = userData.notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token || null;

				// check if the verification token is valid
				if (!storedVerificationToken || verificationToken !== storedVerificationToken) {
					await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Invalid verification token.');
					return;
				}

				const newNotificationPreferences = {
					...(userData.notification_preferences || {}),
					channelPreferences: {
						...(userData.notification_preferences?.channelPreferences || {}),
						[CHANNEL.SLACK]: {
							name: CHANNEL.SLACK,
							enabled: false,
							verified: false,
							handle: '',
							verification_token: ''
						}
					}
				};

				// update the username with the slack user id
				await userDoc.ref.update({
					notification_preferences: newNotificationPreferences
				});

				// Sending a reply to the user
				await sendSlackMessage(NOTIFICATION_SOURCE.POLKASSEMBLY, String(user_id), 'Username removed successfully. You will not receive notifications on this chat anymore.');
				return;
			}
		} catch (err:unknown) {
			functions.logger.error('Error in polkassemblySlackBotCommands :', { err, stack: (err as any).stack });
			if (!res.headersSent) res.status(500).json({ error: responseMessages.internal });
		}

		return;
	});
});

export const updateTransactionFields = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');
		const network = String(req.get('x-network'));

		const { isValid, error } = await isValidRequest(address, signature, network);
		if (!isValid) return res.status(400).json({ error });

		const { transactionFields } = req.body as { transactionFields: ITransactionFields };
		if (!transactionFields || typeof transactionFields !== 'object') return res.status(400).json({ error: responseMessages.missing_params });

		try {
			const substrateAddress = getSubstrateAddress(String(address));

			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			addressRef.update({ ['transactionFields']: transactionFields });

			return res.status(200).json({ data: responseMessages.success });
		} catch (err:unknown) {
			functions.logger.error('Error in updateTransactionFields :', { err, stack: (err as any).stack });
			return res.status(500).json({ error: responseMessages.internal });
		}
	});
});
