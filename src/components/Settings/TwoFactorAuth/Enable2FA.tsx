// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, Input, Modal, QRCode } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IGenerate2FAResponse, IUser, NotificationStatus } from 'src/types';
import { CopyIcon, OutlineCloseIcon, PasswordFilledIcon, PasswordOutlinedIcon } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import queueNotification from 'src/ui-components/QueueNotification';
import copyText from 'src/utils/copyText';

import CancelBtn from '../CancelBtn';
import ModalBtn from '../ModalBtn';

const Enable2FA = ({ className }: { className?: string }) => {

	const [loading, setLoading] = useState<boolean>(false);

	const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);

	const { two_factor_auth, address, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [showModal, setShowModal] = useState<boolean>(false);

	const [tFaSecret, setTFaSecret] = useState<IGenerate2FAResponse>();

	const [authCode, setAuthCode] = useState<number>();

	const handleModalOpen = async () => {
		setShowModal(true);
		await fetch2FASecret();
	};

	const handleVerifyTFA = async () => {
		// don't submit if loading or if user is already 2FA enabled
		if(loading || !address || two_factor_auth?.enabled) return;

		setLoading(true);
		try {
			if(!authCode || isNaN(authCode)) throw new Error('Please input a valid auth code');

			// send as string just in case it starts with 0
			const generate2FaRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/verify2FA`, {
				body: JSON.stringify({
					authCode: Number(authCode)
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: verify2FAData, error: verify2FAError } = await generate2FaRes.json() as { data: IUser, error: string };

			if (verify2FAError || !verify2FAData) {
				setLoading(false);
				queueNotification({
					header: 'Failed',
					message: verify2FAError,
					status: NotificationStatus.ERROR
				});
				return;
			}

			setUserDetailsContextState(prevState => {
				return {
					...prevState,
					two_factor_auth: verify2FAData.two_factor_auth
				};
			});

			queueNotification({
				header: 'Success',
				message: 'Two factor authentication enabled successfully!',
				status: NotificationStatus.SUCCESS
			});

			setShowModal(false);

		} catch (error) {
			setLoading(false);
			queueNotification({
				header: 'Failed',
				message: error,
				status: NotificationStatus.ERROR
			});
			return;
		}
	};

	const fetch2FASecret = async () => {
		// don't submit if loading or if user is already 2FA enabled
		if(loading || !address || two_factor_auth?.enabled) return;

		setQrCodeLoading(true);
		const generate2FaRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/generate2FASecret`, {
			headers: firebaseFunctionsHeader(network),
			method: 'POST'
		});

		const { data: generate2FaData, error: generate2FaError } = await generate2FaRes.json() as { data: IGenerate2FAResponse, error: string };

		console.log(generate2FaData);
		if (generate2FaError || !generate2FaData || !generate2FaData.base32_secret || !generate2FaData.url) {
			queueNotification({
				header: 'Failed!',
				message: generate2FaError,
				status: NotificationStatus.ERROR
			});
			console.error('2FA error : ', generate2FaError);
			return;
		}

		setTFaSecret(generate2FaData);
		setQrCodeLoading(false);
	};

	return (
		<>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setShowModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>Two Factor Authentication</h3>}
				open={showModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<section className='flex flex-col'>
					{/* Instructions for Google Auth */}
					<article>
						<h2 className='text-base text-white mb-2'>Configuring Google Authenticator</h2>

						<ol className='ml-4 text-white'>
							<li className='mb-1'>Install Google Authenticator (iOS/Android).</li>
							<li className='mb-1'>In the authenticator app, select the &quot;+&quot; icon.</li>
							<li className='mb-1'>Select &quot;Scan a QR code&quot; and use the phone&apos;s camera to scan this QR code.</li>
						</ol>
					</article>

					{qrCodeLoading ? <div className='mt-2'><Loader/></div> :
						<>
							{/* QR Code */}
							<div className='mt-3'>
								<h2 className='text-base text-white'>Scan the QR Code</h2>

								{tFaSecret?.url && <QRCode
									size={200}
									className='mx-auto'
									errorLevel="H"
									value={tFaSecret.url}
									style={{ backgroundColor: '#fff' }}
								/>}
							</div>

							{/* Secret Key code */}
							<article className='mt-4'>
								<h2 className='text-base text-white mb-2'>Or Enter the Code to Your App (base32 encoded) :</h2>
								{tFaSecret?.base32_secret &&
                        <span onClick={() => copyText(tFaSecret?.base32_secret)} className='p-2 cursor-pointer rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'><CopyIcon/> {tFaSecret.base32_secret}</span>
								}
							</article>
						</>}

					{/* Code Input */}
					<div className='mt-6 mb-4'>
						<h2 className='text-base text-white mb-2'>Verify Code</h2>
						<p className='text-white mb-1'>Please input the authentication code :</p>

						<Form.Item
							name="authcode"
							rules={[
								{
									message: 'Required',
									required: true
								}
							]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Auth Code"
								className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="authcode"
								onChange={(e) => setAuthCode(Number(e.target.value))}
								value={authCode}
								disabled={loading || qrCodeLoading}
							/>
						</Form.Item>
						<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
							<CancelBtn onClick={() => setShowModal(false)}/>
							<ModalBtn loading={loading} disabled={!authCode || isNaN(authCode) || qrCodeLoading} title='Enable' onClick={handleVerifyTFA} />
						</div>
					</div>
				</section>
			</Modal>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-5 text-white'>
				<div className='col-span-3 flex gap-x-2'>
					<div>
						<span className='flex items-center gap-x-2 text-text_secondary'><PasswordOutlinedIcon />Two-Factor Authentication</span>
					</div>
				</div>
				<div className='col-span-5'>
					<p className='text-text_secondary'>
                        Enhance account security with two factor authentication. Verify your identity with an extra step for added protection.
					</p>
					<Button onClick={handleModalOpen} icon={<PasswordFilledIcon />} className='flex items-center p-0 outline-none border-none bg-transparant text-primary'>Enable Two-Factor Authentication</Button>
				</div>
			</div>
		</>
	);
};

export default Enable2FA;