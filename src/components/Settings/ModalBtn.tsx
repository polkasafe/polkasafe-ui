// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC } from 'react';
import { OutlineCheckIcon } from 'src/ui-components/CustomIcons';

interface IModalBtnProps {
    title: string;
	className?: string;
}

const ModalBtn: FC<IModalBtnProps> = ({ className, title }) => {
	return (
		<button
			className={classNames('flex items-center gap-x-[10.83px] text-white text-sm font-normal leading-[15px] bg-primary p-3 rounded-lg min-w-[120px] justify-center', className)}
		>
			<span
				className='flex items-center justify-center p-2 border border-white rounded-full w-[14.33px] h-[14.33px] text-white'
			>
				<OutlineCheckIcon className='w-[8px] h-[8px]' />
			</span>
			<span>
				{title}
			</span>
		</button>
	);
};

export default ModalBtn;