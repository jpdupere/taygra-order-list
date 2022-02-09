import './App.css';
import {useState, useEffect} from 'react';
import List from '@mui/material/List';
import LineItem from './Components/LineItem';
import { ThemeProvider, createTheme, CssBaseline, Container, Card, Grid, Paper, AppBar, Toolbar, Typography, Button } from '@mui/material';

function App() {
  const [lineItems, setLineItems] = useState([]);

  const theme = createTheme({
    palette: {
      mode: 'dark',
    }
  });

  const fetchLineItems = async () => {
    const res = await fetch('/line-items')
    const li = await res.json();
    console.log(li);
    setLineItems(li);
    setTimeout(() => fetchLineItems(), 3600*1000); //Line items will refresh every hour
  }

  useEffect(() => {
    fetchLineItems();
  }, []);

  const handleReserve = async (uid, qty = 1) => {
    setLineItems(lineItems.map(li => li.uid === uid ? {...li, reservedQty: li.reservedQty + qty} : li));
    const response = await fetch(`/line-items/${uid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({reserve: qty})
    });
    for (let i = 0; i < 10000; i++){}
    if (response.status !== 200) {
      return setLineItems(lineItems.map(li => li.uid === uid ? {...li, reservedQty: li.reservedQty - qty} : li));
    };
  }

  const handleSend = async (uid, qty = 1) => {
    setLineItems(lineItems.map(li => li.uid === uid ? {...li, sentQty: li.sentQty + qty} : li));
    const response = await fetch(`/line-items/${uid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({reserve: qty})
    });
    if (response.status !== 200) {
      return setLineItems(lineItems.map(li => li.uid === uid ? {...li, sentQty: li.sentQty - qty} : li));
    };
  }

  const listItems = lineItems.map(lineItem => 
    <LineItem key={lineItem.uid.replace('.jpg', '_150x.jpg')} lineItem={lineItem} handleReserve={handleReserve} handleSend={handleSend}></LineItem>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container justifyContent="center" spacing={2} sx={{padding: '1em', paddingBottom: '5em'}}>
      <Grid item>
      <Paper elevation={3}>
      <List>{listItems}</List>
      </Paper>
      </Grid>
      </Grid>
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            TAYGRA USA - COMMANDES
          </Typography>
          <Button>Exporter CSV</Button>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default App;
