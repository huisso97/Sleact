# SLEACT 타임어택 1기

## 프론트엔드 초기 세팅하기(CRA X)

### 1. package.json 생성

```bash
// package.json 생성 명령어
npm init

```

- package name 은 npm package와 동일한데, 만약 동일한 패키지를 설치하게 되면 에러가 발생한다.

### 2. eslint 및 prettier 설치

- eslint 코드 검사 도구 : 안쓰는 변수나 문법 검사한다.
- prettier: 코드 자동 정렬 도구 -> 협업 과정에서 중립적인 역할을 한다.
- 확장자가 없으면서(json 혹은 js으로 확장자가 있는 경우도 있음) `.` 으로 시작하는 파일들은 설정파일들로, 다 숨김 파일로 처리된다.
  - ex) `.prettierrc`

### 3. tsconfig,json 설정

- 타입스크립트는 결국 자바스크립트로 바뀌는데, tsconfig.json을 기반으로 하여 자바스크립트로 바뀐다.
- 각 속성 설명

  ```json
  {
    "compilerOptions": {
      // 원래는 node modules 가 import * as React from "react"; 형태로 임포트하는데,
      // esModuleInterop을 true로 하면 import React from "react"; 형태로 임포트할 수 있음
      "esModuleInterop": true,
      // sourceMap : 코드가 에러났을 때, 에러가 난 원래 파일 소스로 갈 수 있는 속성
      "sourceMap": true,
      // 최신 자바스크립트 문법과 dom을 라이브러리로 쓴다는 속성
      "lib": ["ES2020", "DOM"],
      // react jsx로 쓴다는 속성
      "jsx": "react",
      // module을 최신 모듈로 쓴다는 속성
      "module": "esnext",
      // import를 노드가 해석할 수 있도록 하겠다
      "moduleResolution": "Node",
      // 소스코드를 es2020으로 작성하더라도 es5로 변환하겠다
      "target": "es5",
      // 타입 체킹을 엄격히 하겠다
      "strict": true,
      // import json을 허락하겠다
      "resolveJsonModule": true,
      // 절대경로처럼 import 할 수 있는 설정
      "baseUrl": ".",
      "paths": {
        "@hooks/*": ["hooks/*"],
        "@components/*": ["components/*"],
        "@layouts/*": ["layouts/*"],
        "@pages/*": ["pages/*"],
        "@utils/*": ["utils/*"],
        "@typings/*": ["typings/*"]
      }
    },
    "ts-node": {
      "compilerOptions": {
        "module": "commonjs",
        "moduleResolution": "Node",
        "target": "es5",
        "esModuleInterop": true
      }
    }
  }
  ```

### 4. babel 설정

- babel 설정에 쓰이는 패키지들을 설치하고, 웹팩 파일에서 설정한다.
  - `HTML`, `CSS`, `JavaScript` 들의 단점들을 보완하고자 추가 설정된다.

```bash
npm i -D webpack @babel/core babel-loader @babel/preset-env @babel/preset-react
// 타입스크립트의 경우: 타이핑 추가
npm i -D @types/webpack @types/node babel/preset-typescript style-loader css-loader
```

- **결국에 브라우저는 `HTML`, `CSS`, `JavaScript`를 인식하기 때문에, SCSS나 타입스크립트 등이 변환되어야한다.**
  - 그래서 타입스크립트가 바벨을 거쳐 자바스크립트로 변환하는 작업을 처리한다.
- 설정 설명

