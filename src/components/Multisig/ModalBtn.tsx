// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { FC } from 'react';
import { OutlineCheckIcon } from 'src/ui-components/CustomIcons';

interface IModalBtnProps {
	title: string;
	onClick?: ()=>void;
	loading?: boolean
	disabled?: boolean
}

const ModalBtn: FC<IModalBtnProps> = ({ onClick, title, loading=false, disabled=false }) => {
	return (
		<Button icon={<OutlineCheckIcon />} loading={loading} disabled={disabled} onClick={onClick} size='large'
			className='w-[30%] border-none text-white text-sm font-normal bg-primary min-w-[120px]'
		>
			{title}
		</Button>
	);
};

export default ModalBtn;