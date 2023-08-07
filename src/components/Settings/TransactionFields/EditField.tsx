// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MoreOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, Modal, Spin, Switch } from 'antd';
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
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

const EditField = ({ className, onCancel, category, subfield, subfieldName, subfieldType, dropdownOptions, required }: { className?: string, onCancel: () => void, category: string, subfield: string, subfieldName: string, subfieldType: EFieldType, dropdownOptions?: IDropdownOptions[], required: boolean }) => {
	const [loading, setLoading] = useState(false);
	const { network } = useGlobalApiContext();
	const { setUserDetailsContextState, transactionFields } = useGlobalUserDetailsContext();
	const [requiredState, setRequiredState] = useState<boolean>(required);
	const [newSubfieldName, setNewSubfieldName] = useState<string>(subfieldName || '');
	const [newOption, setNewOption] = useState<string>('');
	const [dropdownState, setDropdownState] = useState<IDropdownOptions[] | undefined>(dropdownOptions);
	const [openEditOptionModal, setOpenEditOptionModal] = useState({ i: 0, open: false });

	const [autocompleteOptions, setAutocompleteOptions] = useState<DefaultOptionType[]>([]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const EditOptionModal = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [name, setName] = useState<string>(dropdownState?.[openEditOptionModal.i]?.optionName || '');
		const [archieved, setArchieved] = useState<boolean>(dropdownState?.[openEditOptionModal.i]?.archieved || false);
		return (
			<>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenEditOptionModal({ i: 0, open: false })}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					open={openEditOptionModal.open}
					className={`${className} w-[500px] scale-90`}
				>
					<Input
						autoFocus
						id={`${openEditOptionModal.i}`}
						className="w-full mt-10 z-100 text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24"
						defaultValue={name}
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<div className='flex items-center gap-x-3 mt-5'>
						<span className='text-white'>Archive Category</span>
						<Switch size='small' checked={archieved} onChange={(checked) => setArchieved(checked)} />
					</div>
					<section className='flex items-center gap-x-5 justify-between mt-10'>
						<CancelBtn className='w-[150px]' onClick={() => setOpenEditOptionModal({ i: 0, open: false })} />
						<ModalBtn disabled={!name || (name === dropdownState?.[openEditOptionModal.i].optionName && archieved === !!dropdownState?.[openEditOptionModal.i].archieved)}
							onClick={() => {
								setDropdownState(prev => {
									if (!prev) return;
									const copyArray = [...prev];
									const copyObject = { ...prev[openEditOptionModal.i] };
									copyObject.optionName = name;
									copyObject.archieved = archieved;
									copyArray[openEditOptionModal.i] = copyObject;
									return copyArray;
								});
								setNewOption(name);
								setOpenEditOptionModal({ i: 0, open: false });
							}} className='w-[150px]' title='Save' />
					</section>
				</Modal>
			</>
		);
	};

	useEffect(() => {
		setAutocompleteOptions(
			dropdownState ?
				dropdownState?.map((option, i) => ({
					label: (
						<div className='text-white flex items-center justify-between'>
							<span className={`${option.archieved && 'text-text_secondary'}`} >{option.optionName}</span>
							<button onClick={() => {
								setOpenEditOptionModal({ i, open: true });
							}}><MoreOutlined rev={undefined}/></button>
						</div>
					),
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
							[category]: {
								...transactionFields[category],
								subfields: {
									...transactionFields[category].subfields,
									[subfield]: {
										...transactionFields[category].subfields[subfield],
										dropdownOptions: dropdownState,
										required: requiredState,
										subfieldName: newSubfieldName
									}
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
									[subfield]: {
										...prev.transactionFields[category].subfields[subfield],
										dropdownOptions: dropdownState,
										required: requiredState,
										subfieldName: newSubfieldName
									}
								}
							}
						}
					}));
					setLoading(false);
					setNewOption('');
					setDropdownState(transactionFields[category].subfields[subfield].dropdownOptions);
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
			<Spin spinning={loading} indicator={<LoadingLottie width={250} message={`Updating your ${subfieldName} field...`} /> }>
				<div className={className}>
					<EditOptionModal />

					<div className="flex flex-col gap-y-3 mb-4">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor='sub-field-name'
						>
							Sub-Field Name*
						</label>
						<Form.Item
							name={'sub-field-name'}
							rules={[
								{
									message: 'Required',
									required: true
								}
							]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Sub-Field Name"
								className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id={'sub-field-name'}
								onChange={(e) => setNewSubfieldName(e.target.value)}
								value={newSubfieldName}
							/>
						</Form.Item>
					</div>

					<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Sub-Field Type</p>
					<div className=' p-[10px] mb-4 text-text_secondary border-2 border-dashed border-bg-secondary rounded-lg'>
						{subfieldType}
					</div>
					<Form disabled={ loading }>
						{subfieldType === EFieldType.SINGLE_SELECT &&
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
												notFoundContent={<Button icon={<PlusCircleOutlined rev={undefined}/>} onClick={() => {setDropdownState(prev => prev ? [...prev, { optionName: newOption }] : [{ optionName: newOption }]); setNewOption('');}} className='bg-transparent text-primary border-none outline-none'>ADD OPTION</Button>}
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
							<CancelBtn loading={loading} className='w-[200px]' onClick={() => {
								onCancel();
								setNewOption('');
								setDropdownState(transactionFields[category].subfields[subfield].dropdownOptions);
							}} />
							<ModalBtn disabled={(dropdownOptions && dropdownState === dropdownOptions) && requiredState === required && (newSubfieldName === subfieldName || newSubfieldName === '')} loading={loading} onClick={handleSave} className='w-[200px]' title='Save' />
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