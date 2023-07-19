// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { SafeInfoResponse } from '@safe-global/api-kit';
import { EthersAdapter } from '@safe-global/protocol-kit';
import React, { useState } from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { returnTxUrl } from 'src/global/gnosisService';
import { GnosisSafeService } from 'src/services';
import { IMultisigAddress, NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import NameAddress from '../LinkMultisig/NameAddress';
import SelectNetwork from '../LinkMultisig/SelectNetwork';
import Owners from './Owners';
import Review from './Review';

interface ISignatory {
	name: string
	address: string
}

const LinkMultisig = ({ onCancel }: { onCancel: () => void }) => {
	const [multisigName, setMultisigName] = useState('');
	const [nameAddress, setNameAddress] = useState(true);
	const [viewOwners, setViewOwners] = useState(true);
	const [viewReviews, setViewReviews] = useState(true);
	const { address, addressBook } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { ethProvider } = useGlobalWeb3Context();

	const [multisigAddress, setMultisigAddress] = useState<string>('');

	const [multisigInfo, setMultisigInfo] = useState<SafeInfoResponse | null>(null);

	const [multisigData, setMultisigData] = useState<IMultisigAddress>();

	const [loading, setLoading] = useState<boolean>(false);

	const [signatoriesWithName, setSignatoriesWithName] = useState<ISignatory[]>([]);

	const [signatoriesArray, setSignatoriesArray] = useState<ISignatory[]>([{ address, name: addressBook?.find((item: any) => item.address === address)?.name || '' }, { address: '', name: '' }]);
	const [threshold, setThreshold] = useState<number>(2);

	const viewNameAddress = () => {
		setNameAddress(false);
	};

	const handleViewOwners = async () => {
		try {
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else {
				const signer = ethProvider.getSigner();
				const adapter = new EthersAdapter({
					ethers: ethProvider,
					signerOrProvider: signer
				});
				const txUrl = returnTxUrl(network);
				const gnosisService = new GnosisSafeService(adapter, signer, txUrl);

				const info = await gnosisService.getMultisigData(multisigAddress);
				setMultisigInfo(info);

				console.log('info', info);

				// const getMultisigDataRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigDataByMultisigAddress`, {
				// 	body: JSON.stringify({
				// 		multisigAddress,
				// 		network
				// 	}),
				// 	headers: firebaseFunctionsHeader(network),
				// 	method: 'POST'
				// });

				// const { data: multisigDataRes, error: multisigError } = await getMultisigDataRes.json() as { data: IMultisigAddress, error: string };

				// if(multisigError) {

				// 	queueNotification({
				// 		header: 'Error!',
				// 		message: multisigError,
				// 		status: NotificationStatus.ERROR
				// 	});
				// 	setLoading(false);
				// 	return;
				// }

				if (info) {
					setLoading(false);
					setNameAddress(false);
					setViewOwners(false);
					setThreshold(info.threshold);
					setSignatoriesArray(info.owners.map(address => ({ name: '', address })));
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleViewReviews = () => {
		setNameAddress(false);
		setViewOwners(false);
		setViewReviews(false);
	};

	const checkMultisig = (signatories: ISignatory[]) => {
		const signatoryAddresses = signatories.map(item => item.address);

		setMultisigData(prevState => {
			return {
				...prevState,
				name: multisigName,
				address: multisigAddress,
				signatories: signatoryAddresses,
				threshold,
				network,
				created_at: new Date()
			};
		});
		setSignatoriesWithName(signatories);
		setNameAddress(false);
		setViewOwners(false);
		setViewReviews(false);

	};

	const handleLinkMultisig = async () => {
		setLoading(true);
		if (multisigData) {
			try {

				await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig`, {
					body: JSON.stringify({
						signatories: signatoriesArray.map(item => item.address),
						threshold,
						multisigName,
						proxyAddress: multisigInfo?.address
					}),
					headers: firebaseFunctionsHeader('goerli', localStorage.getItem('address')!, localStorage.getItem('signature')!),
					method: 'POST'
				});

				const signer = ethProvider.getSigner();
				const adapter = new EthersAdapter({
					ethers: ethProvider,
					signerOrProvider: signer
				});
				const txUrl = returnTxUrl(network);
				const gnosisService = new GnosisSafeService(adapter, signer, txUrl);

				const pendingTx = await gnosisService.getPendingTx(multisigInfo!.address);
				const completedTx = await gnosisService.getAllCompletedTx(multisigInfo!.address);
				console.log('completedTx', completedTx, pendingTx);

				queueNotification({
					header: 'Success!',
					message: 'Multisig Linked Successfully.',
					status: NotificationStatus.SUCCESS
				});
			} catch (err) {
				console.log(err);
				queueNotification({
					header: 'Error!',
					message: 'Invalid Multisig',
					status: NotificationStatus.ERROR
				});

			}
		} else {
			queueNotification({
				header: 'Error!',
				message: 'Invalid Multisig',
				status: NotificationStatus.ERROR
			});
		}

		setLoading(false);
	};

	return (
		<>
			{nameAddress ?
				<div>
					<SelectNetwork />
					<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
						<CancelBtn onClick={onCancel} />
						<AddBtn title='Continue' onClick={viewNameAddress} />
					</div>
				</div> :
				<div>
					{viewOwners ? <div>
						<NameAddress multisigName={multisigName} setMultisigName={setMultisigName} multisigAddress={multisigAddress} setMultisigAddress={setMultisigAddress} />
						<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
							<CancelBtn onClick={onCancel} />
							<AddBtn disabled={!multisigAddress} title='Continue' loading={loading} onClick={handleViewOwners} />
						</div>
					</div> : <div>
						{viewReviews ? <div>
							<Owners multisigThreshold={multisigData?.threshold} threshold={threshold} setThreshold={setThreshold} setSignatoriesArray={setSignatoriesArray} signatoriesArray={signatoriesArray} signatories={signatoriesWithName} setSignatoriesWithName={setSignatoriesWithName} />
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={onCancel} />
								{signatoriesWithName.length && multisigData?.threshold ?
									<AddBtn title='Continue' onClick={handleViewReviews} />
									:
									<AddBtn disabled={signatoriesArray.length < 2 || threshold < 2 || threshold > signatoriesArray.length || signatoriesArray.some((item) => item.address === '')} title='Check Multisig' onClick={() => checkMultisig(signatoriesArray)} />
								}
							</div>
						</div> : <div>
							<Review multisigName={multisigName} multisigData={multisigData} signatories={signatoriesWithName} />
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={onCancel} />
								<AddBtn loading={loading} title='Link Multisig' onClick={handleLinkMultisig} />
							</div>
						</div>}
					</div>}
				</div>
			}
		</>
	);
};

export default LinkMultisig;
