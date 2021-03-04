const path = require('path');
const express = require('express');

const app = express(); //создание приложения express
const server = require('http').createServer(app); //создание сервера, который работает через приложение app
//говорим, что хотим просто создать http-сервер
//теперь сервер рарботает через наше веб-приложение, через переменную app
const io = require('socket.io')(server, { cors: { origin: '*' } }); //подключение сокетов к серверу

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
app.use(express.static('../build'));
app.use(express.json()); //посредник, который будет получать в теле самого запроса json данные

const rooms = new Map(); //типа БД

app.get('/rooms/:id', (req, res) => {
  const { id: roomId } = req.params;
  const obj = rooms.has(roomId) //проверка на "есть ли комната?"
    ? {
        users: [...rooms.get(roomId).get('users').values()],
        messages: [...rooms.get(roomId).get('messages').values()],
      }
    : { users: [], messages: [] };
  res.json(obj);
});

app.post('/rooms', (req, res) => {
  const { roomId, userName } = req.body; //то, что пришло
  if (!rooms.has(roomId)) {
    //если среди всех комнат нет той, которую передаем, то создаем новую
    rooms.set(
      roomId,
      new Map([
        ['users', new Map()],
        ['messages', []],
      ]),
    );
  }
  res.send();
});

io.on('connection', (socket) => {
  socket.on('ROOM:JOIN', ({ roomId, userName }) => {
    //ROOM - область, JOIN - тип действия, можно написать и "юзер вошел"
    socket.join(roomId); //подключаемся к сокету, в определенную комнату
    rooms.get(roomId).get('users').set(socket.id, userName); //в конкретной комнате, в конкретной коллекции пользователей сохранили конкретного пользователя
    const users = [...rooms.get(roomId).get('users').values()]; //получаем имена пользователей из комнаты, чтобы получить ключи, нужно ввести вместо values - keys
    socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users); //информацию получат только пользователи, которые находятся в данной комнате, без .to(roomId) уведомления получат все, broadcast - говорит "всем, кроме меня"
  });

  socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
    const obj = {
      userName,
      text,
    };
    rooms.get(roomId).get('messages').push(obj);
    socket.to(roomId).broadcast.emit('ROOM:NEW_MESSAGE', obj);
  });

  socket.on('disconnect', () => {
    rooms.forEach((value, roomId) => {
      if (value.get('users').delete(socket.id)) {
        //если пользователь нашелся и удалился, то true
        const users = [...value.get('users').values()];
        socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
      }
    });
  });
  // console.log('user connected', socket.id);
});

server.listen(PORT, (error) => {
  if (error) {
    throw Error(error);
  }
  console.log('Сервер запущен!');
});