```typescript
import path from "path";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import webpack, { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const isDevelopment = process.env.NODE_ENV !== "production";

const config: Configuration = {
  name: "sleact",
  mode: isDevelopment ? "development" : "production",
  devtool: !isDevelopment ? "hidden-source-map" : "eval",
  resolve: {
    // 바벨이 처리할 확장자 목록
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    // tsconfig와 wepack 둘 다 절대경로 설정을 해줘야함
    // tsconfig는 소스 코드를 올바르게 썼는지를  tsconfig를 기반으로 검사해주고(타입스크립트 검사기)
    // webpack은 alias를 기반으로 자바스크립트로 바꿔주기 때문
    alias: {
      "@hooks": path.resolve(__dirname, "hooks"),
      "@components": path.resolve(__dirname, "components"),
      "@layouts": path.resolve(__dirname, "layouts"),
      "@pages": path.resolve(__dirname, "pages"),
      "@utils": path.resolve(__dirname, "utils"),
      "@typings": path.resolve(__dirname, "typings"),
    },
  },
  // entry는 여러개일 수도 있다.
  entry: {
    app: "./client",
    // app2: './client'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // babel-loader 가 ts, tsx를 자바스크립트로 바꾸어준다
        loader: "babel-loader",
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                // 타겟 브라우저에 돌아갈 수 있도록 자바스크립트 문법을 변환해준다
                targets: { browsers: ["IE 10"] },
                debug: isDevelopment,
              },
            ],
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          env: {
            development: {
              plugins: [require.resolve("react-refresh/babel")],
            },
          },
        },
        exclude: path.join(__dirname, "node_modules"),
      },
      {
        test: /\.css?$/,
        // css 파일을 자바스크립트로 변환해준다
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
      // eslint: {
      //   files: "./src/**/*",
      // },
    }),
    // 리액트에서 NODE_ENV라는 변수를 사용할 수 있게 해준다(원래는 NODE_ENV는 백엔드나 Node runtime에서만 사용 가능)
    new webpack.EnvironmentPlugin({
      NODE_ENV: isDevelopment ? "development" : "production",
    }),
  ],
  output: {
    // __dirname -> alecture
    path: path.join(__dirname, "dist"),
    // name 은 entry 에서 지정한 값들이 들어간다
    // wepack이 app.js, app2.js 등으로 나오게 됨
    filename: "[name].js",
    publicPath: "/dist/",
  },
  devServer: {
    historyApiFallback: true, // react router
    port: 3090,
    devMiddleware: { publicPath: "/dist/" },
    static: { directory: path.resolve(__dirname) },
  },
};

// 개발 환경일 때 쓸 플러그인들
if (isDevelopment && config.plugins) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new ReactRefreshWebpackPlugin());
}
// 배포환경일 때 쓸 플러그인들
if (!isDevelopment && config.plugins) {
}

export default config;
```

### 5. index.html 생성

- webpack에서 `CSS`와`JS`를 처리했으니, index.html로 `HTML`을 처리한다.

- id가 "app"인 태그에 jsx로 만든 태그들이 들어간다.
- 즉, ` <script src="/dist/app.js"></script>` 가 ` <div id="app"></div>` 을 채워넣는다.

---

## 로그인, 회원가입 만들기

### 1. 커스텀 훅 만들기

### 2. axios로 요청 보내기와 CORS, proxy

```typescript
// pages/SignUp/index.tsx

...
const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!mismatchError && nickname) {
        console.log('서버로 회원가입하기');
        // 비동기 로직에서 setState 등 값을 바꾸려고 할 때, 무조건
        // 해당 함수를 초기화하고 값을 갱신해라
        // 그렇지 않으면, 2회 이상 연속 비동기 요청 보내는 상황 등이
        // 왔을 때, 1번째 요청때 담아놨던 결과가 2번째 요청때 그대로
        // 담겨있는 현상이 생기기 때문
        // 즉 요청 보내기 이전의 결과가 담아있을 수 있기 때문에
        // 초기화 후, 요청을 받아오자
        axios
          // proxy를 설정했기 때문에 앞의 호스트명과 포트번호를 안적어도됨
          .post('api/users', {
            email,
            nickname,
            password,
          })
          .then((res) => {
            setSignUpSuccess(true);
          })
          .catch((error) => {
            setSignUpError(error.response.data);
          });
      }
    },
    [email, nickname, password, mismatchError],
  );
...
```

### 3. swr 사용하기(+쿠키 공유하기)

