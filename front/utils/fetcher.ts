import axios from 'axios';

const fetcher = (url: string) => {
  console.log(url);
  axios
    .get(url, {
      withCredentials: true,
    })
    .then((res) => res.data);
};

export default fetcher;
