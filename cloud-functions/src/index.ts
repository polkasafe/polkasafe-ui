import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors = require('cors');
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { responseMessages, SIGNING_MSG } from './constants';
import { IMultisigAddress, IUser, IUserResponse } from './types';

admin.initializeApp();

const corsHandler = cors({ origin: true });

const isValidSignature = async (signature:string, address:string) => {
	await cryptoWaitReady();
	const hexPublicKey = u8aToHex(decodeAddress(address));
	return signatureVerify(SIGNING_MSG, signature, hexPublicKey).isValid;
};

const getMultisigAddressesByAddress = async (address:string) => {
	const multisigAddresses = await admin
		.firestore()
		.collection('multisigAddresses')
		.where('signatories', 'array-contains', address)
		.get();

	return multisigAddresses.docs.map((doc) => doc.data()) as IMultisigAddress[];
};

export const connectAddress = functions.https.onRequest(async (req, res) => {
	// TODO: Remove this before production
	corsHandler(req, res, async () => {
		const signature = req.get('x-signature');
		const address = req.get('x-address');

		if (!signature || !address) {
			res.status(400).send(responseMessages.missing_params);
			return;
		}

		try {
			const isValid = await isValidSignature(signature, address);
			if (!isValid) {
				res.status(400).send(responseMessages.invalid_signature);
				return;
			}
		} catch (e) {
			res.status(400).send(responseMessages.invalid_signature);
			return;
		}

		// check if address doc already exists
		const addressRef = admin.firestore().collection('addresses').doc(address);

		try {
			const doc = await addressRef.get();
			if (doc.exists) {
				const addressDoc = doc.data() as IUser;
				const multisigAddresses = await getMultisigAddressesByAddress(address);

				const resUser: IUserResponse = {
					address: addressDoc.address,
					email: addressDoc.email,
					addressBook: addressDoc.addressBook,
					multisigAddresses
				};
				res.status(200).send(resUser);
				return;
			}

			// else create a new user document
			const newUser:IUser = {
				address,
				email: null,
				multisigAddresses: [],
				addressBook: []
			};

			await addressRef.set(newUser);
			res.status(200).send(newUser);
			return;
		} catch (err:unknown) {
			functions.logger.info('Error in firestore call :', { err });
			res.status(500).send(responseMessages.internal);
			return;
		}
	});
});

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.