swr은 다른 탭에 갔다가 오면, API에 재요청을 보내 데이터를 갱신한다.

#### 쿠키

- 프론트엔드와 백엔드 서버가 다르면 백엔드에서 프론트엔드로 쿠키를 생성해줄 수 없고, 프론트엔드에서 백엔드로 쿠키를 보내줄 수 없다.
- 이를 위해 **withCredentials : true** 를 설정하여 백엔드에서 쿠키를 생성하여 프론트엔드가 쿠키를 받아 백엔드에 주고 인증을 받는다.
- GET요청에서는 2번째 자리, POST요청에서는 3번째 자리에 설정한다.

#### 왜 변수 사용을 let이 아닌 useState로 할까?

- let으로 변수를 선언 후, 특정 조건에서 값을 바꾸는 로직을 작성한다고 가정해보자
- 그러나 다른 렌더링을 유발하는 이벤트로 인해, 해당 컴포넌트가 다시 실행되고, 이에 따라 변수가 다시 선언되어 true가 되기 때문에 useState를 쓴다.

```javascript
...
let value = true;

const onChange = (e) => {
  // 이렇게 값을 바꾸어도 리렌더링 됐을 때, value는 true 다시 바뀜
  value = false;
}

return (
  <div>
  <input onChange={onChange} value={name}/>
  </div>
)
```

#### swr revalidate

swr이 제공하는 기능 중, **revalidate**라는 기능이 있다.

**revalidate**는 주기적으로 서버에 호출하는 기능이며, **dedupingInterval** 기간 내에는 캐시에서 데이터를 불러온다.

### 4. 워크스페이스 만들기 + 로그아웃하기

#### return문의 위치는?

Login과 Signup page에서 유저 데이터가 있을 때, workspace로 Redirect를 한다.

이 과정에서, 아래 코드와 같이 return 문을 활용하여 Redirect 시키는데, 항상 리턴문은 hook 밑에서 실행시켜야한다.

```typescript
// 상단에 모든 hook들이 있습니다.
...

  if (data) {
    return <Redirect to="/workspace/channel" />;
  }
...
```

### 5. SWR 활용하기

#### mutate

swr에서 optimistic UI를 위해 **mutate**라는 메서드를 제공한다.

처음에는 서버 요청없이 데이터가 동작하다가 나중에 서버에 데이터 요청을 하여 검사를 한다. 요청 과정에 에러가 있으면 취소하는 메커니즘을 통해, 사용자에게 더욱 긍정적인 UI를 제공하게 된다.

예를 들어, 인스타그램에서 좋아요를 눌렀을 때, 우선 클라이언트에서 좋아요를 눌러서 색상이 변경되는 등 서버에 요청 없이 데이터를 변경한다. 그 후, mutate의 revalidate 속성이 true일 때, 서버에 확인 요청을 보내어 요청에 에러가 있을 시, 좋아요 하트를 취소하도록 작동한다.

```typescript
...
// 여기서의 mutate는 해당 키를 가진 swr에서의 mutate이기 때문에, 하단의 mutate 코드 작성 시, 키는 따로 작성하지 않아도 된다.
// mutate의 첫번째 인자는 데이터이고, 두번째 인자는 shouldrevalidate로 true일 시, 서버에 요청을 보내어 확인한다.
const { data, error, mutate } = useSWR('/api/users', fetcher);
...
.then((response) => {
          mutate(response.data, false);
        })
...
```

#### dedupingInterval

```typescript
// dedupingInterval -> 지정한 시간 동안은 해당 api 요청을 수십번 해도 해당 시간동안은 한 번 밖에 안한다.
const { data, error, mutate } = useSWR("/api/users", fetcher, {
  dedupingInterval: 100000,
});
```

#### 전역 상태 관리자로서의 swr

swr은 비동기 요청뿐만 아니라, 전역 상태 관리 역할도 할 수 있다.

A컴포넌트에서 데이터를 localstorage에 저장한 후, B컴포넌트에서 localstorage로 데이터를 가져올 수 있다.

