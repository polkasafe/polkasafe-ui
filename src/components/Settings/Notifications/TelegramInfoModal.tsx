// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { CHANNEL } from 'src/types';
import { CopyIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import copyText from 'src/utils/copyText';

const TelegramInfoModal = ({ getVerifyToken }: { getVerifyToken: (channel: CHANNEL) => Promise<void>}) => {
	return (
		<div className='text-white'>
			<ol>
				<li className='list-inside leading-[40px]'>
                    Click this invite link
					<span className='p-2 mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'>
						<a href='https://t.me/PolkassemblyNotificationsBot' target='_blank' rel="noreferrer">t.me/PolkassemblyNotificationsBot</a>
					</span><br/>
                    or Add
					<span onClick={() => copyText('@PolkassemblyNotificationsBot')} className='p-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'>
						<CopyIcon/> @PolkassemblyNotificationsBot
					</span>
                    to your Telegram Chat as a member
				</li>
				<li className='list-inside leading-[35px] mb-5'>
                    Send this command to the chat with the bot:
					<div className='flex items-center justify-between'>
						<span onClick={() => copyText('/polkasafe/add <web3Address> <verificationToken>')} className='px-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'>
							<CopyIcon/> /polkasafe/add {'<web3Address>'} {'<verificationToken>'}
						</span>
						<PrimaryButton onClick={() => getVerifyToken(CHANNEL.TELEGRAM)} className='bg-primary text-white font-normal'>Generate Token</PrimaryButton>
					</div>
				</li>
				<li className='list-inside'>
                    (Optional) Send this command to get help:
					<span onClick={() => copyText('/start')} className='p-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'>
						<CopyIcon/> /start
					</span>
				</li>
			</ol>
			<section className='my-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
				<WarningCircleIcon />
				<p>Need help? Get support in the <span className='text-primary mx-1'><a>Den Discord Server</a></span> #support channel.</p>
			</section>
		</div>
	);
};

export default TelegramInfoModal;