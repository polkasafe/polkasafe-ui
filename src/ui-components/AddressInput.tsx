// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AutoComplete, Form } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { useEffect, useState } from 'react';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

import AddressComponent from './AddressComponent';
import { OutlineCloseIcon } from './CustomIcons';

interface IAddressInput {
    onChange: (address: string) => void
    placeholder?: string
	defaultAddress?: string
}

const AddressInput = ({ onChange, placeholder, defaultAddress }: IAddressInput) => {
	const { network } = useGlobalApiContext();

	const [selectedAddress, setSelectedAddress] = useState<string>(defaultAddress ||'');
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
					{selectedAddress && autocompleteAddresses.some((item) => item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(selectedAddress)) ? <div className='border border-solid border-primary rounded-lg p-2 h-full flex justify-between items-center w-full'>
						{autocompleteAddresses.find((item) => item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(selectedAddress))?.label}
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
							onClick={() => {
								setSelectedAddress('');
								onChange('');
							}}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>
					</div> :
						<AutoComplete
							filterOption={true}
							defaultOpen
							options={autocompleteAddresses}
							id='sender'
							placeholder={placeholder || 'Select Address'}
							onChange={(value) => {setSelectedAddress(value); onChange(value);}}
						/>
					}
				</div>
			</Form.Item>
		</div>
	);
};

export default AddressInput;