import {CardType, NFTType} from './types_';
import {_decode, load_gu_card_info, gu_info} from './gu_api';
import {getLastDeck} from './guapi';

import * as fs from 'fs';
import { homedir } from 'os'

type objtype={
  [index:string]:any
}
export default class GUCollector {
  deck_code: string;
  opp_code: string;
  ready:boolean;
  my_cards:CardType[]; // cards in deck
  opp_cards:CardType[];
  cur_round:number
  interval_time:number
  set_my_deck_func:any
  set_opponent_func:any

  proto_to_name:any
  proto_to_id:any
  my_nickname:string
  opp_nickname:string
  opp_id:string
  opp_god:string

  my_click_cards_in_app:Number[]
  my_click_cards_in_app_cnt:number
  constructor() {
    this.deck_code = '';
    this.opp_code = '';
    this.ready = false;
    this.my_cards =[];
    this.opp_cards = [];
    this.cur_round = 0;
    this.interval_time = 1000;

    this.set_my_deck_func=undefined;
    this.set_opponent_func=undefined;
    this.proto_to_name={}
    this.proto_to_id={}

    this.my_nickname = "";
    this.opp_nickname = "";
    this.opp_id = "";
    this.opp_god = "";

    this.my_click_cards_in_app =[];
    this.my_click_cards_in_app_cnt = 0;

    // init    
    this.init();
  }

  init(){
    load_gu_card_info().then(()=>{
      for (const [key, value] of Object.entries(gu_info)) {
        this.proto_to_name[value.gid] = value.name;
        this.proto_to_id[value.gid]= key;
      }
      console.log('proto_to_name', this.proto_to_name);

      this.ready = true;
      // load 
      this.card_load();
    });
  }

  card_clear(){
    this.my_cards=[];
    this.my_click_cards_in_app = [];

    this.opp_cards=[];
    this.cur_round=0;
    this.my_click_cards_in_app_cnt = 0;
  }

  card_load(){
    if(!this.ready) return;
    // my cards
    try {
      var tmp = localStorage.getItem('deck_code');
      console.log('deck_code', tmp);
      if(tmp!=null){
        this.deck_code = tmp;
        this.get_deck(this.deck_code).then(a=>{
        this.my_cards = a;
        if(this.set_my_deck_func!=undefined) {
          this.my_cards .sort((a,b) =>b.count-a.count || a.nft.mana-b.nft.mana);
          this.set_my_deck_func(this.my_cards);
        }
        })
      }
    } catch (error) {
      console.log('err read deckcode 1')
    }
  }
  
  setOpponentCardCallback(func:Function) {
    this.set_opponent_func = func;
  }

  setClickedArray(arr:Number[]){
    this.my_click_cards_in_app = arr;
  }

