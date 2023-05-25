import axios from 'axios';
import { IQueueItem, ITransaction } from '../types';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';
import { responseMessages } from '../constants/response_messages';
import dayjs from 'dayjs';
import { firestore } from 'firebase-admin';

interface IResponse {
	error?: string | null;
	data: IQueueItem[];
}

export default async function getMultisigQueueByAddress(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number,
	firestoreDB: firestore.Firestore
): Promise<IResponse> {
	const returnValue: IResponse = {
		error: '',
		data: []
	};

	try {
		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/scan/multisigs`, {
			'row': entries || 1,
			'page': page - 1 || 0, // pages start from 0
			'account': multisigAddress
		}, {
			headers: SUBSCAN_API_HEADERS
		});

		const queueItems: IQueueItem[] = [];

		if (response.data && response.data.multisig?.length) {
			for (const multisigQueueItem of response.data.multisig) {
				if (multisigQueueItem.status !== 'Approval') continue;

				const { data: multisigData } = await axios.post(`https://${network}.api.subscan.io/api/scan/multisig`, {
					'multi_id': multisigQueueItem.multi_id,
					'call_hash': multisigQueueItem.call_hash
				}, {
					headers: SUBSCAN_API_HEADERS
				});

				const transactionDoc = await firestoreDB.collection('transactions').doc(multisigQueueItem.call_hash).get();
				const transaction: ITransaction = transactionDoc.data() as ITransaction;

				const newQueueItem: IQueueItem = {
					callData: transactionDoc.exists && transaction?.callData ? transaction?.callData : '',
					callHash: multisigQueueItem.call_hash,
					status: multisigQueueItem.status,
					network: network,
					created_at: dayjs(multisigData?.data?.process?.reduce((min: any, current: any) => {
						if (current.timestamp && current.timestamp < min) return current.timestamp;
						return min;
					}, Number.MAX_SAFE_INTEGER) * 1000).toDate(),
					threshold: multisigQueueItem.threshold,
					approvals: multisigData?.data?.process?.filter((item: any) => item.status === 'Approval').map((item: any) => item.account_display.address),
					notifications: transactionDoc.exists && transaction?.notification ? transaction?.notification : undefined,
					note: transactionDoc.exists && transaction?.note ? transaction?.note : '',
				};

				queueItems.push(newQueueItem);
			}
		}

		returnValue.data = queueItems;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}

