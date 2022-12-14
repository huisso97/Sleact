import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Header, DragOver } from '@pages/DirectMessage/styles';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import fetcher from '@utils/fetcher';
import { useInput } from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { IDM } from '@typings/db';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import { toast } from 'react-toastify';
import ChatList from '@components/ChatList';
import gravatar from 'gravatar';

const PAGE_SIZE = 20;
const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const getKey = (index: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // 끝에 도달
    return `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`; // SWR 키
  };
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(getKey, fetcher, {
    onSuccess(data) {
      if (data.length === 1) {
        setTimeout(() => {
          scrollbarRef.current?.scrollToBottom();
        }, 100);
      }
    },
  });

  const [socket] = useSocket(workspace);
  const scrollbarRef = useRef<Scrollbars>(null);
  const [dragOver, setDragOver] = useState(false);

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          // 배열의 맨 앞쪽에 추가
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
          // 메세지 제출에 대한 이벤트 로컬에 저장하여 이후, 안읽은 메세지 처리에서 사용
          localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
          setChat('');
          if (scrollbarRef.current) {
            scrollbarRef.current.scrollToBottom();
          }
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, userData, workspace, id, mutateChat, setChat],
  );

  const onMessage = useCallback(
    (data: IDM) => {
      // id는 상대방 아이디
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              console.log('scrollToBottom!', scrollbarRef.current?.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 100);
            } else {
              toast.success('새 메시지가 도착했습니다.', {
                onClick() {
                  scrollbarRef.current?.scrollToBottom();
                },
                closeOnClick: true,
              });
            }
          }
        });
      }
      // data는 매개변수이므로, dependency에 안넣어도됨
    },
    [id, myData, mutateChat],
  );

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    // 내가 있는 workspace에서 값이 바뀔 때마다(메세지 추가) 읽음처리를 위해 로컬스토리지에 저장
    localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
  }, [workspace, id]);

  useEffect(() => {
    if (chatData?.length === 1) {
      setTimeout(() => {
        scrollbarRef.current?.scrollToBottom();
      }, 100);
    }
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            formData.append('image', file);
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          formData.append('image', e.dataTransfer.files[i]);
        }
      }
      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        setDragOver(false);
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
        mutateChat();
      });
    },
    [workspace, id, mutateChat],
  );
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);
  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        scrollbarRef={scrollbarRef}
        isReachingEnd={isReachingEnd}
        isEmpty={isEmpty}
        chatSections={chatSections}
        setSize={setSize}
      />
      <ChatBox
        onSubmitForm={onSubmitForm}
        chat={chat}
        onChangeChat={onChangeChat}
        placeholder={`Message ${userData.nickname}`}
        data={[]}
      />
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default DirectMessage;
