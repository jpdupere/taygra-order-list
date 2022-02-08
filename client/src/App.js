import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

function App() {
  // fetching the GET route from the Express server which matches the GET route from server.js
  const [backendMsg, setBackendMsg] = useState('');
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    fetch('/backend').then(async (res) => {
      const message = await res.text();
      setBackendMsg(message);
    });
  });

  useEffect(() => {
    fetch('/line-items').then(async (res) => {
      const li = await res.json();
      console.log(li);
      setLineItems(li);
    });
  });

  const listItems = lineItems.map(lineItem => 
    <ListItem>
      <ListItemAvatar>
        <Avatar src={lineItem.imgSrc} variant='square'></Avatar>
      </ListItemAvatar>
    </ListItem>
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Alert severity="success">
          {backendMsg}
        </Alert>
        
      </header>
    </div>
  );
}

export default App;
