// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { FC } from 'react';

import AddressDropdown from './AddressDropdown';

interface IAccountSelectionFormProps {
	accounts: InjectedAccount[]
	address: string
	onAccountChange: (address: string) => void
	title: string
}

const AccountSelectionForm: FC<IAccountSelectionFormProps> = (props) => {
	const { accounts, address, onAccountChange, title } = props;
	return (
		<article className='flex flex-col gap-y-3 w-[350px]'>
			<h3 className='text-primary font-normal text-sm leading-[13px]'>{title}</h3>
			<AddressDropdown
				accounts={accounts}
				defaultAddress={address}
				onAccountChange={onAccountChange}
			/>
		</article>
	);
};

export default AccountSelectionForm;