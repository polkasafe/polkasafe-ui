// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import React from 'react';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';
import { useGlobalApiContext } from 'src/context/ApiContext';
import AddressComponent from 'src/ui-components/AddressComponent';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import shortenAddress from 'src/utils/shortenAddress';

import ModalBtn from './ModalBtn';

interface IAddProxySuccessScreen {
	txnHash?: string
	createdBy: string
	threshold: number
	signatories: string[]
	onDone?: () => void
	successMessage?: string
	waitMessage?: string
}

const AddProxySuccessScreen = ({ txnHash, createdBy, threshold, signatories, onDone, successMessage = 'Successful!', waitMessage }: IAddProxySuccessScreen) => {
	const { network } = useGlobalApiContext();
	return (
		<div className='flex flex-col items-center'>
			<SuccessTransactionLottie message={successMessage} waitMessage={waitMessage} />
			<div className='flex flex-col w-full gap-y-4 bg-bg-secondary p-4 rounded-lg mb-1 mt-2 text-text_secondary'>
				{txnHash &&
					<div className='flex justify-between items-center'>
						<span>Txn Hash:</span>
						<div className='flex items-center gap-x-2'>
							<span className='text-white'>{shortenAddress(txnHash)}</span>
							<button onClick={() => copyText(txnHash)}>
								<CopyIcon className='text-primary' />
							</button>
							<a href={`https://${network}.subscan.io/extrinsic/${txnHash}}`} target='_blank' rel="noreferrer" >
								<ExternalLinkIcon />
							</a>
						</div>
					</div>
				}
				<div className='flex justify-between items-center'>
					<span>Created:</span>
					<span className='text-white'>{dayjs().format('llll')}</span>
				</div>
				<div className='flex justify-between items-center'>
					<span>Created By:</span>
					<span><AddressComponent address={createdBy} /></span>
				</div>
				<div className='flex justify-between items-center'>
					<span>Pending Approvals: <span className='text-white'>1/{threshold}</span></span>
					<span className='flex flex-col gap-y-2 overflow-y-auto max-h-[115px] [&::-webkit-scrollbar]:hidden'>{signatories.filter((item) => item !== createdBy).map((item, i) => (<AddressComponent key={i} address={item} />))}</span>
				</div>
			</div>
			<div className='flex justify-center mt-2'>
				<ModalBtn title='Done' onClick={onDone} />
			</div>
		</div>
	);
};

export default AddProxySuccessScreen;