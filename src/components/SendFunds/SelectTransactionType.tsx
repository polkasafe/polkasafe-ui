// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React from 'react';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';

import ModalBtn from '../Settings/ModalBtn';
import { ETransactionType } from './SendFundsForm';

const SelectTransactionType = ({ className, transactionType, setTransactionType, onContinue }: { className?: string, transactionType: ETransactionType, setTransactionType: React.Dispatch<React.SetStateAction<ETransactionType>>, onContinue: () => void }) => {

	const transactionTypes: ItemType[] = Object.values(ETransactionType).map((item) => ({
		key: item,
		label: <span className='text-white flex items-center gap-x-2'>{item}</span>
	}));
	return (
		<div className='w-[560px]'>
			<h2 className='font-semibold text-md leading-[22px] text-white mb-4'>
				Select Transaction Type
			</h2>
			<Dropdown
				trigger={['click']}
				className={`border border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer ${className}`}
				menu={{
					items: transactionTypes,
					onClick: (e) => setTransactionType(e.key as ETransactionType)
				}}
			>
				<div className="flex justify-between gap-x-4 items-center text-white text-[16px]">
					<span className='flex items-center gap-x-2'>
						{transactionType}
					</span>
					<CircleArrowDownIcon className='text-primary' />
				</div>
			</Dropdown>
			<div className='mt-[30px] w-full flex justify-center'>
				<ModalBtn className='' title='Continue' onClick={onContinue}  />
			</div>
		</div>
	);
};

export default SelectTransactionType;