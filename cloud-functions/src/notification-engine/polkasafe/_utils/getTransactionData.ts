import { IPSTransaction } from './types';

export default async function getTransactionData(firestore_db: FirebaseFirestore.Firestore, callHash: string) {
	const transactionDoc = await firestore_db.collection('transactions').doc(callHash).get();
	if (!transactionDoc.exists) throw Error(`Transaction not found: ${callHash}`);
	return transactionDoc.data() as IPSTransaction;
}
