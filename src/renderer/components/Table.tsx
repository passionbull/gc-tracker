import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import {CardType} from '../../util/types_';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f900',
  },
}));

interface BasicTableProps {
    rows:CardType[];
    children: React.ReactNode;
    clickCallback:Function;
    show_odd:Boolean;
    is_link_cards:Boolean;
}

function clickCallbackInner(card:CardType){
  require('electron').shell.openExternal(`https://godscombine.com?n=${card.nft.name}`);
}

export default function BasicTable(props:BasicTableProps): JSX.Element {

  var total_cnt = 0;
  for (const card of props.rows) {
    total_cnt = total_cnt+ card.count;
  }


  return (
    <TableContainer sx={{ }} component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableBody>
          {props.rows.map((row:CardType) => (
            <HtmlTooltip placement="bottom" title={<Box component="img" src={row.nft.bgImage} sx={{height: 250,}}/>}>
            <TableRow
              key={row.nft.name}
              // onMouseOver={()=>props.clickCallback(row)}
              onClick={() =>{
                if(props.is_link_cards) clickCallbackInner(row);
                props.clickCallback(row);
              }}
              sx={{ 
                backgroundColor: row.user_hold>0?'#CCCC00':'#FFFFFF' 
                }}>
              <TableCell component="th" scope="row" 
              sx={{ color: 'text.primary', fontSize: 12 }}
              >
                {row.nft.mana}/ {row.nft.name}
              </TableCell>
              <TableCell align="right"
              sx={{ color: 'text.primary', fontSize: 12 }}
              >x{row.count} {  props.show_odd?`(${(100* (row.count / total_cnt)).toFixed(1)}%)`:""}</TableCell>
            </TableRow>
            </HtmlTooltip>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
