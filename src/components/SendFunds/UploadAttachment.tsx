// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, message,Upload, UploadProps } from 'antd';
import React from 'react';

import { ISubfieldAndAttachment } from './SendFundsForm';

const UploadAttachment = ({ setSubfieldAttachments, subfield }: { setSubfieldAttachments: React.Dispatch<React.SetStateAction<ISubfieldAndAttachment>>, subfield: string}) => {

	const props: UploadProps = {
		accept: 'image/jpeg, image/png, application/pdf',
		beforeUpload: file => {
			const isCorrectFile = file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png';
			if (!isCorrectFile) {
				message.error(`${file.name} is not accepted`);
			}
			if(isCorrectFile){
				setSubfieldAttachments(prev => ({
					...prev,
					[subfield]: {
						file
					}
				}));
			}
			return isCorrectFile || Upload.LIST_IGNORE;

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
		},
		onRemove() {
			setSubfieldAttachments(prev => {
				const newAttachments = { ...prev };
				delete newAttachments[subfield];
				return newAttachments;
			});
		}
	};

	return (
		<Upload {...props} >
			<Button>Upload</Button>
		</Upload>
	);
};

export default UploadAttachment;