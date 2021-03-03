import React from 'react';
import axios from 'axios';

function JoinBlock({ onLogin }) {
  const [roomId, setRoomId] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);

  const [textRoom, setTextRoom] = React.useState(false);
  const [textName, setTextName] = React.useState(false);

  const onEnter = async () => {
    if (!roomId) {
      setTextRoom(true);
    } else {
      setTextRoom(false);
    }
    if (!userName) {
      setTextName(true);
    } else {
      setTextName(false);
    }

    if (!roomId || !userName) {
      return alert('Неверные данные');
    }

    setLoading(true);
    const obj = { roomId, userName };
    await axios.post('/rooms', obj);
    onLogin(obj);
  };

  return (
    <div className="wrapper">
      <input
        className="inputs"
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}></input>
      {textRoom ? 'Введите ID комнаты' : ''}
      <input
        className="inputs mt"
        type="text"
        placeholder="User name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}></input>
      {textName ? 'Введите имя' : ''}

      <button onClick={onEnter} type="button" className="btn btn-primary">
        {isLoading ? 'ВХОД...' : 'ВОЙТИ'}
      </button>
    </div>
  );
}

export default JoinBlock;
