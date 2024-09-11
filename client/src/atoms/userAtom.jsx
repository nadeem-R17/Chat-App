import { atom } from 'recoil';

export const userState = atom({
    key: 'userState',
    default: [],
});

export const newUserState = atom({
    key: 'isNewUserState',
    default: false,
});

export const tokenState = atom({
    key: 'tokenState',
    default: '',
});


