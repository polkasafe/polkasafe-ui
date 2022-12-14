// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { FC } from 'react';

interface IBtn{
    title?: string;
}

const Btn: FC<IBtn> = ({ title }) => {
	return (
		<Button className='flex items-center border-none outline-none rounded-lg bg-green_primary text-white font-medium text-base md:font-bold md:text-lg'>
			{title}
		</Button>
	);
};

export default Btn;