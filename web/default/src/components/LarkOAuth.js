import React, { useContext, useEffect, useState } from 'react';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';
import { UserContext } from '../context/User';

const LarkOAuth = () => {
  const [searchParams] = useSearchParams();
  const [, userDispatch] = useContext(UserContext);
  const [prompt, setPrompt] = useState('处理中...');

  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const sendCode = async (retryCount) => {
      const res = await API.get(`/api/oauth/lark?code=${code}&state=${state}`);
      const { success, message, data } = res.data;
      if (success) {
        if (message === 'bind') {
          showSuccess('绑定成功！');
          navigate('/setting');
        } else {
          userDispatch({ type: 'login', payload: data });
          localStorage.setItem('user', JSON.stringify(data));
          showSuccess('登录成功！');
          navigate('/');
        }
        return;
      }

      showError(message);
      if (retryCount === 0) {
        setPrompt('操作失败，重定向至登录界面中...');
        navigate('/setting');
        return;
      }

      const nextRetry = retryCount + 1;
      setPrompt(`出现错误，第 ${nextRetry} 次重试中...`);
      await new Promise((resolve) => setTimeout(resolve, nextRetry * 2000));
      await sendCode(nextRetry);
    };

    if (!code || !state) {
      setPrompt('参数缺失，重定向至设置页面中...');
      navigate('/setting');
      return;
    }

    sendCode(0).catch((error) => {
      showError(error.message);
      setPrompt('操作失败，重定向至设置页面中...');
      navigate('/setting');
    });
  }, [navigate, searchParams, userDispatch]);

  return (
    <Segment style={{ minHeight: '300px' }}>
      <Dimmer active inverted>
        <Loader size='large'>{prompt}</Loader>
      </Dimmer>
    </Segment>
  );
};

export default LarkOAuth;
