import fetcher from '@utils/fetcher';
import React, { useState } from 'react';
import useSWR from 'swr';

const LogIn = () => {
  const { data, error } = useSWR('/api/users', fetcher);
  const [loginInError, setloginInError] = useState('');
  return <div>LogIn</div>;
};

export default LogIn;
