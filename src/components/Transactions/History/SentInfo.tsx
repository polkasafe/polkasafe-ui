// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Collapse, Divider, Spin, Timeline } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalCurrencyContext } from 'src/context/CurrencyContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { currencyProperties } from 'src/global/currencyConstants';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { chainProperties } from 'src/global/networkConstants';
import { ITransaction } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import { ArrowRightIcon, CircleCheckIcon, CirclePlusIcon, CircleWatchIcon, CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import parseDecodedValue from 'src/utils/parseDecodedValue';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

import ArgumentsTable from '../Queued/ArgumentsTable';

interface ISentInfoProps {
	approvals?: string[];
	callData?: string;
	recipientAddresses?: string | string[]
	amount: string | string[];
	date: string;
	// time: string;
    className?: string;
	callHash: string
	transactionDetails?: ITransaction
	loading?: boolean
	amount_usd: number
	from: string
	txnParams?: { method: string, section: string }
	customTx: boolean
}

const SentInfo: FC<ISentInfoProps> = ({ amount, callData, approvals, customTx, txnParams, recipientAddresses, from, amount_usd, className, date, callHash, transactionDetails, loading }) => {
	const { addressBook, activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();
	const threshold = multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig)?.threshold || 0;
	const [showDetails, setShowDetails] = useState<boolean>(false);

	return (
		<div
			className={classNames('flex gap-x-4', className)}
		>
			<article
				className='p-4 rounded-lg bg-bg-main flex-1'
			>
				{customTx ? <></> :
					(typeof recipientAddresses === 'string') ?
						<>
							<p
								className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'
							>
								<span>
									Sent
								</span>
								<span
									className='text-failure'
								>
									{amount ? parseDecodedValue({
										network,
										value: String(amount),
										withUnit: true
									}) : `? ${chainProperties[network].tokenSymbol}`} {!isNaN(Number(amount_usd)) && amount && <span>({(Number(amount_usd) * Number(parseDecodedValue({
										network,
										value: String(amount),
										withUnit: false
									}))).toFixed(2)} USD)</span>}
								</span>
								<span>
									To:
								</span>
							</p>
							<div
								className='mt-3 flex items-center gap-x-4'
							>
								{recipientAddresses && <Identicon size={30} theme='polkadot' value={recipientAddresses} />}
								<div
									className='flex flex-col gap-y-[6px]'
								>
									<p
										className='font-medium text-sm leading-[15px] text-white'
									>
										{recipientAddresses ? (addressBook?.find((item) => item.address === recipientAddresses)?.name || DEFAULT_ADDRESS_NAME) : '?'}
									</p>
									{recipientAddresses &&
							<p
								className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
							>
								<span>
									{getEncodedAddress(recipientAddresses, network)}
								</span>
								<span
									className='flex items-center gap-x-2 text-sm'
								>
									<button onClick={() => copyText(recipientAddresses, true, network)}><CopyIcon className='hover:text-primary'/></button>
									<a href={`https://${network}.subscan.io/account/${getEncodedAddress(recipientAddresses, network)}`} target='_blank' rel="noreferrer" >
										<ExternalLinkIcon />
									</a>
								</span>
							</p>}
								</div>
							</div>
						</>:
						<div className='flex flex-col gap-y-1' >
							{Array.isArray(recipientAddresses) && recipientAddresses.map((item, i) => (
								<>
									<p
										className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'
									>
										<span>
											Sent
										</span>
										<span
											className='text-failure'
										>
											{amount[i] ? parseDecodedValue({
												network,
												value: String(amount[i]),
												withUnit: true
											}) : `? ${chainProperties[network].tokenSymbol}`} {!isNaN(Number(amount_usd)) && amount[i] && <span>({(Number(amount_usd) * Number(currencyPrice) * Number(parseDecodedValue({
												network,
												value: String(amount[i]),
												withUnit: false
											}))).toFixed(2)} {currencyProperties[currency].symbol})</span>}
										</span>
										<span>
											To:
										</span>
									</p>
									<div
										className='mt-3 flex items-center gap-x-4'
									>
										{item && <Identicon size={30} theme='polkadot' value={item} />}
										<div
											className='flex flex-col gap-y-[6px]'
										>
											<p
												className='font-medium text-sm leading-[15px] text-white'
											>
												{recipientAddresses ? (addressBook?.find((a) => a.address === item)?.name || DEFAULT_ADDRESS_NAME) : '?'}
											</p>
											{recipientAddresses &&
											<p
												className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
											>
												<span>
													{getEncodedAddress(item, network)}
												</span>
												<span
													className='flex items-center gap-x-2 text-sm'
												>
													<button onClick={() => copyText(item, true, network)}><CopyIcon className='hover:text-primary'/></button>
													<a href={`https://${network}.subscan.io/account/${getEncodedAddress(item, network)}`} target='_blank' rel="noreferrer" >
														<ExternalLinkIcon />
													</a>
												</span>
											</p>}
										</div>
									</div>
									{recipientAddresses.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
								</>
							))}
						</div>
				}
				<div
					className='flex items-center justify-between gap-x-7 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
							From:
					</span>
					<AddressComponent address={from} />
				</div>
				<div
					className='flex items-center justify-between gap-x-5 mt-3'
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
				</div>
				{loading ? <Spin className='mt-3'/> : transactionDetails &&
				<>
					{!!transactionDetails.transactionFields && Object.keys(transactionDetails?.transactionFields).length !== 0 && transactionDetails.transactionFields.category !== 'none' &&
				<>
					<div
						className='flex items-center justify-between mt-3'
					>
						<span
							className='text-text_secondary font-normal text-sm leading-[15px]'
						>
							Category:
						</span>
						<span className='text-primary border border-solid border-primary rounded-xl px-[6px] py-1'>
							{transactionDetails?.transactionFields?.category}
						</span>
					</div>
					{transactionDetails?.transactionFields && transactionDetails?.transactionFields?.subfields && Object.keys(transactionDetails?.transactionFields?.subfields).map((key) => {
						const subfield = transactionDetails?.transactionFields?.subfields[key];
						return (
							<div
								key={key}
								className='flex items-center justify-between mt-3'
							>
								<span
									className='text-text_secondary font-normal text-sm leading-[15px]'
								>
									{subfield?.name}:
								</span>
								<span className='text-waiting bg-waiting bg-opacity-5 border border-solid border-waiting rounded-lg px-[6px] py-[3px]'>
									{subfield?.value}
								</span>
							</div>
						);})}
				</>}
					{transactionDetails?.note &&
					<div
						className='flex items-center justify-between gap-x-5 mt-3'
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
					</div>
					}
				</>
				}
				<p
					onClick={() => setShowDetails(prev => !prev)}
					className='text-primary cursor-pointer font-medium text-sm leading-[15px] mt-5 flex items-center gap-x-3'
				>
					<span>
						{showDetails ? 'Hide' : 'Advanced'} Details
					</span>
					<ArrowRightIcon />
				</p>
				{showDetails &&
				<>
					{callData &&
				<div
					className='flex items-center justify-between gap-x-5 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
							Call Data:
					</span>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span
							className='text-white font-normal text-sm leading-[15px]'
						>
							{shortenAddress(callData, 10)}
						</span>
						<span
							className='flex items-center gap-x-2 text-sm'
						>
							<button onClick={() => copyText(callData)}><CopyIcon/></button>
							{/* <ExternalLinkIcon /> */}
						</span>
					</p>
				</div>
					}
					<div
						className='flex items-center justify-between gap-x-5 mt-3'
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
					{callData && txnParams &&
					<>
						<Divider className='border-bg-secondary text-text_secondary my-5' orientation='left'>Decoded Call</Divider>
						<ArgumentsTable callData={callData} />
					</>
					}
				</>
				}
			</article>
			<article
				className='p-8 rounded-lg bg-bg-main max-w-[328px] w-full'
			>
				<div>
					<Timeline
						className='h-full flex flex-col'
					>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CirclePlusIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
							Created
							</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleCheckIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
							Confirmations <span className='text-text_secondary'>{threshold} of {threshold}</span>
							</div>
						</Timeline.Item>
						{!!approvals?.length &&
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleCheckIcon className='text-success text-sm' />
								</span>
							}
							className='success'
						>
							<Collapse bordered={false}>
								<Collapse.Panel
									showArrow={false}
									key={1}
									header={<span className='text-primary font-normal text-sm leading-[15px] px-3 py-2 rounded-md bg-highlight'>Show All Confirmations</span>}
								>
									<Timeline>
										{approvals.map((address, i) => (
											<Timeline.Item
												key={i}
												dot={
													<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
														<CircleCheckIcon className='text-success text-sm' />
													</span>
												}
												className={`${i == 0 && 'mt-4'} success bg-transaparent`}
											>
												<div
													className='mb-3 flex items-center gap-x-4'
												>
													<AddressComponent address={address} />
												</div>
											</Timeline.Item>
										))}

									</Timeline>
								</Collapse.Panel>
							</Collapse>
						</Timeline.Item>
						}
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
								<p>Executed</p>
							</div>
						</Timeline.Item>
					</Timeline>
				</div>
			</article>
		</div>
	);
};

export default styled(SentInfo)`
	.ant-collapse > .ant-collapse-item > .ant-collapse-header{
		padding: 4px 8px;
	}
    .ant-timeline-item-tail {
        border-inline-width: 0.5px !important;
    }
    .ant-timeline-item-last {
        padding: 0;
    }
    .ant-timeline-item:not(:first-child, :last-child) {
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .ant-timeline-item-content {
        display: flex;
        min-height: 24px !important;
        height: auto !important;
        align-items: center;
    }
    .success .ant-timeline-item-tail {
        border-inline-color: #06D6A0;
    }
    .warning .ant-timeline-item-tail {
        border-inline-color: #FF9F1C;
    }
`;