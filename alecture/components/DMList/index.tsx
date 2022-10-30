import useSocket from '@hooks/useSocket';
import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router';

const DMList: FC = () => {
  const { workspace } = useParams<{ workspace?: string }>();
  const [socket] = useSocket(workspace);

  const [onlineList, setOnlineList] = useState<number[]>([]);
  useEffect(() => {
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
      return () => {
        socket.off('onlineList');
      };
    });
  }, []);
  return <div>DMList</div>;
};

export default DMList;
