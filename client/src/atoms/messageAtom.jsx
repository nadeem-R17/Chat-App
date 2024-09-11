import { atom } from 'recoil';

export const directMessageState = atom({
    key: 'directMessageState',
    default: [],
});

export const groupMessageState = atom({
    key: 'groupMessageState',
    default: [],
});