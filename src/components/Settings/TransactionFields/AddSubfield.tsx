// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MinusCircleOutlined,PlusCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, Input, Spin, Switch } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { EFieldType, ITransactionCategorySubfields, NotificationStatus } from 'src/types';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

const AddSubfield = ({ className, onCancel, category }: { className?: string, onCancel: () => void, category: string }) => {
	const [loading, setLoading] = useState(false);

	const [subfields, setSubfields] = useState<{ name: string, subfieldType: EFieldType, required: boolean }[]>([{ name: '', required: true, subfieldType: EFieldType.SINGLE_SELECT }]);
	const { network } = useGlobalApiContext();
	const { setUserDetailsContextState, transactionFields } = useGlobalUserDetailsContext();

	const fieldTypeOptions: ItemType[] = Object.values(EFieldType).filter(key => key !== EFieldType.ATTACHMENT).map((key) => ({
		key: key,
		label: <span className='text-white'>{key}</span>
	}));

	const onSubfieldNameChange = (value: string, i: number) => {
		setSubfields((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.name = value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onSubfieldTypeChange = (type: EFieldType, i: number) => {
		setSubfields((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.subfieldType = type;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onSubfieldRequiredChange = (required: boolean, i: number) => {
		setSubfields((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.required = required;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddSubfield = () => {
		setSubfields((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ name: '', required: true, subfieldType: EFieldType.SINGLE_SELECT });
			return copyOptionsArray;
		});
	};

	const onRemoveSubfield = (i: number) => {
		const copyOptionsArray = [...subfields];
		copyOptionsArray.splice(i, 1);
		setSubfields(copyOptionsArray);
	};

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

				const subfieldsObject: ITransactionCategorySubfields = {};
				if(subfields){
					subfields.forEach((item) => {
						subfieldsObject[`${item.name.toLowerCase().split(' ').join('_')}`] = {
							required: item.required,
							subfieldName: item.name,
							subfieldType: item.subfieldType
						};
					});
				}

				const updateTransactionFieldsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransactionFields`, {
					body: JSON.stringify({
						transactionFields:{
							...transactionFields,
							[category]: {
								...transactionFields[category],
								subfields: {
									...transactionFields[category].subfields,
									...subfieldsObject
								}
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
							[category]: {
								...prev.transactionFields[category],
								subfields: {
									...prev.transactionFields[category].subfields,
									...subfieldsObject
								}
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
			<Spin spinning={loading} indicator={<LoadingLottie width={300} message={`Updating your ${transactionFields[category].fieldName} category...`} /> }>
				<div className={className}>
					<Form disabled={ loading }>
						<section className='max-h-[75vh] overflow-y-auto'>
							{subfields && subfields.map((subfield, i) => (
								<div key={i} className='flex flex-col gap-y-3'>
									{i !== 0 && <div className='flex items-center justify-between'>
										<span className='text-white text-sm' >Sub-Field Details</span>
										<Button icon={<MinusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center' onClick={() => onRemoveSubfield(i)} >Remove Sub-Field</Button>
									</div>}
									<div className="flex flex-col gap-y-3 mb-4">
										<label
											className="text-primary text-xs leading-[13px] font-normal"
											htmlFor="name"
										>
                                            Sub-Field Name*
										</label>
										<Form.Item
											name={`sub-field-add-${i+1}`}
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
												id={`sub-field-add-${i+1}`}
												onChange={(e) => onSubfieldNameChange(e.target.value, i)}
												value={subfield.name}
											/>
										</Form.Item>
									</div>
									<div className='flex flex-col gap-y-3 mb-4'>
										<p className='text-primary font-normal text-xs leading-[13px]'>Sub-Field Type</p>
										<Dropdown
											trigger={['click']}
											className={`border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer ${className}`}
											menu={{
												items: fieldTypeOptions,
												onClick: (e) => {
													onSubfieldTypeChange(e.key as any, i);
												}
											}}
										>
											<div className="flex justify-between items-center text-white">
												{subfield.subfieldType}
												<CircleArrowDownIcon className='text-primary' />
											</div>
										</Dropdown>
									</div>
									<div className='mb-4 flex items-center gap-x-2'>
										<p className='text-primary font-normal text-xs leading-[13px]'>Required</p>
										<Switch size='small' className='w-auto' checked={subfield.required} onChange={(checked) => onSubfieldRequiredChange(checked, i)} />
									</div>
								</div>
							))}
							<Button icon={<PlusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center' onClick={onAddSubfield} >Add Sub-Field</Button>
						</section>

						<section className='flex items-center gap-x-5 justify-between mt-10'>
							<CancelBtn loading={loading} className='w-[200px]' onClick={onCancel} />
							<ModalBtn disabled={subfields.some((subfield) => subfield.name === '')} loading={loading} onClick={handleSave} className='w-[200px]' title='Save' />
						</section>
					</Form>
				</div>
			</Spin>
		</>
	);
};

export default styled(AddSubfield)`
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