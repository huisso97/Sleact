import { IChat, IDM } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection(chatList: (IDM | IChat)[]) {
  const sections: { [key: string]: (IDM | IChat)[] } = {};
  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    // 기존에 해당 날짜의 채팅 데이터가 있다면
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
      // 해당 날짜의 채팅데이터가 없다면 리스트 생성
    } else {
      sections[monthDate] = [chat];
    }
  });
  return sections;
}
