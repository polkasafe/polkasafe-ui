// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { FC } from 'react';
import { OutlineCheckIcon } from 'src/ui-components/CustomIcons';

interface IModalBtnProps {
	title: string;
	className?: string;
	onClick?: () => void;
	loading?: boolean;
	disabled?: boolean;
}

const ModalBtn: FC<IModalBtnProps> = ({ className, disabled=false, title, loading=false, onClick }) => {
	return (
		<Button
			disabled={disabled}
			loading={loading}
			onClick={onClick}
			size='large'
			className={`${className} w-[30%] flex items-center justify-center gap-x-[10.83px] border-none outline-none text-sm ${disabled ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'} rounded-lg min-w-[120px]`}
		>
			<span
				className={`flex items-center justify-center p-2 border ${disabled ? 'border-text_secondary' : 'border-white'} rounded-full w-[14.33px] h-[14.33px]`}
			>
				<OutlineCheckIcon className='w-[8px] h-[8px]' />
			</span>
			<span>
				{title}
			</span>
		</Button>
	);
};

export default ModalBtn;