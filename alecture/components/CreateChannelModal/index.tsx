import Modal from '@components/Modal';
import { useInput } from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useSWR from 'swr';
interface Props {
  show: boolean;
  onCloseModal: (e: any) => void;
  setShowCreateChannelModal: (flag: boolean) => void;
}

const CreateChannelModal: FC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {
  const { workspace } = useParams<{ workspace?: string }>();
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
  const { data: userData } = useSWR<IUser | false>('/api/users', fetcher);
  // swr이 userData 유무에 따라서 요청 결정
  const { mutate: revalidateChannel } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );
  const onCreateChannel = useCallback(
    (e) => {
      e.preventDefault();
      if (!newChannel || !newChannel.trim()) {
        return;
      }
      axios
        .post(`/api/workspaces/${workspace}/channels`, {
          name: newChannel,
        })
        .then(() => {
          revalidateChannel();
          setShowCreateChannelModal(false);
          setNewChannel('');
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newChannel, revalidateChannel, setNewChannel, setShowCreateChannelModal, workspace],
  );
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널 이름</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button>생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
