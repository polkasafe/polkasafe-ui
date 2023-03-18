// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Button, Collapse, Divider, Input, Timeline } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { chainProperties } from 'src/global/networkConstants';
import { ArrowRightIcon, Circle3DotsIcon, CircleCheckIcon, CirclePlusIcon, CircleWatchIcon,CopyIcon, EditIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import { getMultisigInfo } from 'src/utils/getMultisigInfo';
import parseDecodedValue from 'src/utils/parseDecodedValue';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

import EditNote from './EditNote';

interface ISentInfoProps {
	amount: string;
	amountUSD: string;
	date: string;
	// time: string;
	loading: boolean
    approvals: string[]
    threshold: number
    className?: string;
	callHash: string;
	callData: string;
	callDataString: string;
	recipientAddress?: string;
	setCallDataString: React.Dispatch<React.SetStateAction<string>>
	handleApproveTransaction: () => Promise<void>
	handleCancelTransaction: () => Promise<void>
	note: string
}

const SentInfo: FC<ISentInfoProps> = ({ note, amount, amountUSD, className, callData, callDataString, callHash, recipientAddress, date, approvals, loading, threshold, setCallDataString, handleApproveTransaction, handleCancelTransaction }) => {
	const { api, apiReady, network } = useGlobalApiContext();

	const { address, addressBook, multisigAddresses, activeMultisig } = useGlobalUserDetailsContext();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const { openModal } = useModalContext();
	const activeMultisigObject = multisigAddresses.find((item) => item.address === activeMultisig);

	const [updatedNote, setUpdatedNote] = useState(note);
	const [depositor, setDepositor] = useState<string>('');

	useEffect(() => {
		const getDepositor = async () => {
			if(!api || !apiReady) return;
			const multisigInfos = await getMultisigInfo(activeMultisig, api);
			const [, multisigInfo] = multisigInfos?.find(([h]) => h.eq(callHash)) || [null, null];
			setDepositor(multisigInfo?.depositor?.toString() || '');
		};
		getDepositor();
	}, [activeMultisig, api, apiReady, callHash]);

	return (
		<div
			className={classNames('flex gap-x-4', className)}
		>
			<article
				className='p-4 rounded-lg bg-bg-main flex-1'
			>
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
						}) : `? ${chainProperties[network].tokenSymbol}`} {!isNaN(Number(amountUSD)) && amount && <span>({(Number(amountUSD) * Number(parseDecodedValue({
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
					{recipientAddress && <Identicon size={30} theme='polkadot' value={recipientAddress} />}
					<div
						className='flex flex-col gap-y-[6px]'
					>
						<p
							className='font-medium text-sm leading-[15px] text-white'
						>
							{recipientAddress ? (addressBook.find((item) => item.address === recipientAddress)?.name || DEFAULT_ADDRESS_NAME) : '?'}
						</p>
						{recipientAddress &&
						<p
							className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
						>
							<span>
								{getEncodedAddress(recipientAddress, network)}
							</span>
							<span
								className='flex items-center gap-x-2 text-sm'
							>
								<button onClick={() => copyText(recipientAddress, true, network)}><CopyIcon className='hover:text-primary'/></button>
								<a href={`https://${network}.subscan.io/account/${getEncodedAddress(recipientAddress, network)}`} target='_blank' rel="noreferrer" >
									<ExternalLinkIcon />
								</a>
							</span>
						</p>}
					</div>
				</div>
				<Divider className='bg-text_secondary my-5' />
				<div
					className='flex items-center justify-between gap-x-5 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
							Created at:
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
				<div
					className='flex items-center justify-between gap-x-5 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
							Note:
					</span>
					<span
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						{updatedNote ?
							<span className='text-white font-normal flex items-center flex-wrap gap-x-3'>
								{updatedNote}
								<button onClick={() => openModal('Edit Note', <EditNote note={updatedNote} callHash={callHash} setUpdatedNote={setUpdatedNote} />)}>
									<EditIcon className='text-primary cursor-pointer' />
								</button>
							</span> :
							<button onClick={() => openModal('Add Note', <EditNote note={''} callHash={callHash} setUpdatedNote={setUpdatedNote} />)}>
								<EditIcon className='text-primary cursor-pointer' />
							</button>}
					</span>
				</div>
				{showDetails &&
				<>
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
								{callHash}
							</span>
							<span
								className='flex items-center gap-x-2 text-sm'
							>
								<button onClick={() => copyText(callHash)}><CopyIcon className='hover:text-primary'/></button>
								{/* <ExternalLinkIcon /> */}
							</span>
						</p>
					</div>
					{callData && <div className='flex items-center justify-between gap-x-5 mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Call Data:</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<span className='text-white font-normal text-sm leading-[15px]'> {callData}</span>
							<span className='flex items-center gap-x-2 text-sm'>
								<button onClick={() => copyText(callData)}><CopyIcon className='hover:text-primary'/></button>
							</span>
						</p>
					</div>}
				</>}
				{/* <div
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
				</div> */}
				<p
					className='text-primary cursor-pointer font-medium text-sm leading-[15px] mt-5 flex items-center gap-x-3'
				>
					<span onClick={() => setShowDetails(prev => !prev)}>
						{showDetails ? 'Hide' : 'Advanced'} Details
					</span>
					<ArrowRightIcon />
				</p>
			</article>
			<article
				className='p-8 rounded-lg bg-bg-main max-w-[328px] w-full'
			>
				<div>
					<Timeline
						className=''
					>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CirclePlusIcon className='text-success text-sm' />
								</span>
							}
							className='success'
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
							className='success'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
                                Confirmations <span className='text-text_secondary'>{approvals.length} of {threshold}</span>
							</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<Circle3DotsIcon className='text-success text-sm' />
								</span>
							}
							className='success'
						>
							<Collapse bordered={false}>
								<Collapse.Panel
									showArrow={false}
									key={1}
									className='bg-highlight rounded-md'
									header={<span className='text-primary font-normal text-sm leading-[15px]'>Show All Confirmations</span>}
								>
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
												<Identicon
													value={address}
													size={30}
													theme='polkadot'
												/>
												<div
													className='flex flex-col gap-y-[6px]'
												>
													<p
														className='font-medium text-sm leading-[15px] text-white'
													>
														{addressBook.find((item) => item.address === address)?.name || DEFAULT_ADDRESS_NAME}
													</p>
													<p
														className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
													>
														<span>
															{shortenAddress(getEncodedAddress(address, network) || '')}
														</span>
														<span
															className='flex items-center gap-x-2 text-sm'
														>
															<button onClick={() => copyText(address, true, network)}><CopyIcon className='hover:text-primary'/></button>
															<a href={`https://${network}.subscan.io/account/${getEncodedAddress(address, network)}`} target='_blank' rel="noreferrer" >
																<ExternalLinkIcon  />
															</a>
														</span>
													</p>
												</div>
											</div>
										</Timeline.Item>
									))}

									{activeMultisigObject?.signatories.filter((item) => !approvals.includes(item)).map((address, i) => (
										<Timeline.Item
											key={i}
											dot={
												<span className='bg-waiting bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
													<CircleWatchIcon className='text-waiting text-sm' />
												</span>
											}
											className='warning bg-transaparent'
										>
											<div
												className='mb-3 flex items-center gap-x-4'
											>
												<Identicon
													value={address}
													size={30}
													theme='polkadot'
												/>
												<div
													className='flex flex-col gap-y-[6px]'
												>
													<p
														className='font-medium text-sm leading-[15px] text-white'
													>
														{addressBook.find((item) => item.address === address)?.name || DEFAULT_ADDRESS_NAME}
													</p>
													<p
														className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
													>
														<span>
															{shortenAddress(getEncodedAddress(address, network) || '')}
														</span>
														<span
															className='flex items-center gap-x-2 text-sm'
														>
															<button onClick={() => copyText(address, true, network)}><CopyIcon className='hover:text-primary'/></button>
															<a href={`https://${network}.subscan.io/account/${getEncodedAddress(address, network)}`} target='_blank' rel="noreferrer" >
																<ExternalLinkIcon  />
															</a>
														</span>
													</p>
												</div>
											</div>
										</Timeline.Item>
									))}
								</Collapse.Panel>
							</Collapse>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-waiting bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-waiting text-sm' />
								</span>
							}
							className='warning'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
								<p>Executed</p>
								<div
									className='mt-3 text-text_secondary'
								>
									The transaction will be executed once the threshold is reached.
								</div>
							</div>
						</Timeline.Item>
					</Timeline>
					{(approvals.length === threshold - 1 && !callData) && <Input size='large' placeholder='Enter Call Data.' className='w-full my-3 text-sm font-normal leading-[15px] border-0 outline-0 placeholder:text-[#505050] bg-bg-secondary rounded-md text-white' onChange={(e) => setCallDataString(e.target.value)} />}
					<div className='w-full flex flex-col gap-y-2 items-center'>
						<Button disabled={approvals.includes(address) || (approvals.length === threshold - 1 && !callDataString)} loading={loading} onClick={handleApproveTransaction} className='w-full border-none text-white text-sm font-normal bg-primary'>
								Approve Transaction
						</Button>
						{depositor === address &&
							<Button loading={loading} onClick={handleCancelTransaction} className='w-full border-none text-white text-sm font-normal bg-failure'>
								Cancel Transaction
							</Button>
						}
					</div>
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