  setMyCardsCallback(func:Function) {
    this.set_my_deck_func= func;
  }
  get_deck=async (deck_code:string)=> {
    var r = _decode(deck_code);
    var array_:CardType[]= [];
    if(r.result !=undefined) {
      console.log('deck code read', r.result);
      for (const [key, value] of Object.entries(r.result)) {
        var t:CardType={nft:{
          name:gu_info[key].name,
          bgImage:`https://card.godsunchained.com/?id=${gu_info[key].gid}&q=4`,
          proto:gu_info[key].gid,
          mana:gu_info[key].mana
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

  readDebug() {
    var text = '';
    try {
      try {
        // window
        text = fs.readFileSync(homedir()+'\\AppData\\LocalLow\\Immutable\\gods\\debug.log','utf8');
      } catch (error) {
        // mac
        text = fs.readFileSync(homedir()+'/Library/Logs/Immutable/gods/debug.log','utf8');
      }

      var last_idx = text.indexOf('UISpriteSubscriber(position:Opponent, value:PlayerAvatar)');
      if(last_idx != -1){
        text = text.substring(last_idx+150,last_idx+500);
        text = text.split('apolloId: ')[1];
        text = text.split(',')[0];
        console.log('debug', text);
        return text;
      }
    } catch (error) {
      return '';      
    }
  }

  readGodFromDebug(user_id:string) {
    var text = 'error';
    try {
      try {
        // window
        text = fs.readFileSync(homedir()+'\\AppData\\LocalLow\\Immutable\\gods\\debug.log','utf8');
      } catch (error) {
        // mac
        text = fs.readFileSync(homedir()+'/Library/Logs/Immutable/gods/debug.log','utf8');
      }

      var last_idx = text.indexOf(`TargetData:(targetType:'Zone', playerID:'${user_id}', targetName:'ZoneSurrogate:PlayerGivenCards:Power', targetNetID:'-1', targetGod:`);
      if(last_idx != -1){
        text = text.substring(last_idx).split('targetGod:')[1].split(')')[0];
        console.log('debug', text);
      }
      return text;
    } catch (error) {
      return 'error';      
    }
  }


  readCombat() {
    var round:number = 0;
    var raw_info:Array<string>= [];
    // console.log('homedir', homedir());
    var text = '';
    try {
      // window
      text = fs.readFileSync(homedir()+'\\AppData\\LocalLow\\Immutable\\gods\\combat.log','utf8');
    } catch (error) {
      // mac
      text = fs.readFileSync(homedir()+'/Library/Logs/Immutable/gods/combat.log','utf8');
    }
    
    const split3 = text.split(' | ').join('$').split('\n').join('$').split('$');
    var t =split3.filter( a=> a.includes('COMBAT SCENARIO '));
    if(t.length>0 && t.length%3 == 0){
      // console.log(t[t.length-3])
      var last_round = t[t.length-3];
      
      // update round
      round= Number(last_round.split(' ')[2]);

      var last_idx = split3.findIndex(a=>a == last_round);
      // console.log(split3.slice(last_idx));
      raw_info = split3.slice(last_idx);
    }
    return {round, raw_info};
  }

  findPlayer(raw_info:Array<string>){
    var arr = raw_info.filter(a=>a.includes("Player:"));
    console.log('find player', arr);
    return arr;
  }

    
  findCards(raw_info:Array<string>, search_string:string){
    var idx = raw_info.findIndex(a=>a.includes(search_string));
    console.log(search_string);
    var proto_list:Array<number> = [];
    if(idx!= -1) {
      var t= raw_info.slice(idx);
      var cnt = 0;
      while(true){
        if(t[cnt*5+1].includes('Name:') == false)
          break;
        console.log(t[cnt*5+1], t[cnt*5+2].split('Proto: ')[1]);
        proto_list.push(Number(t[cnt*5+2].split('Proto: ')[1]));
        cnt = cnt+1;
      }
    }
    return proto_list;
  }

  timerCallback(){
    if (this.my_cards.length==0) {
      console.log('timerCallback',this.my_cards.length)
      this.card_load();
      return; // no work
    }
    try {

      var info = this.readCombat();
      if(this.cur_round != info.round) 
      // if(true) 
      { 
        console.log('ROUND', this.cur_round, info.round);
        this.cur_round = info.round;
        if(this.cur_round ==1) {
          this.my_nickname = "";
          this.opp_nickname = "";
          this.opp_id = "";
        }
        if(this.my_nickname == "") {
          const arr = this.findPlayer(info.raw_info);
          if(arr.length>0) {
            this.my_nickname = arr[0].split(' ')[1];
          }
        }
        else if(this.opp_nickname == "") {
          const arr = this.findPlayer(info.raw_info);
          for (const nick of arr) {
            if(!nick.includes(this.my_nickname))
            this.opp_nickname = nick.split(' ')[1];
          }
        }

        // only once read
        if(this.opp_nickname != ""){
          if(this.opp_id == "") {
            var temp = this.readDebug();
            if (temp!=undefined)
              this.opp_id = temp;
          }
        }
        

        var t1= this.findCards(info.raw_info, 'Player Void Zone Cards');
        // console.log('t1',t1);
        var t2= this.findCards(info.raw_info, 'Player Board Zone Cards');
        // console.log('t2',t2);
        var my_hand= this.findCards(info.raw_info, 'Player Hand Zone Cards');
        // console.log('my_hand',my_hand);
        const my_card = [
          ...t1,
          ...t2,
          ...my_hand,
          ...this.my_click_cards_in_app
        ];

        var temp_cards:CardType[] = JSON.parse(JSON.stringify(this.my_cards));
        for (const card_proto of my_card) {
          var idx = temp_cards.findIndex( a=> a.nft.proto == card_proto);
          if(idx != -1) temp_cards[idx].count = temp_cards[idx].count -1;
        }
  
        for (const card_proto of my_hand) {
          var idx = temp_cards.findIndex( a=> a.nft.proto == card_proto);
          if(idx != -1) temp_cards[idx].user_hold = temp_cards[idx].user_hold +1;
        }
  
        // sort cards
        // { return x.count - y.count || x.year - y.year; }
        temp_cards.sort((a,b) =>b.count-a.count || a.nft.mana-b.nft.mana);

        // update
        if(this.set_my_deck_func!=undefined)
          this.set_my_deck_func(temp_cards);
      }
      else {
        // click event
        if(this.my_click_cards_in_app_cnt != this.my_click_cards_in_app.length){

        }
        this.my_click_cards_in_app_cnt = this.my_click_cards_in_app.length;
      }
    } 
    catch (error) {

    }
  }    

}