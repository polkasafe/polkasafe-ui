import { IPSMultisigAddress } from './types';

export default async function getMultisigData(firestore_db: FirebaseFirestore.Firestore, address: string) {
	const multisigDoc = await firestore_db.collection('multisigAddresses').doc(address).get();
	if (!multisigDoc.exists) throw Error(`Multisig not found: ${address}`);
	return multisigDoc.data() as IPSMultisigAddress;
}
