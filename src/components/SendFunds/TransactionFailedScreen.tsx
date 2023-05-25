// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import React from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import ModalBtn from 'src/components/Multisig/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import AddressComponent from 'src/ui-components/AddressComponent';
import { CopyIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import shortenAddress from 'src/utils/shortenAddress';

interface ITransactionFailedScreen{
    txnHash?: string
    created_at: Date
    sender: string
    onDone?: () => void
    failedMessage: string
    waitMessage?: string
}

const TransactionFailedScreen = ({ txnHash, created_at, sender, onDone, failedMessage, waitMessage }: ITransactionFailedScreen) => {
	const { network } = useGlobalApiContext();
	return (
		<div className='flex flex-col items-center'>
			<FailedTransactionLottie className='mb-3' message={failedMessage} waitMessage={waitMessage} />
			<div className='flex flex-col w-full gap-y-4 bg-bg-secondary p-4 rounded-lg my-1 text-text_secondary'>
				{txnHash &&
					<div className='flex justify-between items-center'>
						<span>Txn Hash:</span>
						<div className='flex items-center gap-x-1'>
							<span className='text-white'>{shortenAddress(txnHash)}</span>
							<button onClick={() => copyText(txnHash, false, network)}>
								<CopyIcon className='mr-2 text-primary' />
							</button>
						</div>
					</div>
				}
				<div className='flex justify-between items-center'>
					<span>Created:</span>
					<span className='text-white'>{dayjs(created_at).format('llll')}</span>
				</div>
				<div className='flex justify-between items-center'>
					<span>Created By:</span>
					<span><AddressComponent address={sender} /></span>
				</div>
			</div>
			<div className='flex justify-center mt-2'>
				<ModalBtn title='Done' onClick={onDone} />
			</div>
		</div>
	);
};

export default TransactionFailedScreen;