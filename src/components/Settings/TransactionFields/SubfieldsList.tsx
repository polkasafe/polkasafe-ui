// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Modal, Switch } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { EFieldType, IDropdownOptions } from 'src/types';
import { DeleteIcon, EditIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import AddSubfield from './AddSubfield';
import DeleteField from './DeleteField';
import EditField from './EditField';

const EditFieldModal = ({ className, category, subfield, subfieldName, subfieldType, dropdownOptions, required }: { className?: string, category: string, subfield: string, subfieldName: string, subfieldType: EFieldType, dropdownOptions?: IDropdownOptions[], required: boolean }) => {
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
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>{subfieldName} Details</h3>}
				open={openEditFieldModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<EditField category={category} subfield={subfield} subfieldName={subfieldName} subfieldType={subfieldType} required={required} dropdownOptions={dropdownOptions}  onCancel={() => setOpenEditFieldModal(false)} />
			</Modal>
		</>
	);
};

const DeleteFieldModal = ({ className, subfield, category }: { className?: string, subfield: string, category: string }) => {
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
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Delete Sub-Field</h3>}
				open={openDeleteFieldModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<DeleteField category={category} subfield={subfield} onCancel={() => setOpenDeleteFieldModal(false)} />
			</Modal>
		</>
	);
};

const SubfieldsList = ({ className, category }: { className?: string, category: string }) => {
	const { transactionFields, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [openAddSubfieldModal, setOpenAddSubfieldModal] = useState(false);

	const AddSubfieldModal = ({ className, category }: { className?: string, category: string }) => {
		return (
			<>
				<Button
					icon={<PlusCircleOutlined className='text-primary' rev={undefined} />}
					className='my-2 bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'
					onClick={() => setOpenAddSubfieldModal(true)}
				>
					Add Sub-Field
				</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenAddSubfieldModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Sub-Fields</h3>}
					open={openAddSubfieldModal}
					className={`${className} w-auto md:min-w-[500px] scale-90`}
				>
					<AddSubfield category={category} onCancel={() => setOpenAddSubfieldModal(false)} />
				</Modal>
			</>
		);
	};

	const handleRequiredChange = async (key: string, requiredState: boolean) => {

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
									[key]: {
										...transactionFields[category].subfields[key],
										required: requiredState
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
					console.log(updateTransactionFieldsError);
					setLoading(false);
					return;
				}

				if(updateTransactionFieldsData){
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[category]: {
								...prev.transactionFields[category],
								subfields: {
									...prev.transactionFields[category].subfields,
									[key]: {
										...prev.transactionFields[category].subfields[key],
										required: requiredState
									}
								}
							}
						}
					}));
					setLoading(false);
				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<div className='text-sm font-medium leading-[15px] '>
			<article className='grid grid-cols-5 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-2'>
					Sub-Field Name
				</span>
				<span className='col-span-1'>
					Sub-Field Type
				</span>
				<span className='col-span-1'>
					Required
				</span>
				<span className='col-span-1'>
					Action
				</span>
			</article>
			{
				category === 'none' ?
					<section className='my-4 text-sm w-full text-white font-normal flex justify-center'>
						This Category cannot be Customized.
					</section>
					:
					transactionFields[category] && !Object.keys(transactionFields[category].subfields).length
						?
						<section className='my-4 text-sm w-full text-white font-normal flex justify-center'>
							Please add Sub-Fields to this Category.
						</section>
						:
						transactionFields[category] && transactionFields[category].subfields && Object.keys(transactionFields[category].subfields).map((subfield, index) => {
							const subfieldObject = transactionFields[category].subfields[subfield];
							return (
								<article key={index}>
									<div className='grid grid-cols-5 gap-x-5 py-6 px-4 text-white'>
										<div className='sm:w-auto overflow-hidden text-ellipsis col-span-2 flex items-center text-base'>
											{subfieldObject.subfieldName}
										</div>
										<div className='col-span-1 flex items-center gap-x-[10px]'>
											{subfieldObject.subfieldType}
										</div>
										<div className='col-span-1 flex items-center gap-x-[10px]'>
											<Switch disabled={loading} onChange={(checked) => handleRequiredChange(subfield, checked)} size='small' defaultChecked={subfieldObject.required} />
										</div>
										<div className='col-span-1 flex items-center gap-x-[10px]'>
											<EditFieldModal category={category} subfield={subfield} className={className} subfieldName={subfieldObject.subfieldName} subfieldType={subfieldObject.subfieldType} required={subfieldObject.required} dropdownOptions={subfieldObject.dropdownOptions} />
											<DeleteFieldModal category={category} subfield={subfield} className={className} />
										</div>
									</div>
									{Object.keys(transactionFields[category].subfields).length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
								</article>
							);
						})
			}
			{category !== 'none' && <AddSubfieldModal category={category} />}
		</div>
	);
};

export default styled(SubfieldsList)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;