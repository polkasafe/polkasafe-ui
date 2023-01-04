// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Input } from 'antd';
import React from 'react';
import appsBG from 'src/assets/icons/apps-bg.svg';
import { NotifyMail } from 'src/ui-components/CustomIcons';

const Apps = () => {
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<div className='flex flex-col items-center justify-center'>
				<img src={appsBG} alt="bg"/>
				<h1 className="text-base text-primary m-5 font-bold">Cooking Our Apps.</h1>
				<p className='text-text_secondary'>We are going to launch Apps on <span className='text-primary'>PolkaSafe</span> very soon.</p>
				<p className='text-text_secondary m-1'>Stay Tuned.</p>
				<div className="flex items-center justify-around">
					<Input className= 'placeholder-text_placeholder text-white p-2 outline-none border-none min-w-[300px] mr-1' placeholder='name@example.com'></Input>
					<Button className='flex items-center justify-center bg-primary text-white border-none ml-1 py-4'><NotifyMail/>Notify me</Button>
				</div>
			</div>
		</div>
	);
};

export default Apps;