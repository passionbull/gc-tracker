import { Button, Typography, TextField, Container, Grid, Checkbox, FormControlLabel, Box } from "@mui/material";
const log = require('electron-log');
import React, { FC, useState, useEffect, useRef } from "react";
import * as fs from 'fs';

import {CardType, NFTType} from '../../util/types_';
import {_decode, load_gu_card_info, gu_info} from '../../util/gu_api';
import BasicTable from './Table';
import { homedir } from 'os'
import {getAssetImage} from '../../util/guapi';
import GUCollector from '../../util/gu_collector';


class MainUI {
  deck_code: string;
  ready:boolean;

  my_clicked_cards:Number[];
  constructor() {
    this.deck_code = '';
    this.ready = false;
    this.my_clicked_cards = [];
  }

  clear(){
    this.my_clicked_cards = [];
  }

  changeCallback(event:any){
    console.log('change', event.target.value);
    var text:string = event.target.value;
    this.deck_code = text;
  }
  keyDownCallback = async (event:any, func:any)=>{
    // enter
    if(event.keyCode == 13) {
      console.log('enter',this.deck_code);
      var temp = await this.get_deck(this.deck_code);
      localStorage.setItem('deck_code',this.deck_code);
      func(temp); // update to table
    }
  }

  clickTableRawCallback= (card:CardType)=> {
    this.my_clicked_cards.push(  card.nft.proto *1 );
  }

  get_deck=async (deck_code:string)=> {
    var r = _decode(deck_code);
    var array_:CardType[]= [];
    if(r.result !=undefined) {
      for (const [key, value] of Object.entries(r.result)) {
      //  getAssetImage(gu_info[key].name,4).then( a=>{
      //  });
        var t:CardType={nft:{
          name:gu_info[key].name,
          bgImage:`https://card.godsunchained.com/?id=${gu_info[key].gid}&q=4`,
          proto:gu_info[key].gid,
          mana:0
        }, 
        id:key,
        count:value,
        user_hold:0,
        price_usd:'0'
        };
        array_.push(t);
      }
    }
    else {
    }
    console.log('array',array_);
    return array_;
  }

}
const mains = new MainUI();

interface MainProps {
  gu:GUCollector
}

function clickCallbackInner(text:string){
  require('electron').shell.openExternal(`https://gudecks.com/meta/player-stats?userId=${text}`);
}


export default function Main(props:MainProps): JSX.Element {
  const [arrayCards, setArrayCards] = useState<CardType[]>([
  ]);

  const [manualCount, setManualCount] = useState<Boolean>(false);
  props.gu.setClickedArray(mains.my_clicked_cards);
  props.gu.setMyCardsCallback(setArrayCards);
  const resetButtonCallback = () =>{
    mains.clear();
    props.gu.card_clear();
  }
  const update_click_cards =(card:CardType) =>{
    if(manualCount) {
      mains.clickTableRawCallback(card);
      for (const card_ of arrayCards) {
        if(card.nft.proto*1 == card_.nft.proto*1 ) {
          if(card_.count>0) card_.count -= 1;
        }
      }
      arrayCards.sort((a,b) =>b.count-a.count || a.nft.mana-b.nft.mana);
      setArrayCards(arrayCards.slice(0));
    }
  }

  const checkbox_callback = (e:any)=>{
    console.log(e.target.checked);
    setManualCount(Boolean(e.target.checked));
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Grid container justifyContent="center">
      <Typography variant="body1" gutterBottom>
        {props.gu.my_nickname} : {props.gu.opp_nickname} 
        {/* <Link>({props.gu.opp_id})</Link> */}
          {
            props.gu.opp_id?<Button onClick={()=>clickCallbackInner(props.gu.opp_id)}>({props.gu.opp_id})</Button>:''
          }
      </Typography>
        
      <TextField fullWidth id="outlined-basic" label="Deck code" variant="filled" 
        sx={{ input: { color: 'white' }, mb:'2rem' }} 
        onKeyDown={(e)=>{
          if(e.keyCode == 13) {
            props.gu.card_clear();
            mains.keyDownCallback(e, setArrayCards);
          }
        }}
        autoFocus={true} onChange={ (e) => mains.changeCallback(e)}/>
        {/* <BasicTable rows={arrayCards} clickCallback={mains.clickTableRawCallback} show_odd={true}  */}

        <Box sx={{ '& button': { m: 1 } }}>
          <Button variant="contained" size="small" onClick={resetButtonCallback}>Reset</Button>
        </Box>

        <FormControlLabel 
          control={<Checkbox size="small" onChange={checkbox_callback}/>} 
          labelPlacement="start" label="Manual count" />


        <BasicTable rows={arrayCards} clickCallback={update_click_cards} show_odd={true} 
        is_link_cards= {!manualCount}
        >
        </BasicTable>
      </Grid>
    </Container>
  );
}