```typescript
// A.tsx
const { data } = useSWR("hello", (key) => {
  localstorage.setItem("data", key);
  return localstorage.getItem(key);
});

// B.tsx
const { data } = useSWR("hello");
```

---

## 메뉴와 모달 만들기

### 1. 메뉴 모달, 채널 모달

#### 모달의 input이 많아 다른 컴포넌트들에 대한 리렌더링이 빈번히 일어나는 경우, 컴포넌트를 분리하여 유지보수성과 재사용성을 높이자!

-> `CreateChannelModal`,`inviteWorkspaceModal` 참고

#### Invalid hook call ~ 에러

- 위의 에러는 return 함수 하단 혹은 if문/반복문/return문 안에 hook을 사용했을 때 발생하는 에러이다.

### 2. 라우터 주소 설계

- 라우트 파라미터로 값을 여러 형태로 바꿀 수 있다.
- 그러나 파라미터가 아닌 값과 함께 쓴다면, 파라미터가 아닌 라우터 먼저 작성 후, 파라미터 경로로 된 라우터를 작성해야 한다.
- 이는 파라미터 경로가 먼저 선언되었을 때, 파라미터가 아닌 경로도 파라미터 경로로 걸쳐지기 때문이다.

```javascript
// 파라미터가 아닌 경로 먼저 작성
<Route path="workspace/workspace" />
<Route path="/workspace/:workpspace"/>
```

### <Challenge> CreateWorkspaceModal 만들기

강의에서는 workspace 생성 모달을 따로 컴포넌트로 분리하지 않아서, 메뉴 모달과 채널 모달 컴포넌트 분리 방식을 학습 후,
기존의 workspace 모달을 컴포넌트로 분리하였다.
`CreateWorkspaceModal` 참고

## DM 보내기

### 1. DM 목록 만들기

#### NavLink

- Link와 같이 `to` 속성을 사용하여 이동시키는 태그이다.
- 차이점은 `activeClassName`라는 속성을 통해, 지금 주소와 NavLink의 주소가 같으면, 해당 속성에 대한 className을 부여할 수 있다.
- Sleact에서는 DMList에서 유저 리스트 하이라이트 기능에 구현되어있다.

### 2. 재사용에 따른 props 받기

#### onSubmitForm

`ChatBox` 컴포넌트는 DM과 Channel 두 컴포넌트에서 사용하여 재사용이 가능하다.
그렇기 때문에, `ChatBox` 안에서 Submit 함수를 구현하는 것이 아니라, 부모 컴포넌트(DM && Channel)에서 구체적으로 함수를 구현한 후, 자식 컴포넌트에서 props로 받아와 각각의 컴포넌트 기능이 동작하도록 코드를 작성한다.

### 3. eslint - react-app

#### useEffect dependency 추천 기능

- eslint 파일 내 아래와 같이 react-app을 추가하게 되면, React hook dependency에서 우리가 놓친 부분들을 추천해주는 기능이 작동한다. (누락시dependency에 노랑색으로 경고 표시)

```javascript
{
  "extends":["plugin:prettier/recommend","react-app"]
}
```

- 추가로, 다음 5가지 패키지도 함께 추가하여 더 견고하게 코딩을 할 수 있다.

```bash
npm i -D eslint-config-react-app eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-ally eslint-plugin-react
```

## 실시간 채팅 및 프론트 기술 배우기

### 1. socket.io 이벤트 연결하기

#### 이벤트 리스너 연결 및 정리하기

- socket 등 이벤트 리스너로 서버와 연결을 했으면, return문에서 해당 이벤트 리스너를 정리해야한다.
- 그렇지 않으면, 이벤트 리스너가 서버에 2번 이상 연결이 된다.
  ```typescript
  useEffect(() => {
    socket?.on("onlineList", (data: number[]) => {
      setOnlineList(data);
      return () => {
        socket.off("onlineList");
      };
    });
  }, []);
  ```

#### receiveBuffer & sendBuffer (socket.io의 제공 기능)

