// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AutoComplete, Form } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { useEffect, useState } from 'react';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

import AddressComponent from './AddressComponent';
import { CopyIcon } from './CustomIcons';

interface IAddressInput {
    onChange: (address: string) => void
    placeholder?: string
}

const AddressInput = ({ onChange, placeholder }: IAddressInput) => {
	const { network } = useGlobalApiContext();

	const [selectedAddress, setSelectedAddress] = useState<string>('');
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>([]);
	const [isValidAddress, setIsValidAddress] = useState(true);
	const { addressBook } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();

	useEffect(() => {
		if(selectedAddress && !getSubstrateAddress(selectedAddress)){
			setIsValidAddress(false);
		}
		else{
			setIsValidAddress(true);
		}
	}, [selectedAddress]);

	useEffect(() => {
		const allAddresses: string[] = [];
		if(records){
			Object.keys(records).forEach((address) => {
				allAddresses.push(getEncodedAddress(address, network) || address);
			});
		}
		addressBook.forEach(item => {
			if(!allAddresses.includes(getEncodedAddress(item.address, network) || item.address)){
				allAddresses.push(item.address);
			}
		});
		setAutoCompleteAddresses(allAddresses.map(address => ({
			label: <AddressComponent address={address} />,
			value: address
		})));

	}, [addressBook, network, records]);

	return (
		<div className='w-full'>
			<Form.Item
				name="sender"
				rules={[{ required: true }]}
				help={!isValidAddress && 'Please add a valid Address.'}
				className='border-0 outline-0 my-0 p-0'
				validateStatus={selectedAddress && isValidAddress ? 'success' : 'error'}
			>
				<div className="flex items-center">
					<AutoComplete
						filterOption={true}
						options={autocompleteAddresses}
						id='sender'
						placeholder={placeholder || 'Select Address'}
						onChange={(value) => {setSelectedAddress(value); onChange(value);}}
					/>
					{selectedAddress &&
					<div className='absolute right-2'>
						<button onClick={() => copyText(selectedAddress, true, network)}>
							<CopyIcon className='mr-2 text-primary' />
						</button>
					</div>
					}
				</div>
			</Form.Item>
		</div>
	);
};

export default AddressInput;