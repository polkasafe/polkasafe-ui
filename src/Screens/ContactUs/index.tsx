// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';
import contactImg from 'src/assets/icons/contact-us.svg';
import { NotifyMail } from 'src/ui-components/CustomIcons';

const ContactUs = () => {
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto p-5 overflow-auto'>
			<h1 className='font-bold text-xl text-white ml-[1rem]'>Get in Touch</h1>
			<p className='text-sm text-text_secondary mt-1 mb-3 ml-[1rem]'>We are here for you! How can we help?</p>
			<div className='flex items-center justify-between ml-[1rem]'>
				<Form
					className='my-1 w-[560px]'
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
                    Email
						</label>
						<Form.Item
							name="address"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="name@example.com"
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
                    Message
						</label>
						<Form.Item
							name="address"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<TextArea
								placeholder="Go ahead...we are listening..."
								rows={2}
								className="text-sm h-[170px] font-normal leading-[15px] border-0 outline-0 mb-2 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
								id="address"
							/>
						</Form.Item>
					</div>
					<Button className='bg-primary flex items-center justify-center text-white text-sm py-1 mt-3 w-[100%]'><NotifyMail/>Send Message</Button>
				</Form>
				<div className='items-center justify-center flex flex-1'><img src={contactImg} alt="bg"/></div>
			</div>
		</div>
	);
};

export default ContactUs;