socket에서 receiveBuffer 와 sendBuffer는 클라이언트와 서버의 연결이 끊겨있을 때, 보내고 받을 데이터들을 모아놓은 곳이다.

- receiverBuffer는 서버에서 보낼 데이터들을 담아놓고,
- sendBuffer는 클라이언트에서 보낼 데이터들을 담아놓아 다시 연결이 되었을 때, 해당 데이터들을 송수신한다.

### 2. DM 내용 표시하기

#### 관심사 분리시키기

`ChatList`와 같은 재사용이 일어나는 컴포넌트는 보여줄 데이터들이 채팅과 디엠이기 때문에 각각의 데이터들을 `ChatList`에서 요청하여 받기 보다는, props를 통해서 처리하여 관심사를 분리시킨다.

### 3. 커스텀 스크롤바

#### 커스텀 스크롤바

`react-custom-scrollbars`

- 기본적으로 div 역할을 한다.
- autoHide : 스크롤바 사라지는 속성
- onScrollFrame : 스크롤 이벤트 속성
- ref : 스크롤 위치 ref

### 4. 멘션 기능 만들기

#### 멘션 기능

`react-mentions`

```javascript
<Mention
  trigger="@"
  data={this.props.users}
  renderSuggestion={this.renderUserSuggestion}
/>
```

- trigger : 멘션 기능을 트리거할 문자열
- data : 트리거할 데이터 (id와 dsiplay를 key로 가지고 있는 객체)
- renderSuggestion : 트리거된 데이터들을 보여줄 컴포넌트

#### emotion 동적 스타일링

- styled components 와 emotion은 변수 값에 따라 동적으로 스타일을 설정할 수 있다.
  여기서 스타일 코드를 보면 백틱을 사용하여 표현하는데, 이 또한 함수 호출 방식 중 하나이다.

```css
export const CollapseButton = styled.button<{ collapse: boolean }>`
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 10px;
  cursor: pointer;
  ${({ collapse }) =>
    collapse &&
    `
    & i {
      transform: none;
    }
  `};
`;
```

##### 함수 호출 방법들

```javascript
function a();
a();
a.bind()();
a.apply();
a.call();
a``; // tagged template literal
// 안에 인자를 넣을 수 있다.
a`${()=> `${()=> ``}}`;
// 위와 같이 템플릿 리터럴 이므로, 리털럴 안에 또 새로운 템플릿 리터럴 인자를 넣을 수 있다.
```

### 5. 정규표현식으로 문자열 변환하기

`regexify-string`

- `|d` : 숫자
- `+` : 0개 이상 (최대한 많이 찾음)
- `+?` : 최대한 조금 찾음
- `?` : 0개나 1개
- `.` : 모든 문자
- `g` : 모두 찾기
- `\n` : 띄어쓰기

```javascript
const result = regexifyString({
  input: data.content, // 정규표현식을 적용할 데이터

  pattern: /@\[.+?\]\(\d+?\)|\n]/g,
  // pattern에 매칭되는 데이터를 처리하는 함수
  decorator(match, index) {
    const arr = match.match(/@\[.+?\]\(\d+?\)/)!;
  },
});
```

### 6. 날짜별로 묶어주기

#### 불변성 유지하며 리스트 다루기

- 최신 채팅 내용을 map함수로 돌렸을 때, 아래에 나올 수 있도록 하기 위해 `chatData`를 reverse 로 바꿔야한다.
- 그러나 `chatData.reverse()`로 적용을 하면, 기존 배열이 바껴 immutable(불변성)이 깨지기 때문에,
- 새 배열로 만들어 메서드를 적용하도록 구현하는 것이 좋다.

##### 1번째 방식 : 빈 배열에 concat 함수를 사용하여 새 리스트 만들기

```javascript
[].concat(...chatData);
```

##### 2번째 방식 : 스프레드로 복사

```javascript
[...chatData];
```

### 7. 리버스 인피니트 스크롤

#### forwardRef

- scrollbar ref를 ref가 사용되는 컴포넌트(ChatList)가 아닌, 다른 컴포넌트(DirectMessage)에서 생성하여 넘겨받아 사용할 때, ChatList와 같은 컴포넌트를 forwardRef로 감싸 사용한다.
- 이렇게 데이터를 이동시키는 이유는 DirectMessage에서 채팅을 쳤을 때 스크롤 위치가 이동되도록 하는 등, scrollbar ref 값을 조정하는 곳이 DirectMessage이하므로, 해당 데이터값을 핸들링하는 DirectMessage로 옮기는 것이다.
- 그리고 실질적으로 ref에 따른 UI 렌더링은 ChatList에서 하므로, 해당 ref를 forwardRef로 받아 처리한다.

#### useSWRInfinite

##### 반환값

- setSize : 데이터에서 가져와야할 페이지 수 설정 함수
- getKey : 각 페이지의 swr 키를 얻기 위한 함수
  - fetcher에 의해 해당 키의 값을 반환
  - null 이 반환되면 페이지 요청을 하지 않는다.

```javascript
	// getKey의 경우, 기존 코드를 docs에 맞춰 리팩토링 진행
    const getKey = (index, previousPageData) => {
      if (previousPageData && !previousPageData.length) return null // 끝에 도달
      return `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}` // SWR 키
    };
    const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
      getKey,
      fetcher,
    );
