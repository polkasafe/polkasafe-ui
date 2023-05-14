import { IPSUser } from './types';

export default async function getPSUser(firestore_db: FirebaseFirestore.Firestore, userAddress: string) {
	const userAddressDoc = await firestore_db.collection('addresses').doc(userAddress).get();
	if (!userAddressDoc.exists) throw Error(`User not found: ${userAddressDoc}`);
	return userAddressDoc.data() as IPSUser;
}
