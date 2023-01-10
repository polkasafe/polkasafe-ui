// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DatePicker, Form, Input } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { CircleArrowDownIcon, DatePickerIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

interface IFilterProps {
	className?: string;
}

const Filter: FC<IFilterProps> = (props) => {
	const { className } = props;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

	return (
		<div className={classNames('ml-auto relative', className)}>
			<button
				onClick={() => setIsFilterModalVisible(!isFilterModalVisible)}
				className="flex items-center justify-center gap-x-[6.83px] rounded-lg p-2.5 font-medium text-sm leading-[15px] w-[100px] text-primary border-2 border-primary"
			>
				<span>
					Filter
				</span>
				<CircleArrowDownIcon />
			</button>
			{
				isFilterModalVisible?
					<div className='absolute top-12 right-0 z-10 bg-bg-main p-5 rounded-xl border border-primary w-[360px]'>
						<h3 className='text-white font-bold text-xl leading-[22px] text-left'>Parameters</h3>
						<Form
							className='flex flex-col gap-y-4 mt-[30px]'
						>
							<div className="flex flex-col gap-y-3">
								<label
									className="text-primary font-normal text-xs leading-[13px]"
									htmlFor="startDate"
								>
									From
								</label>
								<Form.Item
									name="startDate"
									className='m-0'
								>
									<DatePicker
										className='w-full text-white bg-bg-secondary border-none outline-none min-h-[40px]'
										placeholder='Start Date'
										suffixIcon={<DatePickerIcon className='text-white' />}
									/>
								</Form.Item>
							</div>
							<div className="flex flex-col gap-y-3">
								<label
									className="text-primary font-normal text-xs leading-[13px]"
									htmlFor="endDate"
								>
									To
								</label>
								<Form.Item
									name="endDate"
									className='m-0'
								>
									<DatePicker
										className='w-full text-white bg-bg-secondary border-none outline-none min-h-[40px] '
										placeholder='End Date'
										suffixIcon={<DatePickerIcon className='text-white' />}
									/>
								</Form.Item>
							</div>
							<div className="flex flex-col gap-y-3">
								<label
									className="text-primary font-normal text-xs leading-[13px]"
									htmlFor="amount"
								>
									Amount
								</label>
								<Form.Item
									name="amount"
									className='m-0'
								>
									<Input
										placeholder="0.00"
										className="w-full text-white bg-bg-secondary border-none outline-none min-h-[40px] placeholder:text-[#505050]"
										id="amount"
										type='number'
									/>
								</Form.Item>
							</div>
							<div className="flex flex-col gap-y-3">
								<label
									className="text-primary font-normal text-xs leading-[13px]"
									htmlFor="address"
								>
									Wallet Address
								</label>
								<Form.Item
									name="address"
									className='m-0'
								>
									<Input
										placeholder="Unique Address"
										className="w-full text-white bg-bg-secondary border-none outline-none min-h-[40px] placeholder:text-[#505050]"
										id="address"
										type='text'
									/>
								</Form.Item>
							</div>
							<div className='flex justify-between gap-x-5 mt-[30px]'>
								<CancelBtn title='Clear' />
								<ModalBtn title='Apply' />
							</div>
						</Form>
					</div>
					: null
			}
		</div>
	);
};

export default styled(Filter)`
	.ant-picker-input input {
		color: white !important;
	}
	.ant-picker-input input::placeholder {
		color: #505050 !important;
	}
`;