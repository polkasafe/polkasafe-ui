// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Divider, Spin } from 'antd';
import React, { FC } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalCurrencyContext } from 'src/context/CurrencyContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { currencyProperties } from 'src/global/currencyConstants';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { ITransaction } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import shortenAddress from 'src/utils/shortenAddress';

interface IReceivedInfoProps {
	className?: string;
	amount: string;
	amountType: string;
	amount_usd: number;
	date: string;
	// time: string;
	from: string
	to: string
	callHash: string
	transactionDetails?: ITransaction
	loading?: boolean
}

const ReceivedInfo: FC<IReceivedInfoProps> = ({ amount, to, amount_usd, amountType, date, from, callHash, transactionDetails, loading }) => {
	const { addressBook } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();

	return (
		<article
			className='p-4 rounded-lg bg-bg-main flex-1'
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
					{amount} {amountType} ({(Number(amount_usd) * Number(currencyPrice)).toFixed(2)} {currencyProperties[currency].symbol})
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
						{addressBook?.find((item) => item.address === from)?.name || DEFAULT_ADDRESS_NAME}
					</p>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span>
							{getEncodedAddress(from, network)}
						</span>
						<span
							className='flex items-center gap-x-2 text-sm'
						>
							<button onClick={() => copyText(from, true, network)}><CopyIcon className='hover:text-primary'/></button>
							<a href={`https://${network}.subscan.io/account/${getEncodedAddress(from, network)}`} target='_blank' rel="noreferrer" >
								<ExternalLinkIcon />
							</a>
						</span>
					</p>
				</div>
			</div>
			<Divider className='bg-text_secondary my-5' />
			<section className='w-[50%]'>

				<div
					className=' flex items-center justify-between gap-x-7 mb-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
					To:
					</span>
					<AddressComponent address={to} />
				</div>
				<div
					className='w-full flex items-center justify-between gap-x-5'
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
							{shortenAddress(callHash, 10)}
						</span>
						<span
							className='flex items-center gap-x-2 text-sm'
						>
							<button onClick={() => copyText(callHash)}><CopyIcon/></button>
							{/* <ExternalLinkIcon /> */}
						</span>
					</p>
				</div>
				{date &&
				<div
					className='w-full flex items-center justify-between gap-x-5 mt-3'
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
				{loading ? <Spin className='mt-3' /> : transactionDetails &&
				<div
					className='w-full flex items-center justify-between gap-x-5 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
							Note:
					</span>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span
							className='text-white font-normal text-sm leading-[15px] whitespace-pre'
						>
							{transactionDetails?.note}
						</span>
					</p>
				</div>}
			</section>
		</article>
	);
};

export default ReceivedInfo;