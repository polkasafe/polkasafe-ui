// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Tooltip as AntDTooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { CircleCheckIcon, NotificationIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

type Props = {
    address: string;
    onClick: (address: string) => Promise<void>;
    canNotificationSend: boolean;
};

const Tooltip = styled(AntDTooltip)`
    button {
        border: none;
    }
`;

export default function NotifyButton({
	address,
	onClick,
	canNotificationSend
}: Props) {
	const { network } = useGlobalApiContext();
	const [loading, setLoading] = useState<boolean>(true);
	const [showNotificationIcon, setShowNotificationIcon] =
        useState<boolean>(canNotificationSend);
	const [canSendNotification, setCanSendNotification] =
        useState<boolean>(false);

	useEffect(() => {
		const canSendReminder = async () => {
			const notificationPreferences = await fetch(
				`${FIREBASE_FUNCTIONS_URL}/getNotificationPreferencesForAddress`,
				{
					body: JSON.stringify({
						address: address
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				}
			);
			const { data } = await notificationPreferences.json();
			if (data && data?.triggerPreferences?.approvalReminder?.enabled) {
				setCanSendNotification(true);
			}
			setLoading(false);
		};
		canSendReminder();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClick = async () => {
		try {
			setLoading(true);
			await onClick(address);
			setLoading(false);
			setShowNotificationIcon(false);
		} catch (e) {
			setLoading(false);
		}
	};

	return !canSendNotification ? (
		<Tooltip
			title='User have not enabled approval reminders'
			className='p-[0px] pb-[2px]'
		>
			<Button
				disabled={!canSendNotification}
				className='flex absolute right-[-3.5rem] items-center justify-center text-white bg-highlight rounded-lg p-2.5 shadow-none text-sm outline-none border-none'
				loading={loading}
				icon={<NotificationIcon className='text-gray-900' />}
			/>
		</Tooltip>
	) : (
		<Button
			disabled={!showNotificationIcon}
			onClick={handleClick}
			className='flex absolute right-[-3.5rem] items-center justify-center outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-sm'
			loading={loading}
			icon={
				showNotificationIcon ? (
					<NotificationIcon />
				) : (
					<CircleCheckIcon className='text-success text-sm' />
				)
			}
		/>
	);
}
