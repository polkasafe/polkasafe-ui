import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import cors = require('cors');
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { responseMessages, SIGNING_MSG } from './constants';
import { IMultisigAddress, IUser, IUserResponse } from './types';

admin.initializeApp();

const firestoreDB = admin.firestore();

// TODO: Remove cors before production
const corsHandler = cors({ origin: true });

const isValidSignature = async (signature:string, address:string) => {
	try {
		await cryptoWaitReady();
		const hexPublicKey = u8aToHex(decodeAddress(address));
		return signatureVerify(SIGNING_MSG, signature, hexPublicKey).isValid;
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

export const getConnectAddressToken = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		const address = req.get('x-address');
		if (!address) return res.status(400).json({ error: responseMessages.missing_params });

		// check if address doc already exists
		const addressRef = firestoreDB.collection('addresses').doc(address);

		const token = `<Bytes>${uuidv4()}</Bytes>`;

		try {
			await addressRef.set({ address, token }, { merge: true });
			return res.status(500).json({ data: token });
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

		if (!signature || !address) return res.status(400).json({ error: responseMessages.missing_params });

		const isValid = await isValidSignature(signature, address);
		if (!isValid) return res.status(400).json({ error: responseMessages.invalid_signature });

		// check if address doc already exists
		const addressRef = firestoreDB.collection('addresses').doc(address);

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
				return res.status(200).json({ data: resUser });
			}

			// else create a new user document
			const newUser:IUser = {
				address,
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

// TODO: Every time history is asked from the server, the server should check from subscan and store it in the database
// with the price at that time.
