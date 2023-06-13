// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PlusCircleOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Spin, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { useEffect,useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { EFieldType, IDropdownOptions, NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

const EditField = ({ className, onCancel, field, fieldName, fieldType, dropdownOptions, required }: { className?: string, onCancel: () => void, field: string, fieldName: string, fieldType: EFieldType, dropdownOptions?: IDropdownOptions[], required: boolean }) => {
	const [loading, setLoading] = useState(false);
	const { network } = useGlobalApiContext();
	const { setUserDetailsContextState, transactionFields } = useGlobalUserDetailsContext();
	const [requiredState, setRequiredState] = useState<boolean>(required);
	const [newOption, setNewOption] = useState<string>('');
	const [dropdownState, setDropdownState] = useState<IDropdownOptions[] | undefined>(dropdownOptions);

	const [autocompleteOptions, setAutocompleteOptions] = useState<DefaultOptionType[]>([]);

	useEffect(() => {
		setAutocompleteOptions(
			dropdownState ?
				dropdownState?.map((option) => ({
					label: (
						<div className='text-white flex items-center justify-between'>
							<span>{option.optionName}</span>
						</div>),
					value: option.optionName
				})) : []
		);
	}, [dropdownState]);

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
							[field]: {
								...transactionFields[field],
								dropdownOptions: dropdownState,
								required: requiredState
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
						message: 'Transaction Fields Updated.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[field]: {
								...prev.transactionFields[field],
								dropdownOptions: dropdownState,
								required: requiredState
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

					<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Field Name</p>
					<div className=' p-[10px] mb-4 text-text_secondary border-2 border-dashed border-bg-secondary rounded-lg'>
						{fieldName}
					</div>

					<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Field Type</p>
					<div className=' p-[10px] mb-4 text-text_secondary border-2 border-dashed border-bg-secondary rounded-lg'>
						{fieldType}
					</div>
					<Form disabled={ loading }>
						{fieldType === EFieldType.SINGLE_SELECT &&
						<section>
							<div className='flex items-center justify-between mb-2'>
								<label className='text-primary font-normal text-xs leading-[13px] block'>Dropdown Options</label>
							</div>
							<div className='flex items-center gap-x-[10px] mb-4'>
								<div className='w-full'>
									<Form.Item
										name="new_option"
										className='border-0 outline-0 my-0 p-0'
									>
										<div className="flex items-center">
											<AutoComplete
												filterOption={(inputValue, options) => {
													return inputValue ? (String(options?.value) || '') === (inputValue) : true;
												}}
												notFoundContent={<Button icon={<PlusCircleOutlined/>} onClick={() => {setDropdownState(prev => prev ? [...prev, { optionName: newOption }] : [{ optionName: newOption }]); setNewOption('');}} className='bg-transparent text-primary border-none outline-none'>ADD OPTION</Button>}
												options={autocompleteOptions}
												id='new_option'
												value={newOption}
												placeholder="Type to add a new option"
												onChange={(value) => setNewOption(value)}
											/>
										</div>
									</Form.Item>
								</div>
							</div>
						</section>
						}
						<div className='flex items-center gap-x-2'>
							<p className='text-primary font-normal text-xs leading-[13px]'>Required</p>
							<Switch size='small' checked={requiredState} onChange={(checked) => setRequiredState(checked)} />
						</div>

						<section className='flex items-center gap-x-5 justify-between mt-10'>
							<CancelBtn loading={loading} className='w-[200px]' onClick={onCancel} />
							<ModalBtn disabled={(dropdownOptions && dropdownState === dropdownOptions) && requiredState === required} loading={loading} onClick={handleSave} className='w-[200px]' title='Save' />
						</section>
					</Form>
				</div>
			</Spin>
		</>
	);
};

export default styled(EditField)`
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