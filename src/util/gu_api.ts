import {decode, encode, validate} from '@imtbl/gu-deckcode';
import axios from 'axios';
export var gu_info:objtype = {};
// load_gu_card_info();

type objtype={
    [index:string]:any
  }

export async function load_gu_card_info() {
    var url = "https://api.godsunchained.com/v0/proto?format=flat"
    var r = await axios.get(url);
    for (const key of Object.keys(r.data)) {
        const value:any = r.data[key];
        gu_info[value.lib_id]= {name:value.name, gid:key, mana:value.mana}
    }
    console.log('load done', gu_info);
}

export function _decode(text:string) {
    try {
        var result = decode(text);
        var result_set:objtype = {};
        if(result.libraryIds !=undefined) {
            for (const id of result.libraryIds) {
                if(result_set[id] == undefined) result_set[id]= 1;
                else result_set[id]= result_set[id] + 1;
            }
        }
        return {success:true,result:result_set}
    } catch (error) {
        console.log('fail load gu deckcode')
        return {success:false,result:undefined}
    }
}