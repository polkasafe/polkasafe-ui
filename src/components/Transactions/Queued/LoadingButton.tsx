// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { CircleCheckIcon, NotificationIcon } from 'src/ui-components/CustomIcons';

type Props = {
    address:string;
    onClick:(address:string)=>Promise<void>
    timeDifferent:number | undefined
}

export default function LoadingButton({ address, onClick, timeDifferent }: Props) {
	const [loading, setLoading] = useState<boolean>(false);
	const [showButton, setShowButton] = useState(timeDifferent === undefined ? true : timeDifferent > 0 ? true : false);
	const [changeIcon, setChangeIcon] = useState<boolean>(false);

	const handleClick = async () => {
		try{
			setLoading(true);
			await onClick(address);
			setLoading(false);
			setChangeIcon(true);
			setTimeout(() => {
				setShowButton(false);
			}, 2000);
		}
		catch(e){
			console.log(e);
			setLoading(false);
		}
	};
	return showButton ? (
		<Button onClick={handleClick } className='flex absolute right-[-3.5rem] items-center justify-center outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-sm' loading={loading} icon={changeIcon ? <CircleCheckIcon className='text-success text-sm' /> :<NotificationIcon />}/>
	): <></>;
}