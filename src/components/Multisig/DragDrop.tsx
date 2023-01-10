// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, UploadProps } from 'antd';
import { message, Upload } from 'antd';
import React from 'react';
import { UploadBoxIcon } from 'src/ui-components/CustomIcons';

const { Dragger } = Upload;

const props: UploadProps = {
	action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
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

const DragDrop = () => (
	<Dragger {...props} className="w-[45vw] bg-bg-secondary rounded-md p-4 my-3">
		<p className="ant-upload-drag-icon">
			<UploadBoxIcon className='my-2'/>
		</p>
		<p className="ant-upload-text text-white">Drag and Drop CSV file to upload</p>
		<p className='text-text_secondary'>OR</p>
		<Button className='mt-3 bg-primary text-primary border-none bg-opacity-10'>Browse</Button>
	</Dragger>
);

export default DragDrop;