// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { getTypeDef } from '@polkadot/types/create';
import { TypeDef,TypeDefInfo } from '@polkadot/types/types';
import { Dropdown, Input } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';
import paramConversion from 'src/utils/paramConversion';

interface ParamField {
    name: string
    type: string
    optional: boolean
	raw: TypeDef
	typeName: string
  }

  interface FormState {
    palletRpc: string
    callable: string
    inputParams: any[]
  }

const initFormState = {
	callable: '',
	inputParams: [] as any[],
	palletRpc: ''
} as FormState;

// Ref - Multix https://github.com/ChainSafe/Multix/blob/main/packages/ui/src/components/EasySetup/ManualExtrinsic.tsx
const paramIsOptional = (arg: any) => arg.type.toString().startsWith('Option<');

const transformParams = (
	paramFields: ParamField[],
	inputParams: any[],
	opts = { emptyAsNull: true }
) => {
	const paramVal = inputParams.map((inputParam) => {
		if (
			typeof inputParam === 'object' &&
        inputParam !== null &&
        typeof inputParam.value === 'string'
		) {
			return inputParam.value.trim();
		} else if (typeof inputParam === 'string') {
			return inputParam.trim();
		}
		return inputParam;
	});

	const params = paramFields.map((field, ind) => ({
		...field,
		value: paramVal[ind] || null
	}));

	return params.reduce((previousValue, { type = 'string', value }) => {
		if (value == null || value === '')
			return opts.emptyAsNull ? [...previousValue, null] : previousValue;

		let converted = value;

		if (type.indexOf('Vec<') >= 0) {
			converted = converted.split(',').map((e: string) => e.trim());
			converted = converted.map((single: any) =>
				isNumType(type)
					? single.indexOf('.') >= 0
						? Number.parseFloat(single)
						: Number.parseInt(single)
					: single
			);
			return [...previousValue, converted];
		}

		if (isNumType(type)) {
			converted =
          converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted);
		}
		return [...previousValue, converted];
	}, [] as any[]);
};

const isNumType = (type: string) => paramConversion.num.includes(type);

