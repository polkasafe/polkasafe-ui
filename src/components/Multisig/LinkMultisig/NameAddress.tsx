// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';
import { CheckOutlined } from 'src/ui-components/CustomIcons';

import Loader from '../../UserFlow/Loader';

interface Props {
	multisigAddress: string,
	setMultisigAddress: React.Dispatch<React.SetStateAction<string>>
	multisigName: string
	setMultisigName: React.Dispatch<React.SetStateAction<string>>
}

const NameAddress = ({ multisigAddress, setMultisigAddress, multisigName, setMultisigName }: Props) => {
	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className="flex justify-around items-center mb-10 w-full">
					<div className='flex flex-col items-center text-white justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p>Select Network</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Name & Address</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div>
					<Form
						className='my-0 w-[560px] mt-10'
					>
						<div className="flex flex-col gap-y-3">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="name"
							>
                    Safe Name
							</label>
							<Form.Item
								name="name"
								rules={[]}
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder="my-polka-safe"
									className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 text-white placeholder:text-[#505050] bg-bg-secondary rounded-lg"
									id="name"
									value={multisigName}
									onChange={(e) => setMultisigName(e.target.value)}
								/>
							</Form.Item>
						</div>
						<div className="flex flex-col gap-y-3 mt-5">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="address"
							>
                    Safe Address*
							</label>
							<Form.Item
								name="Address"
								rules={[{ required: true }]}
								className='border-0 outline-0 my-0 p-0'
								status={!multisigAddress ? 'error' : 'success'}
							>
								<Input
									onChange={(e) => setMultisigAddress(e.target.value)}
									value={multisigAddress}
									placeholder="Unique Safe Address"
									className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
									id="Address"
								/>
							</Form.Item>
						</div>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default NameAddress;
