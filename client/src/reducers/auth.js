import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    DELETE_ACCOUNT
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuth: null,
     loading: true,
     user: null
}

export default function(state=initialState, action) {
    const {type, payload} = action;
    switch(type){
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem('token', payload.token);
            return {
                ...state, ...payload,
                isAuth: true,
                loading: false
            }
        case REGISTER_FAIL:
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT:
        case DELETE_ACCOUNT: 
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuth: false,
                loading: false
            }
        case USER_LOADED:
            return {
                ...state,
                loading: false,
                isAuth:true,
                user:payload 
            }  
        default:
            return state
    }
}