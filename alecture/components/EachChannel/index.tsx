import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useEffect, VFC } from 'react';
import { useLocation, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';

interface Props {
  channel: IChannel;
}

const EachChannel = ({ channel }: Props) => {
  const { workspace } = useParams<{ workspace?: string }>();
  const location = useLocation();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, {
    dedupingInterval: 2000,
  });

  // 마지막으로 로컬에 저장한 채팅 내역 시간
  const date = localStorage.getItem(`${workspace}-${channel.name}`) || 0;
  // 위의 시간 이후에 대한 메세지를 안읽은 메시지 갯수로 가져옴
  const { data: count, mutate } = useSWR<number>(
    userData ? `/api/workspaces/${workspace}/channels/${channel.name}/unreads?after=${date}` : null,
    fetcher,
  );

  useEffect(() => {
    // 내가 지금 있는 채널이 여러개의 채널들 중 하나와 같다면 해당 방에 있는 것이므로
    if (location.pathname === `workspace/${workspace}/channel/${channel.name}`) {
      // 모두 다 읽음 처리 === 0
      mutate(0);
    }
  }, [mutate, location.pathname, workspace, channel]);
  return (
    <NavLink key={channel.name} activeClassName="selected" to={`/workspace/${workspace}/channel/${channel.name}`}>
      <span className={count !== undefined && count > 0 ? 'bold' : undefined}># {channel.name}</span>
      {count !== undefined && count > 0 && <span className="count">{count}</span>}
    </NavLink>
  );
};

export default EachChannel;
