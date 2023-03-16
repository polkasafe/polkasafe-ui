// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Divider, Spin, Timeline } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { CircleCheckIcon, CirclePlusIcon, CircleWatchIcon, CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import styled from 'styled-components';

interface ISentInfoProps {
	amount: string;
	amountType: string;
	date: string;
	// time: string;
    className?: string;
	recipient: string
	callHash: string
	note?: string
	loading?: boolean
	amount_usd: number
}

const SentInfo: FC<ISentInfoProps> = ({ amount, amount_usd, amountType, className, date, recipient, callHash, note, loading }) => {
	const { addressBook, activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const threshold = multisigAddresses.find((item) => item.address === activeMultisig)?.threshold || 0;

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
						{amount} {amountType} ({amount_usd} USD)
					</span>
					<span>
							to:
					</span>
				</p>
				<div
					className='mt-3 flex items-center gap-x-4'
				>
					<Identicon size={30} value={recipient} theme='polkadot'  />
					<div
						className='flex flex-col gap-y-[6px]'
					>
						<p
							className='font-medium text-sm leading-[15px] text-white'
						>
							{addressBook.find((item) => item.address === recipient)?.name || DEFAULT_ADDRESS_NAME}
						</p>
						<p
							className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
						>
							<span>
								{getEncodedAddress(recipient, network)}
							</span>
							<span
								className='flex items-center gap-x-2 text-sm'
							>
								<button onClick={() => copyText(recipient, true, network)}><CopyIcon className='hover:text-primary'/></button>
								<a href={`https://${network}.subscan.io/account/${getEncodedAddress(recipient, network)}`} target='_blank' rel="noreferrer" >
									<ExternalLinkIcon />
								</a>
							</span>
						</p>
					</div>
				</div>
				<Divider className='bg-text_secondary my-5' />
				<div
					className='flex items-center justify-between gap-x-5'
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
							<button onClick={() => copyText(callHash)}><CopyIcon/></button>
							{/* <ExternalLinkIcon /> */}
						</span>
					</p>
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
				{loading ? <Spin className='mt-3'/> : note &&
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
								className='text-white font-normal text-sm leading-[15px]'
							>
								{note}
							</span>
						</p>
					</div>
				}
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
							Confirmations <span className='text-text_secondary'>{threshold} of {threshold}</span>
							</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-success text-sm' />
								</span>
							}
							className='success'
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