const ManualExtrinsics = ({ className, setCallData }: { className?: string, setCallData: React.Dispatch<React.SetStateAction<string>>}) => {

	const { api, apiReady } = useGlobalApiContext();
	const [palletRPCs, setPalletRPCs] = useState<ItemType[]>([]);
	const [callables, setCallables] = useState<ItemType[]>([]);
	const [paramFields, setParamFields] = useState<ParamField[] | null>(null);
	const [formState, setFormState] = useState(initFormState);
	const { palletRpc, callable, inputParams } = formState;
	const [transformedParams, setTransformedParams] = useState<any>();
	const areAllParamsFilled = useMemo(() => {
		if (paramFields === null) {
			return false;
		}

		if (paramFields.length === 0) {
			return true;
		}

		return paramFields?.every((paramField, ind) => {
			const param = inputParams[ind];
			if (paramField.optional) {
				return true;
			}
			if (param == null) {
				return false;
			}

			const value = typeof param === 'object' ? param.value : param;
			return value !== null && value !== '';
		});
	}, [inputParams, paramFields]);

	useEffect(() => {
		!!paramFields?.length &&
        !!inputParams.length &&
        setTransformedParams(transformParams(paramFields, inputParams));
	}, [inputParams, paramFields]);

	const updatePalletRPCs = useCallback(() => {
		if (!api) {
			return;
		}
		const apiType = api.tx;
		const palletRPCs = Object.keys(apiType)
			.sort()
			.filter((pr) => Object.keys(apiType[pr]).length > 0)
			.map((pr) => ({ key: pr, label: <span className='text-white flex items-center gap-x-2'>{pr}</span> }));
		setPalletRPCs(palletRPCs);
	}, [api]);

	const updateCallables = useCallback(() => {
		if (!api || !palletRpc) {
			return;
		}

		const callables = Object.keys(api.tx[palletRpc])
			.sort()
			.map((c) => ({ key: c, label: <span className='text-white flex items-center gap-x-2'>{c}</span> }));
		setCallables(callables);
	}, [api, palletRpc]);

	const updateParamFields = useCallback(() => {
		if (!api || !palletRpc || !callable) {
			setParamFields(null);
			return;
		}

		let paramFields: ParamField[] = [];
		const metaArgs = api.tx[palletRpc][callable].meta.args;

		if (metaArgs && metaArgs.length > 0) {
			paramFields = metaArgs.map((arg) => {

				const instance = api.registry.createType(arg.type as unknown as 'u32');

				const raw = getTypeDef(instance.toRawType());
				console.log(raw);

				return {
					name: arg.name.toString(),
					optional: paramIsOptional(arg),
					raw,
					type: arg.type.toString(),
					typeName: arg.typeName.toString()
				};
			});
		}

		setParamFields(paramFields);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, callable, palletRpc, formState]);

	useEffect(updatePalletRPCs, [updatePalletRPCs]);
	useEffect(updateCallables, [updateCallables]);
	useEffect(updateParamFields, [updateParamFields]);

	const onPalletCallableParamChange = useCallback((event: any, state: string) => {
		// reset the params
		setParamFields(null);

		setFormState((formState) => {
			return { ...formState, [state]: '' };
		});

		setFormState((formState) => {
			const value = event.key;
			if (state === 'palletRpc') {
				return {
					...formState,
					callable: '',
					inputParams: [],
					[state]: value
				};
			} else if (state === 'callable') {
				return { ...formState, inputParams: [], [state]: value };
			}

			return initFormState;
		});
	}, []);

	const onParamChange = (
		value: string,
		{ ind, paramField }: { ind: number; paramField: ParamField }
	) => {
		setFormState((formState) => {
			const inputParams = [...formState.inputParams];
			inputParams[ind] = { type: paramField.type, value };
			return { ...formState, inputParams };
		});
	};

	useEffect(() => {
		if (!apiReady || !api) {
			return;
		}

		if (!callable || !palletRpc || !areAllParamsFilled) {
			return;
		}

		try {
			const extrinsic = transformedParams ? api.tx[palletRpc][callable](...transformedParams) : api.tx[palletRpc][callable]();

			if(extrinsic) setCallData(extrinsic.method.toHex());

		} catch (e) {
			console.error('Error in ManualExtrinsic');
			console.error(e);
			console.error(e);
		}
	}, [api, areAllParamsFilled, callable, apiReady, palletRpc, transformedParams, setCallData]);

	return (
		<section className='w-[500px]'>
			<div className='flex items-center gap-x-2'>
				<div className='w-full'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Pallet</label>
					<Dropdown
						trigger={['click']}
						className={`border w-full border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer ${className}`}
						menu={{
							items: palletRPCs,
							onClick: (e) => onPalletCallableParamChange(e, 'palletRpc')
						}}
					>
						<div className="flex justify-between gap-x-4 items-center text-white text-[16px]">
							<span className='flex items-center gap-x-2'>
								{palletRpc ? palletRpc : <span className='text-text_secondary'>Pallet</span>}
							</span>
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</div>
				{palletRpc &&
				<div className='w-full'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Method</label>
					<Dropdown
						trigger={['click']}
						className={`border w-full border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer ${className}`}
						menu={{
							items: callables,
							onClick: (e) => onPalletCallableParamChange(e, 'callable')
						}}
					>
						<div className="flex justify-between gap-x-4 items-center text-white text-[16px]">
							<span className='flex items-center gap-x-2'>
								{callable ? callable : <span className='text-text_secondary'>Method</span>}
							</span>
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</div>}
			</div>
			{paramFields?.map((paramField, ind) => {
				return (
					<div key={ind} className='mt-2'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>{paramField.name}{paramField.optional ? ' (optional)' : ''}</label>
						{['i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256'].includes(paramField.raw.info === TypeDefInfo.Compact && paramField.raw.sub ? (paramField.raw.sub as any)?.type : paramField.raw.type) && ['Amount', 'Balance', 'BalanceOf'].includes(paramField.typeName)
							? <BalanceInput onChange={(balance) => onParamChange(balance.toString(), { ind, paramField })} />
							:
							['AccountId', 'Address', 'LookupSource', 'MultiAddress'].includes(paramField.type)
								?
								<AddressInput onChange={(address) => onParamChange(address, { ind, paramField })} placeholder={paramField.type} />
								:
								<Input
									placeholder={paramField.type}
									type='text'
									className="w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20"
									// value={inputParams[ind]?.value || ''}
									onChange={(event) => onParamChange(event.target.value, { ind, paramField })}
								/>
						}
					</div>
				);})}
		</section>
	);
};

export default ManualExtrinsics;