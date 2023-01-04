// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React, { useState } from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';

const AddOwner = () => {
	const { toggleVisibility } = useModalContext();
	const [confirmations, setConfirmations] = useState(2);
	return (
		<Form
			className='my-0'
		>
			<div className="flex flex-col gap-y-3">
				<label
					className="text-primary text-xs leading-[13px] font-normal"
					htmlFor="name"
				>
                    Owner Name <sup>*</sup>
				</label>
				<Form.Item
					name="name"
					rules={[]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder="Give the address a name"
						className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
						id="name"
					/>
				</Form.Item>
			</div>
			<div className="flex flex-col gap-y-3 mt-5">
				<label
					className="text-primary text-xs leading-[13px] font-normal"
					htmlFor="address"
				>
                    Owner Address <sup>*</sup>
				</label>
				<Form.Item
					name="address"
					rules={[]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder="Unique Address"
						className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
						id="address"
					/>
				</Form.Item>
			</div>
			<div className="flex flex-col gap-y-3 mt-5">
				<label
					className="text-primary text-xs leading-[13px] font-normal"
					htmlFor="address"
				>
                    Required Confirmations
				</label>
				<div
					className='flex items-center gap-x-3'
				>
					<p
						className='flex items-center justify-center gap-x-[16.83px] p-[12.83px] bg-bg-secondary rounded-lg'
					>
						<button
							onClick={() => {
								if (confirmations !== 0) {
									setConfirmations(confirmations - 1);
								}
							}}
							className='text-primary border rounded-full flex items-center justify-center border-primary w-[14.5px] h-[14.5px]'>
							-
						</button>
						<span
							className='text-white text-sm'
						>
							{confirmations}
						</span>
						<button
							onClick={() => {
								if (confirmations < 3) {
									setConfirmations(confirmations + 1);
								}
							}}
							className='text-primary border rounded-full flex items-center justify-center border-primary w-[14.5px] h-[14.5px]'>
							+
						</button>
					</p>
					<p
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
						out of <span className='text-white font-medium'>{3}</span> owners
					</p>
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<AddBtn title='Add' />
			</div>
		</Form>
	);
};

export default AddOwner;