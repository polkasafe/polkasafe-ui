// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown, Form, Input, Spin, Switch } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { EFieldType, NotificationStatus } from 'src/types';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

const AddCustomField = ({ className, onCancel }: { className?: string, onCancel: () => void }) => {
	const [loading, setLoading] = useState(false);

	const [fieldName, setFieldName] = useState<string>('');
	const [fieldDesc, setFieldDesc] = useState<string>('');
	const [fieldType, setFieldType] = useState<EFieldType>(EFieldType.SINGLE_SELECT);
	const [required, setRequired] = useState<boolean>(true);
	const { network } = useGlobalApiContext();
	const { setUserDetailsContextState, transactionFields } = useGlobalUserDetailsContext();

	const fieldTypeOptions: ItemType[] = Object.values(EFieldType).map((key) => ({
		key: key,
		label: <span className='text-white'>{key}</span>
	}));

	const handleSave = async () => {

		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{
				setLoading(true);

				const updateTransactionFieldsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransactionFields`, {
					body: JSON.stringify({
						transactionFields:{
							...transactionFields,
							[fieldName.toLowerCase().split(' ').join('_')]: {
								fieldDesc,
								fieldName,
								fieldType,
								required
							}
						}
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: updateTransactionFieldsData, error: updateTransactionFieldsError } = await updateTransactionFieldsRes.json() as { data: string, error: string };

				if(updateTransactionFieldsError) {
					queueNotification({
						header: 'Failed!',
						message: updateTransactionFieldsError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(updateTransactionFieldsData){
					queueNotification({
						header: 'Success!',
						message: 'Verification Email Sent.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[fieldName.toLowerCase().split(' ').join('_')]: {
								fieldDesc,
								fieldName,
								fieldType,
								required
							}
						}
					}));
					setLoading(false);
					onCancel();
				}

			}
		} catch (error){
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return (
		<>
			<Spin spinning={loading} indicator={<LoadingLottie width={300} message={`Updating your ${fieldName} field...`} /> }>
				<div className={className}>
					<Form disabled={ loading }>

						<div className="flex flex-col gap-y-3 mb-4">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="name"
							>
							Field Name*
							</label>
							<Form.Item
								name="name"
								rules={[
									{
										message: 'Required',
										required: true
									}
								]}
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder="Give the address a name"
									className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
									id="name"
									onChange={(e) => setFieldName(e.target.value)}
									value={fieldName}
								/>
							</Form.Item>
						</div>
						<div className="flex flex-col gap-y-3 mb-4">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="description"
							>
							Field Description*
							</label>
							<Form.Item
								name="description"
								rules={[
									{
										message: 'Required',
										required: true
									}
								]}
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder="Give the address a name"
									className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
									id="description"
									onChange={(e) => setFieldDesc(e.target.value)}
									value={fieldDesc}
								/>
							</Form.Item>
						</div>

						<div className='flex flex-col gap-y-3 mb-4'>
							<p className='text-primary font-normal text-xs leading-[13px]'>Field Type</p>
							<Dropdown
								trigger={['click']}
								className={`border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer ${className}`}
								menu={{
									items: fieldTypeOptions,
									onClick: (e) => {
										setFieldType(e.key as any);
									}
								}}
							>
								<div className="flex justify-between items-center text-white">
									{fieldType}
									<CircleArrowDownIcon className='text-primary' />
								</div>
							</Dropdown>
						</div>

						<div className='mb-4 flex items-center gap-x-2'>
							<p className='text-primary font-normal text-xs leading-[13px]'>Required</p>
							<Switch size='small' className='w-auto' checked={required} onChange={(checked) => setRequired(checked)} />
						</div>

						<section className='flex items-center gap-x-5 justify-between mt-10'>
							<CancelBtn loading={loading} className='w-[200px]' onClick={onCancel} />
							<ModalBtn disabled={!fieldName || !fieldType} loading={loading} onClick={handleSave} className='w-[200px]' title='Save' />
						</section>
					</Form>
				</div>
			</Spin>
		</>
	);
};

export default styled(AddCustomField)`
	.ant-select input {
		font-size: 14px !important;
		font-style: normal !important;
		line-height: 15px !important;
		border: 0 !important;
		outline: 0 !important;
		background-color: #24272E !important;
		border-radius: 8px !important;
		color: white !important;
		padding: 12px !important;
		display: block !important;
		height: auto !important;
	}
	.ant-select-selector {
		border: none !important;
		height: 40px !important; 
		box-shadow: none !important;
	}

	.ant-select {
		height: 40px !important;
	}
	.ant-select-selection-search {
		inset: 0 !important;
	}
	.ant-select-selection-placeholder{
		color: #505050 !important;
		z-index: 100;
		display: flex !important;
		align-items: center !important;
	}
`;