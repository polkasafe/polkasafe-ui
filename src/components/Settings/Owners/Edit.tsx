// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';
import AddBtn from 'src/components/Settings/AddBtn';
import CancelBtn from 'src/components/Settings/CancelBtn';

const EditOwner = () => {
	return (
		<Form
			className='my-0'
		>
			<div className="flex flex-col gap-y-3">
				<label
					className="text-primary text-xs leading-[13px] font-normal"
					htmlFor="name"
				>
                    Name
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
                    Address
				</label>
				<p
					className="text-sm font-normal m-0 leading-[15px] p-3 rounded-lg text-[#505050] border border-dashed border-[#505050]"
				>
                    3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
				</p>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn />
				<AddBtn title='Save' />
			</div>
		</Form>
	);
};

export default EditOwner;