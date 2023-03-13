// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import contactImg from 'src/assets/icons/contact-us.svg';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NotifyMail } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

const ContactUs = () => {
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const handleContactForm = async () => {
		try{
			setLoading(true);

			const contactFormRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addContactFormResponse`, {
				body: JSON.stringify({
					email,
					message,
					name
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});

			const { data: contactFormData, error: contactFormError } = await contactFormRes.json() as { data: any, error: string };

			if(contactFormError) {

				queueNotification({
					header: 'Error!',
					message: contactFormError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if(contactFormData){
				queueNotification({
					header: 'Success!',
					message: 'Message Sent!',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);

			}

		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<div className='bg-bg-main rounded-lg m-auto p-5 h-screen'>
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
								className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="email"
						>
							Email
						</label>
						<Form.Item
							name="email"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="name@example.com"
								className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="message"
						>
							Message
						</label>
						<Form.Item
							name="message"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input.TextArea
								placeholder="Go ahead...we are listening..."
								rows={6}
								className="text-sm font-normal leading-[15px] border-0 outline-0 mb-2 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="message"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
							/>
						</Form.Item>
					</div>
					<Button onClick={handleContactForm} loading={loading} size='large' className='bg-primary border-none outline-none flex items-center justify-center text-white text-sm py-1 mt-3 w-[100%]'><NotifyMail/>Send Message</Button>
				</Form>
				<div className='items-center justify-center flex flex-1'><img src={contactImg} alt="bg"/></div>
			</div>
		</div>
	);
};

export default ContactUs;
