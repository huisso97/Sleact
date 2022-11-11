import { IUser } from '@typings/db';
import React from 'react';

interface Props {
  onSubmitForm: (e: any) => void;
  chat?: string;
  onChangeChat: (e: any) => void;
  placeholder: string;
  data?: IUser[];
}

const ChatBox = ({ onSubmitForm. chat, onChangeChat, placeholder, data}:Props) => {
  return <div>ChatBox</div>;
};

export default ChatBox;
