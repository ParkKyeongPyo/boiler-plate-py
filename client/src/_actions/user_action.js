import axios from 'axios';
import {LOGIN_USER} from '../_actions/types';
import {REGISTER_USER} from '../_actions/types';

export function loginUser(dataToSubmit) {

    const request = axios.post('/api/users/login', dataToSubmit)
        .then( response => response.data )

    return {
        type: "LOGIN_USER", 
        payload: request
    }
}

export function RegisterUser(dataToSubmit) {

    const request = axios.post('/api/users/register', dataToSubmit)
        .then( response => response.data )

    return {
        type: "REGISTER_USER", 
        payload: request
    }
}