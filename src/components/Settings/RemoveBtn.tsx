// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React from 'react';
import { DeleteIcon } from 'src/ui-components/CustomIcons';

const RemoveBtn = ({ loading, title, onClick }: { loading?: boolean, onClick?: () => void, title?: string }) => {
	return (
		<Button
			onClick={onClick}
			loading={loading}
			size='large'
			className='flex items-center border-none outline-none gap-x-[10.83px] text-white text-sm font-normal leading-[15px] bg-failure p-3 rounded-lg min-w-[120px] justify-center'
		>
			<span
				className='flex items-center justify-center'
			>
				<DeleteIcon className='text-sm' />
			</span>
			<span>
				{title ? title : 'Remove'}
			</span>
		</Button>
	);
};

export default RemoveBtn;