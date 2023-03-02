// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, message } from 'antd';
import React, { FC, useState } from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';

interface IReceivedInfoProps {
	amount: string;
	amountType: string;
	date: string;
	// time: string;
}

const ReceivedInfo: FC<IReceivedInfoProps> = (props) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [address, setAddress] = useState('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLp');
	const { amount, amountType, date } = props;
	const handleCopy = () => {
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
				<img className='w-10 h-10 block' src={profileImg} alt="profile image" />
				<div
					className='flex flex-col gap-y-[6px]'
				>
					<p
						className='font-medium text-sm leading-[15px] text-white'
					>
								Akshit
					</p>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span>
							{address}
						</span>
						<span
							className='flex items-center gap-x-2 text-sm'
						>
							<button onClick={handleCopy}><CopyIcon className='hover:text-primary'/></button>
							<ExternalLinkIcon />
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
								0xfb92...ed36
					</span>
					<span
						className='flex items-center gap-x-2 text-sm'
					>
						<button onClick={handleCopy}><CopyIcon/></button>
						<ExternalLinkIcon />
					</span>
				</p>
			</div>
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
			</div>
		</article>
	);
};

export default ReceivedInfo;