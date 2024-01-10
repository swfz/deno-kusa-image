const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const fs = require('fs');

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('*', (req, res) => {
  const user = req.body.variables['user'];
  const filename = user === '' ? 'not_exist_user.json' :
    user === 'swfz' ? 'contributions.json' : 'contributions2.json';
  res.status(201).json(JSON.parse(fs.readFileSync(filename)));
});

server.listen(8000, () => {
  console.log('JSON Server is running');
});