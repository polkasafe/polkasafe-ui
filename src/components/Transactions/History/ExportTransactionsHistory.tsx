// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useState } from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { QUICKBOOKS_CSV_HEADERS, XERO_CSV_HEADERS } from 'src/global/exportTransactionsConstants';
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
	closeModal: () => void
}

const ExportTransactionsHistory = ({ historyTxns, exportType, closeModal }: IExportTransactionsHistory) => {
	const [downloaded, setDownloaded] = useState<boolean>(false);
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

	const exportToCsv = () => {
		if(!historyTxns) return;

		// Convert users data to a csv
		const quickbooksTransactionsCsv = historyTxns.reduce((txns, a, i) => {
			const { date, callhash, token, from, amount } = a;
			const formattedDate = dayjs(date).format('L');
			txns.push([formattedDate, 'General', i+1, `P-${i+1}`, callhash, from, '', '', '', '', token, '', amount, ''].join(','));
			return txns;
		}, ['']);

		const xeroTransactionsCsv = historyTxns.reduce((txns, a) => {
			const { date, callhash, token, amount, network } = a;
			const formattedDate = dayjs(date).format('L');
			txns.push([formattedDate, amount, '', callhash, network, token, '', '', ''].join(','));
			return txns;
		}, ['']);

		downloadFile({
			data: exportType === EExportType.QUICKBOOKS ? [...QUICKBOOKS_CSV_HEADERS, ...quickbooksTransactionsCsv].join('\n') : [...XERO_CSV_HEADERS, ...xeroTransactionsCsv].join('\n'),
			fileName: `transactions-history-${exportType}.csv`,
			fileType: 'text/csv'
		});
		setDownloaded(true);
	};

	return (
		<div className='flex flex-col w-[560px]'>
			{downloaded ?
				<div className="">
					<span className='flex items-center'>
						<div className='bg-highlight text-primary px-2 rounded-md mr-2'>transactions-history-{exportType}.csv</div>
						<p className='text-white'>has been downloaded.</p>
					</span>
					<p className='text-white mt-1 ml-1'>You can import this into {exportType.charAt(0).toUpperCase() + exportType.slice(1)}.</p>
				</div>
				:
				<div className="flex items-left justify-left">
					<p className='mr-2 text-white'>You are about to export a CSV file with</p>
					<div className='bg-highlight text-primary px-2 rounded-md'>{historyTxns?.length} transaction entries</div>
				</div>
			}
			{downloaded ?
				<div className='flex items-center justify-center mt-[30px]'>
					<CancelBtn title='Close' onClick={closeModal}/>
				</div>
				:
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={closeModal}/>
					<AddBtn onClick={exportToCsv} title='Export' />
				</div>
			}
		</div>
	);
};

export default ExportTransactionsHistory;