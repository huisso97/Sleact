import React, { useCallback, useRef } from 'react';
import { Container, Header, DragOver } from '@pages/DirectMessage/styles';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import fetcher from '@utils/fetcher';
import { useInput } from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { IDM } from '@typings/db';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const getKey = (index: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // 끝에 도달
    return `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`; // SWR 키
  };
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(getKey, fetcher);

  const [socket] = useSocket(workspace);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            revalidate();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  return (
    <Container>
      <Header>
        <img src="" />
      </Header>
    </Container>
  );
};

export default DirectMessage;
