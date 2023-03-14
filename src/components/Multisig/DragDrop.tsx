// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button,UploadProps } from 'antd';
import { message, Upload } from 'antd';
import React from 'react';
import { UploadBoxIcon } from 'src/ui-components/CustomIcons';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

const { Dragger } = Upload;

const DragDrop = ({ setSignatories }: { setSignatories: React.Dispatch<React.SetStateAction<string[]>>}) => {

	const props: UploadProps = {
		accept: '.json',
		beforeUpload: file => {
			const reader = new FileReader();

			reader.onload = e => {
				console.log(e.target?.result);
				const fileContent = e.target?.result as string;
				if(!Array.isArray(JSON.parse(fileContent))){
					message.error('Please upload file in correct format.');
					return false;
				}
				JSON.parse(fileContent).forEach((address: string) => {
					const substrateAddress = getSubstrateAddress(address);
					if(!substrateAddress){
						message.error(`${address} is Invalid.`);
						return false;
					}
				});
				setSignatories(JSON.parse(fileContent)?.map((item: string) => getSubstrateAddress(item) || item));
			};
			console.log(file);
			reader.readAsText(file);

			// Prevent upload
			return true;
		},
		customRequest:({ file, onSuccess }) => {
			setTimeout(() => {
				if(onSuccess){
					onSuccess(file);
				}
			}, 0);
		},
		multiple: false,
		name: 'file',
		onChange(info) {

			const { status } = info.file;
			if (status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (status === 'done') {
				message.success(`${info.file.name} file uploaded successfully.`);

			} else if (status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		}
	};
	return (
		<div className='flex flex-col'>
			<h1 className='text-primary mb-1'>Signatories List</h1>
			<Dragger {...props} className="w-[45vw] bg-bg-secondary rounded-md p-4 my-3">
				<p className="ant-upload-drag-icon">
					<UploadBoxIcon className='my-2' />
				</p>
				<p className="ant-upload-text text-white">Drag and Drop JSON file to upload</p>
				<p className='text-text_secondary'>OR</p>
				<Button className='mt-3 bg-primary text-primary border-none bg-opacity-10'>Browse</Button>
			</Dragger></div>
	);};

export default DragDrop;