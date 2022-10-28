import { useCallback } from 'react';
import io from 'socket.io-client';

const backUrl = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (workspace: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      // transports: polloing 하지 않고, websocket으로만 연결할 것이다라고 설정하는 속성
      transports: ['websocket'],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
