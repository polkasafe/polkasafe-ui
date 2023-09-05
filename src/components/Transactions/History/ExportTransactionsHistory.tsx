// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { EExportType } from 'src/Screens/Transactions';

interface IHistoryTxns {
	date: Date,
	amount: string,
	callhash: string,
	from: string,
	token: string,
	network: string
}

interface IExportTransactionsHistory {
	exportType: EExportType,
	historyTxns?: IHistoryTxns[],
	onCancel: () => void
}

const ExportTransactionsHistory = ({ historyTxns, exportType, onCancel }: IExportTransactionsHistory) => {
	const downloadFile = ({ data, fileName, fileType }: { data: any, fileName: string, fileType: string }) => {
		// Create a blob with the data we want to download as a file
		const blob = new Blob([data], { type: fileType });
		// Create an anchor element and dispatch a click event on it
		// to trigger a download
		const a = document.createElement('a');
		a.download = fileName;
		a.href = window.URL.createObjectURL(blob);
		const clickEvt = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window
		});
		a.dispatchEvent(clickEvt);
		a.remove();
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const exportToCsv = () => {
		if(!historyTxns) return;
		// Headers for each column
		const quickbooksHeaders = ['Date,Type,Doc Number,P0 Number,Name,Source,Account,Detail Account,Job,Item,Class,Cleared,Amount,Memo'];
		const xeroHeaders = ['Date,Amount,Payee,Description,Reference,Transaction Type,Account Code,Department,Location'];

		// Convert users data to a csv
		const quickbooksTransactionsCsv = historyTxns.reduce((txns, a, i) => {
			const { date, callhash, token, from, amount } = a;
			const formattedDate = dayjs(date).format('L');
			txns.push([formattedDate, 'General Journal', i+1, i+1, callhash, from, '', '', '', '', token, '', amount, ''].join(','));
			return txns;
		}, ['']);

		const xeroTransactionsCsv = historyTxns.reduce((txns, a) => {
			const { date, callhash, token, amount, network } = a;
			const formattedDate = dayjs(date).format('L');
			txns.push([formattedDate, amount, '', callhash, network, token, '', '', ''].join(','));
			return txns;
		}, ['']);

		downloadFile({
			data: exportType === EExportType.QUICKBOOKS ? [...quickbooksHeaders, ...quickbooksTransactionsCsv].join('\n') : [...xeroHeaders, ...xeroTransactionsCsv].join('\n'),
			fileName: `transactions-history-${exportType}.csv`,
			fileType: 'text/csv'
		});
		onCancel();
	};

	return (
		<div className='flex flex-col w-[560px]'>
			<div className="flex items-left justify-left">
				<p className='mr-2 text-white'>You are about to export a CSV file with</p>
				<div className='bg-highlight text-primary px-2 rounded-md'>{historyTxns?.length} transaction entries</div>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel}/>
				<AddBtn onClick={exportToCsv} title='Export' />
			</div>
		</div>
	);
};

export default ExportTransactionsHistory;