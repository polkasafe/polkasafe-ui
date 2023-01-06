import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { responseMessages, SIGNING_MSG } from './constants';
import { IUser } from './types';

admin.initializeApp();

const isValidSignature = async (signature:string, address:string) => {
	await cryptoWaitReady();
	const hexPublicKey = u8aToHex(decodeAddress(address));
	return signatureVerify(SIGNING_MSG, signature, hexPublicKey).isValid;
};

export const connectAddress = functions.https.onCall(async (data) => {
	if (!data || !data.address || !data.signature) {
		throw new functions.https.HttpsError('invalid-argument', responseMessages.invalid_argument);
	}

	const { address, signature } = data;
	const isValid = await isValidSignature(signature, address);

	if (!isValid) {
		throw new functions.https.HttpsError('permission-denied', responseMessages.invalid_signature);
	}

	// check if address doc already exists
	const addressRef = admin.firestore().collection('addresses').doc(address);

	addressRef.get().then(async (doc) => {
		if (doc.exists) return doc;

		// else create a new user document
		const newUser:IUser = {
			address,
			email: null,
			multisigAddresses: [],
			addressBook: []
		};

		await addressRef.set(newUser);

		return newUser;
	}).catch((e) => {
		throw new functions.https.HttpsError('internal', e.message);
	});
});

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.
