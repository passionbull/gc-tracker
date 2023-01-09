import { LinkParams, Link, ImmutableXClient, ImmutableOrderStatus, 
    ImmutableMethodResults, ImmutableMethodParams, ETHTokenType, ERC20TokenType, ERC721TokenType} from '@imtbl/imx-sdk';
import axios from 'axios';
import { NFTType } from "./types_";

// require('dotenv').config();    
const link = new Link('')


export async function getLastDeck(userId:string, god:string){
    console.log('last', userId, god.toLowerCase().split(`'`)[1]);
    var url = `https://us-central1-kogods.cloudfunctions.net/get_last_deck?userId=${userId}&god=${god.toLowerCase().split(`'`)[1]}`
    console.log('last',url);
    const instance = axios.create({
        timeout: 5000,
      });    
    return await instance.get(url);
}


export async function getAssetImage(name:string, quality:number=1) {
    console.log('search start', name);
    const publicApiUrl: string = 'https://api.x.immutable.com/v1';
    const client = await ImmutableXClient.build({ publicApiUrl });
    const info = await client.getAssets({
        collection:'0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
        name
    })
    var sampled_result = info.result.filter( a=>a.name?.toLowerCase() == (name.toLowerCase()));
    if(sampled_result.length ==0){
        sampled_result = info.result.filter( a=>a.name?.toLowerCase()?.includes(name.toLowerCase()));
    }
    console.log('info result', info.result)
    console.log('sampled_result', sampled_result)

    if(sampled_result.length>0){
        console.log(sampled_result[0].name);
        console.log(sampled_result[0].image_url);
        var t = sampled_result[0].image_url;
        if(t!=null) {
            t = t?.substring(0,t.length-1);
            t= t.concat(quality+"");
        }
        var proto:any = sampled_result[0].metadata;
        var mana:number = 0;
        if(proto!=null){
            mana = Number(proto.mana);
            proto = Number(proto.proto);
        }
        if(sampled_result[0].name!=null && t!=null){
            let rrr:NFTType={name:sampled_result[0].name, bgImage:t, proto, mana};
            return rrr;
        }
    }
    else{
        // one more search
        let rrr:NFTType=await getAssetImage(name.slice(0,name.length-1),quality);
        return rrr;
    }
    let rrr:NFTType={name:'', bgImage:'',proto:0, mana:0};
    return rrr;
}
