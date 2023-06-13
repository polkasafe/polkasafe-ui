// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal, Switch } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { EFieldType, IDropdownOptions } from 'src/types';
import { DeleteIcon, EditIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import DeleteField from './DeleteField';
import EditField from './EditField';

const EditFieldModal = ({ className, field, fieldName, fieldType, dropdownOptions, required }: { className?: string, field: string, fieldName: string, fieldType: EFieldType, dropdownOptions?: IDropdownOptions[], required: boolean }) => {
	const [openEditFieldModal, setOpenEditFieldModal] = useState(false);
	return (
		<>
			<Button
				onClick={() => setOpenEditFieldModal(true)}
				className='text-primary border-none outline-none bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
				<EditIcon className='' />
			</Button>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenEditFieldModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>{fieldName} Details</h3>}
				open={openEditFieldModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<EditField field={field} fieldName={fieldName} fieldType={fieldType} required={required} dropdownOptions={dropdownOptions}  onCancel={() => setOpenEditFieldModal(false)} />
			</Modal>
		</>
	);
};

const DeleteFieldModal = ({ className, field }: { className?: string, field: string }) => {
	const [openDeleteFieldModal, setOpenDeleteFieldModal] = useState(false);
	return (
		<>
			<Button
				onClick={() => setOpenDeleteFieldModal(true)}
				className='text-failure border-none outline-none bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
				<DeleteIcon />
			</Button>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenDeleteFieldModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Delete Field</h3>}
				open={openDeleteFieldModal}
				className={`${className} w-auto md:min-w-[500px]`}
			>
				<DeleteField field={field} onCancel={() => setOpenDeleteFieldModal(false)} />
			</Modal>
		</>
	);
};

const FieldsList = ({ className }: { className?: string, disabled?: boolean }) => {
	const { transactionFields, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleRequiredChange = async (key: string, requiredState: boolean) => {

		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{
				setUserDetailsContextState((prev) => ({
					...prev,
					transactionFields: {
						...prev.transactionFields,
						[key]: {
							...prev.transactionFields[key],
							required: requiredState
						}
					}
				}));
				setLoading(true);

				const updateTransactionFieldsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransactionFields`, {
					body: JSON.stringify({
						transactionFields:{
							...transactionFields,
							[key]: {
								...transactionFields[key],
								required: requiredState
							}
						}
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: updateTransactionFieldsData, error: updateTransactionFieldsError } = await updateTransactionFieldsRes.json() as { data: string, error: string };

				if(updateTransactionFieldsError) {
					console.log(updateTransactionFieldsError);
					setLoading(false);
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[key]: {
								...prev.transactionFields[key],
								required: !requiredState
							}
						}
					}));
					return;
				}

				if(updateTransactionFieldsData){
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[key]: {
								...prev.transactionFields[key],
								required: requiredState
							}
						}
					}));
					setLoading(false);
				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
			setUserDetailsContextState((prev) => ({
				...prev,
				transactionFields: {
					...prev.transactionFields,
					[key]: {
						...prev.transactionFields[key],
						required: !requiredState
					}
				}
			}));
		}
	};

	return (
		<div className='text-sm font-medium leading-[15px] '>
			<article className='grid grid-cols-6 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>
					Field Name
				</span>
				<span className='col-span-2'>
					Field Description
				</span>
				<span className='col-span-1'>
					Field Type
				</span>
				<span className='col-span-1'>
					Required
				</span>
				<span className='col-span-1'>
					Action
				</span>
			</article>
			{
				Object.keys(transactionFields).filter((key) => transactionFields[key].deleted !== true).map((key, index) => {
					return (
						<article key={index}>
							<div className='grid grid-cols-6 gap-x-5 py-6 px-4 text-white'>
								<p className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-base'>
									{transactionFields[key].fieldName}
								</p>
								<div className='col-span-2 flex items-center'>
									{transactionFields[key].fieldDesc}
								</div>
								<div className='col-span-1 flex items-center gap-x-[10px]'>
									{transactionFields[key].fieldType}
								</div>
								<div className='col-span-1 flex items-center gap-x-[10px]'>
									<Switch disabled={loading} onChange={(checked) => handleRequiredChange(key, checked)} size='small' checked={transactionFields[key].required} />
								</div>
								<div className='col-span-1 flex items-center gap-x-[10px]'>
									<EditFieldModal field={key} className={className} fieldName={transactionFields[key].fieldName} fieldType={transactionFields[key].fieldType} required={transactionFields[key].required} dropdownOptions={transactionFields[key].dropdownOptions} />
									<DeleteFieldModal field={key} className={className} />
								</div>
							</div>
							{Object.keys(transactionFields).length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
						</article>
					);
				})
			}
		</div>
	);
};

export default styled(FieldsList)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;