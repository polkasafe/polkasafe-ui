// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Input } from 'antd';
import React from 'react';

const AddAddressForm: React.FC = () => {
	const onFinish = (values: any) => {
		console.log('Success:', values);
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log('Failed:', errorInfo);
	};

	return (
		<div className='absolute top-0 right-0 bg-white p-3 m-3 shadow-md border-2 border-blue_primary rounded-lg'>
			<p className='text-blue_primary font-bold text-center mb-3 mt-1'>
				Add New Address
			</p>
			<Form
				name="basic"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				initialValues={{ remember: true }}
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				autoComplete="off"
			>
				<Form.Item
					name="address"
				>
					<Input placeholder='Address' />
				</Form.Item>

				<Form.Item
					name="chain"
				>
					<Input placeholder='Chain' />
				</Form.Item>

				<Form.Item
					name="name"
				>
					<Input placeholder='Name' />
				</Form.Item>

				<Form.Item wrapperCol={{ offset: 8, span: 8 }}>
					<Button className='bg-blue_primary' type="primary" htmlType="submit">
						Submit
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};

export default AddAddressForm;