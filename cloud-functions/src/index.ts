/* eslint-disable */
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
		return {
			error: new Error(responseMessages.INVALID_PARAMS)
		};
	}

	const { address, signature } = data;
	const isValid = await isValidSignature(signature, address);

	if (!isValid) {
		return {
			error: new Error(responseMessages.INVALID_SIGNATURE)
		};
	}

	// check if address doc already exists
	const addressRef = admin.firestore().collection('addresses').doc(address);
	const doc = await addressRef.get();

	if (doc.exists) {
		return doc;
	} else {
		// else create a new user document
		const newUser:IUser = {
			address,
			email: null,
			multisigAddresses: [],
			addressBook: []
		};
		await addressRef.set(newUser);
		return newUser;
	}
});

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.