// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { CircleCheckIcon, NotificationIcon } from 'src/ui-components/CustomIcons';

type Props = {
    address:string;
    onClick:(address:string)=>Promise<void>
    canNotificationSend:boolean;
}

export default function LoadingButton({ address, onClick, canNotificationSend }: Props) {
	const [loading, setLoading] = useState<boolean>(false);
	const [showNotificationIcon, setShowNotificationIcon] = useState<boolean>(canNotificationSend);
	console.log(canNotificationSend);

	const handleClick = async () => {
		try{
			setLoading(true);
			await onClick(address);
			setLoading(false);
			setShowNotificationIcon(false);
		}
		catch(e){
			console.log(e);
			setLoading(false);
		}
	};
	return(<Button disabled={!showNotificationIcon} onClick={handleClick } className='flex absolute right-[-3.5rem] items-center justify-center outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-sm' loading={loading} icon={showNotificationIcon ? <NotificationIcon /> : <CircleCheckIcon className='text-success text-sm' />}/>);
}