```

#### optimistic UI (사용성 > 안정성)

- 기존에는 post 요청에 대한 리턴값을 기반으로 scrollbar를 내리다보니, 2~3초 정도의 지연 시간이 걸렸다.
- UX를 개선하기 위해, SWR의 `mutate`를 사용하여 Optimistic UI를 구현한다.

##### 코드 설명

- 먼저 UI에서는 scrollbar를 내리고
- 이후 post 요청으로 서버에 데이터 갱신 처리

```javascript
const onSubmitForm = useCallback(
  (e) => {
    e.preventDefault();
    if (chat?.trim() && chatData) {
      const savedChat = chat;
      // mutate 함수로 클라이언트 데이터 상태를 먼저 변경한다.
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
        setChat("");
        scrollbarRef.current?.scrollToBottom();
      });
      // mutate 후, server에 post 요청을 보내어 데이터를 바꾼 후,
      axios
        .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
          content: chat,
        })
        .then(() => {
          // 성공적으로 서버와의 데이터 처리가 완료되면. revalidate 실행
          revalidate();
        })
        .catch(console.error);
    }
  },
  [chat, chatData, myData, userData, workspace, id]
);
```

## 마무리하기

### 채널 만들기

#### extends

- 제너릭 타입 `T`에 특정 타입으로 제한을 걸 때, extends 를 사용하여 제한한다.

```typescript
export const useInput = <T extends string | number>(
  initialData: T
): ReturnTypes => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as unknown as T);
  }, []);

  return [value, handler, setValue];
};
```

### 타입 점검하기(타입 가드)(feat.revalidate)

#### 타입 가드

타입 가드 : 타입스크립트가 if문을 통해 타입을 더 자세하게 추론해주는 기능

```typescript
function a(b: number | number[]) {
  if (typeof b === "number") {
    b.toFixed();
  }
  if (Array.isArray(b)) {
    b.forEach(() => {});
  }
  b.forEach(() => {}); // Type Error
}
```

#### mutate 이후, revalidate를 쓰는 이유

서버에서 최종 데이터 처리한 값을 기준으로 클라이언트 state를 재갱신하기 위해 사용한다.

예를 들어, optimistic UI로 client에서 상태값을 바꾼 후 서버에 요청을 보냈을 때, 유저 네트워크 환경에 따라 서버 순서와 optimistic UI 순서가 다른 경우가 발생한다.(예 : 채팅 보낸순서)
이때, revalidate를 통해 서버 순서로 state를 재갱신한다.

### 배포 준비하기

`webpack-bundle-analyzer` : 소스코드를 압축하는 패키지

- html로 나오는(analyzerMode가 static일 때) 번들 파일들 중에서 크기가 크거나 성능에 영향이 미칠 패키지들을 선별하여 코드 스플리팅 및 트리 쉐이킹을 통해 최적화한다.
- `wepkac.config.js` 에 아래의 코드를 추가한다.

```javascript
// wepack.config.js
...
// 개발모드
if (isDevelopment && config.plugins) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new ReactRefreshWebpackPlugin());
  config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }));
}
// 배포모드
if (!isDevelopment && config.plugins) {
  config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));
  config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

