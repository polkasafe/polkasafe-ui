// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { useState } from 'react';
import ManageMultisig from 'src/components/Settings/ManageMultisig';
import Notifications from 'src/components/Settings/Notifications';
import TransactionFields from 'src/components/Settings/TransactionFields';
import TwoFactorAuth from 'src/components/Settings/TwoFactorAuth';

enum ETab {
	SIGNATORIES,
	NOTIFICATIONS,
	TRANSACTIONS,
	ADMIN
}

const Settings = () => {
	const [tab, setTab] = useState(ETab.SIGNATORIES);

	return (
		<div className='scale-[80%] h-[125%] w-[125%] origin-top-left'>
			<div
				className='flex items-center mb-5'
			>
				<button
					onClick={() => setTab(ETab.SIGNATORIES)}
					className={classNames(
						'rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white',
						{
							'text-primary bg-highlight': tab === ETab.SIGNATORIES
						}
					)}
				>
						Signatories
				</button>
				<button
					onClick={() => setTab(ETab.NOTIFICATIONS)}
					className={classNames(
						'rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white',
						{
							'text-primary bg-highlight': tab === ETab.NOTIFICATIONS
						}
					)}
				>
						Notifications
				</button>
				<button
					onClick={() => setTab(ETab.TRANSACTIONS)}
					className={classNames(
						'rounded-lg p-3 text-sm leading-[15px] text-white',
						{
							'text-primary bg-highlight': tab === ETab.TRANSACTIONS
						}
					)}
				>
						Transaction Fields
				</button>
				<button
					onClick={() => setTab(ETab.ADMIN)}
					className={classNames(
						'rounded-lg p-3 text-sm leading-[15px] text-white flex items-center gap-x-2',
						{
							'text-primary bg-highlight': tab === ETab.ADMIN
						}
					)}
				>
					Admin <span className='bg-success text-bg-secondary text-xs py-[2px] px-2 rounded-lg'>New</span>
				</button>
			</div>
			{
				tab === ETab.SIGNATORIES ?
					<ManageMultisig/>
					:
					tab === ETab.NOTIFICATIONS ?
						<Notifications/>
						:
						tab === ETab.TRANSACTIONS ?
							<TransactionFields/>
							: <TwoFactorAuth />
			}
		</div>
	);
};

export default Settings;