// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';

interface ICancelBtnProps {}

const CancelBtn: FC<ICancelBtnProps> = () => {
	return (
		<button
			className='flex items-center gap-x-[10.83px] text-failure text-sm font-normal leading-[15px] bg-failure bg-opacity-10 p-3 rounded-lg min-w-[120px] justify-center'
		>
			<span
				className='flex items-center justify-center p-2 border border-failure rounded-full w-[14.33px] h-[14.33px]'
			>
				<OutlineCloseIcon className='w-[5px] h-[5px]' />
			</span>
			<span>
                Cancel
			</span>
		</button>
	);
};

export default CancelBtn;