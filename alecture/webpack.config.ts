import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack, { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isDevelopment = process.env.NODE_ENV !== 'production';

const config: Configuration = {
  name: 'sleact',
  mode: isDevelopment ? 'development' : 'production',
  devtool: !isDevelopment ? 'hidden-source-map' : 'eval',
  resolve: {
    // 바벨이 처리할 확장자 목록
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // tsconfig와 wepack 둘 다 절대경로 설정을 해줘야함
    // tsconfig는 소스 코드를 올바르게 썼는지를  tsconfig를 기반으로 검사해주고(타입스크립트 검사기)
    // webpack은 alias를 기반으로 자바스크립트로 바꿔주기 때문
    alias: {
      '@hooks': path.resolve(__dirname, 'hooks'),
      '@components': path.resolve(__dirname, 'components'),
      '@layouts': path.resolve(__dirname, 'layouts'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@typings': path.resolve(__dirname, 'typings'),
    },
  },
  // entry는 여러개일 수도 있다.
  entry: {
    app: './client',
    // app2: './client'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // babel-loader 가 ts, tsx를 자바스크립트로 바꾸어준다
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                // 타겟 브라우저에 돌아갈 수 있도록 자바스크립트 문법을 변환해준다
                targets: { browsers: ['IE 10'] },
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          env: {
            development: {
              plugins: [['@emotion/babel-plugin', { sourceMap: true }], require.resolve('react-refresh/babel')],
            },
            production: {
              plugins: ['@emotion/babel-plugin'],
            },
          },
        },
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.css?$/,
        // css 파일을 자바스크립트로 변환해준다
        use: ['style-loader', 'css-loader'],
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
    new webpack.EnvironmentPlugin({ NODE_ENV: isDevelopment ? 'development' : 'production' }),
  ],
  output: {
    // __dirname -> alecture
    path: path.join(__dirname, 'dist'),
    // name 은 entry 에서 지정한 값들이 들어간다
    // wepack이 app.js, app2.js 등으로 나오게 됨
    filename: '[name].js',
    publicPath: '/dist/',
  },
  devServer: {
    historyApiFallback: true, // react router
    port: 3090,
    devMiddleware: { publicPath: '/dist/' },
    // cors 에러 방지 위한 client 처리
    // 서버가 같은 출처간 송수신 가능하니까
    // 클라이언트 주소를 3095로 속여서 송수신 하는 것
    // 그러나 실서버와 로컬 간의 통신은 불가함
    // 로컬호스트끼리 가능
    proxy: {
      '/api/': {
        target: 'http://localhost:3095',
        changeOrigin: true,
      },
    },
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
