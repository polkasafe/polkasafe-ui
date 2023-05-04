// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { useState } from 'react';
import ManageMultisig from 'src/components/Settings/ManageMultisig';
import Notifications from 'src/components/Settings/Notifications';

enum ETab {
	SIGNATORIES,
	NOTIFICATIONS
}

const Settings = () => {
	const [tab, setTab] = useState(ETab.SIGNATORIES);

	return (
		<div>
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
					{/* <QueueIcon /> */}
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
					{/* <HistoryIcon/> */}
						Notifications
				</button>
			</div>
			{
				tab === ETab.SIGNATORIES ?
					<ManageMultisig/>
					:
					<Notifications/>
			}
		</div>
	);
};

export default Settings;