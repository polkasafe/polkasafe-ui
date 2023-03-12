// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Divider, message } from 'antd';
import React, { FC } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import getEncodedAddress from 'src/utils/getEncodedAddress';

interface IReceivedInfoProps {
	amount: string;
	amountType: string;
	date: string;
	// time: string;
	from: string
	callHash: string
}

const ReceivedInfo: FC<IReceivedInfoProps> = (props) => {
	const { addressBook } = useGlobalUserDetailsContext();
	const { amount, amountType, date, from, callHash } = props;
	const handleCopy = (address: string) => {
		navigator.clipboard.writeText(`${address}`);
		message.success('Copied!');
	};
	return (
		<article
			className='p-4 rounded-lg bg-bg-main'
		>
			<p
				className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'
			>
				<span>
							Received
				</span>
				<span
					className='text-success'
				>
					{amount} {amountType}
				</span>
				<span>
							from:
				</span>
			</p>
			<div
				className='mt-3 flex items-center gap-x-4'
			>
				<Identicon size={30} value={from} theme='polkadot'  />
				<div
					className='flex flex-col gap-y-[6px]'
				>
					<p
						className='font-medium text-sm leading-[15px] text-white'
					>
						{addressBook.find((item) => item.address === from)?.name || DEFAULT_ADDRESS_NAME}
					</p>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span>
							{getEncodedAddress(from)}
						</span>
						<span
							className='flex items-center gap-x-2 text-sm'
						>
							<button onClick={() => handleCopy(getEncodedAddress(from) || '')}><CopyIcon className='hover:text-primary'/></button>
							<a href={`https://www.subscan.io/account/${getEncodedAddress(from)}`} target='_blank' rel="noreferrer" >
								<ExternalLinkIcon />
							</a>
						</span>
					</p>
				</div>
			</div>
			<Divider className='bg-text_secondary my-5' />
			<div
				className='w-full max-w-[418px] flex items-center justify-between gap-x-5'
			>
				<span
					className='text-text_secondary font-normal text-sm leading-[15px]'
				>
							Txn Hash:
				</span>
				<p
					className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
				>
					<span
						className='text-white font-normal text-sm leading-[15px]'
					>
						{callHash}
					</span>
					<span
						className='flex items-center gap-x-2 text-sm'
					>
						<button onClick={() => handleCopy(callHash)}><CopyIcon/></button>
						{/* <ExternalLinkIcon /> */}
					</span>
				</p>
			</div>
			{date &&
			<div
				className='w-full max-w-[418px] flex items-center justify-between gap-x-5 mt-3'
			>
				<span
					className='text-text_secondary font-normal text-sm leading-[15px]'
				>
						Executed:
				</span>
				<p
					className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
				>
					<span
						className='text-white font-normal text-sm leading-[15px]'
					>
						{date}
					</span>
				</p>
			</div>}
		</article>
	);
};

export default ReceivedInfo;