export default config;
```

### 이미지 드래그 업로드하기

`onDragOver` : 이미지를 눌러서 드래그하는 동안 발생하는 이벤트
`onDrop` : 이미지를 놓았을 때 발생하는 이벤트

- 위의 함수 로직들은 MDN문서에 정리되어있음
  DragEvent MDN 문서 : https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items
  FormData 제로초님 블로그 : https://www.zerocho.com/category/HTML&DOM/post/59465380f2c7fb0018a1a263

### 안 읽은 메시지 개수 표시하기

- workspace 및 direct message 에서 특정한 동작이 이루어졌을 때, 해당 시점을 localStorage에 저장한다.
- 그리고 아래와 같이, 마지막으로 저장된 시점을 가져와 서버에 해당 시점 이후의 메세지 갯수를 받는다.

```typescript
const date = localStorage.getItem(`${workspace}-${channel.name}`) || 0;
const { data: count, mutate } = useSWR<number>(
  userData
    ? `/api/workspaces/${workspace}/channels/${channel.name}/unreads?after=${date}`
    : null,
  fetcher
);
```

### SWR Devtools 소개

## 에러 처리

### MYSQL 관련 에러

```bash
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1361:8)
    at processTicksAndRejections
(node:internal/process/task_queues:83:21) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3095
}
[nodemon] app crashed - waiting for file changes before starting..
```

실수로 npm install을 했었던 상황에서 yarn start를 한 이유인지, 다음과 같은 에러 충돌이 발생하였다.

1. node modules 삭제 -> 실패
2. 알고보니, MYSQL CONNECTION이 끊어져 있었음
   - MYSQL을 지우고, 새로 DB를 생성함 (해결 완료)

### 회원가입 관련 요청이 다른 API로 보내지는 현상

```
api/users로 요청이 보내져야하는데, 계속 https://sleact.nodebird.com/api/user 로 요청이 보내져 404 에러가 반환되는 현상이 발생했다.
에러 사진은 하단과 같다.
```

**최종적인 발생 원인은 baseURL 지정 코드에 문제가 있었던 것으로 확인이 되었다.**

![image-20221016171618923](README.assets/image-20221016171618923.png)

- 시도한 방법들은 다음과 같다.

  1. api url 을 확인하다 => 옳게 작성하였다.

  2. package-lock.json 과 node_modules를 프론트 및 백엔드 폴더에서 삭제 후, 재설치를 시도해았다.

  3. backend 및 frontend 재초기 세팅

     - 여기서 db 연결 후,`npx sequelize db:seed:all` 를 했을 때, 다음과 같은 에러가 발생했다.

       - 유추한건데, 마이그레이션 과정에서 에러가 발생한 것으로 판단하여 MYSQL workspace를 삭제 및 다시 세팅하였으나, 해결되지 않았다.

       ```bash
       Loaded configuration file "config\config.js". Using environment "development". == 20201019065847-sleact: migrating ======= ERROR: Validation error
       ```

       - 결국, config.js에서 DB이름을 sleact -> sleact2로 변경후, 다시 create && sequelize 명령을 통해 세팅을 마쳤다.
       - 재세팅한 코드와 기존 코드의 차이점을 찾아보니, baseURL을 설정하는 코드의 유무였다.
       - 이번을 계기로 api 요청 에러 관련 디버깅 시, URL 세팅 구간부터 차근차근 확인해야겠다 깨닫게 되었다.
