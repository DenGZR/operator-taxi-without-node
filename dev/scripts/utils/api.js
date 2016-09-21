import ajax from 'axios'
import * as _Endpoints from './endpoints'
import {Authorisation} from "./Authorisation"
export {_Endpoints as Endpoints}
import { networkManager } from '../utils/service'

const ROOT = 'https://api.psyco.com.ua';
//const ROOT = 'http://testapi.combotaxi.com/';


const config = {
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
};

export const makeRequest = ({path, method}, userData = undefined) => {
    let token;
    let netWorkManager = new networkManager();
    if ( token = Authorisation.getToken()) {
        config.headers['Authorization-Token'] = token;
    }
    return ajax({
        method: method,
        headers: config.headers,
        url: `${ROOT}${path}`,
        data: userData
    })
    .then(response=>{
      // console.log('Server response in api:', response);
      netWorkManager.newResponse(response);
      return {...response, netWorkManager}
    })
};

let timeStamp = 0;
