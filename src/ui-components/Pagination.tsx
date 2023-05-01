// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination as AntDPagination } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
type Props = {
    className?: string;
    currentPage:number;
    setPage: Dispatch<SetStateAction<number>>;
    totalDocs:number;
    defaultPageSize:number;
}

const PaginationStyled = styled(AntDPagination)`
&.ant-pagination .ant-pagination-item a{
	color:white;
}
&.ant-pagination .ant-pagination-item-active a{
	color:#1573FE;
}
&.ant-pagination .ant-pagination-item-link{
	color: white;
}
&.ant-pagination .ant-pagination-item-link:disabled{
	color:rgba(0, 0, 0, 0.25);
}
`;

export default function Pagination({ className, currentPage, setPage, totalDocs, defaultPageSize }: Props) {
	return (
		<PaginationStyled
			className={className}
			defaultCurrent={currentPage}
			defaultPageSize={defaultPageSize} //default size of page
			onChange={setPage}
			total={totalDocs} //total number of card data available
		/>
	);
}