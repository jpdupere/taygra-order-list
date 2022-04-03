import './App.css';
import {useState, useEffect} from 'react';
import List from '@mui/material/List';
import LineItem from './Components/LineItem';
import { ThemeProvider, createTheme, CssBaseline,Grid, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { CSVLink } from 'react-csv';

function App() {
  const [lineItems, setLineItems] = useState([]);
  const [hideSent, setHideSent] = useState(true);

  const theme = createTheme({
    palette: {
      mode: 'dark',
    }
  });

  const fetchLineItems = async () => {
    const res = await fetch('/line-items')
    const li = await res.json();
    setLineItems(li);
  }

  useEffect(() => {
    fetchLineItems();
    const interval = setInterval(fetchLineItems, 5*60*1000); //Line items will refresh every hour
    return () => clearInterval(interval);
  }, []);

  const adjustQty = (lineItem, adjustments, revert) => {
    const multiplier = revert ? -1 : 1;
    Object.entries(adjustments).forEach(([key, val]) => {
      lineItem[key] += val * multiplier;
    });
    return lineItem;
  }

  const handleAdjust = async (uid, adjustments) => {
    setLineItems(lineItems.map(li => li.uid === uid ? adjustQty(li, adjustments) : li));
    const response = await fetch(`/line-items/${uid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adjustments)
    });
    if (response.status !== 200) {
      return setLineItems(lineItems.map(li => li.uid === uid ? adjustQty(li, adjustments, true) : li));
    };
  }

  const handleSetNote = async (uid, note) => {
    const response = await fetch(`/line-items/${uid}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({note})
    });
    if (response.status !== 200) {
      return lineItems.filter(li => li.uid === uid)[0].note;
    }
    setLineItems(lineItems.map(li => li.uid === uid ? {...li, note} : li));
    return note;
}

  const listItems = lineItems.filter(li => !(li.sentQty === li.qty && li.reservedQty === 0) || !hideSent).sort((a, b) => {
    if ((a.reservedQty || a.sentQty) !== (b.reservedQty || b.sentQty)) {
      if (a.reservedQty || a.sentQty) {
        return 1;
      }
      return -1;
    } else {
      if (!!a.note !== !!b.note) {
        if (a.note) {
          return 1;
        }
        return -1;
      }
    }
    return b.uid.localeCompare(a.uid)
  }).map(lineItem => 
    <LineItem key={lineItem.uid.replace('.jpg', '_150x.jpg')} lineItem={lineItem} handleAdjust={handleAdjust} handleSetNote={handleSetNote}></LineItem>
  );

  console.log(listItems);

  const exportData = lineItems.filter(li => li.reservedQty > 0).flatMap(li => {
    const lines = []
    for (let i = 0; i < li.reservedQty; i++) {
      lines.push({OrderNumber: li.number, SKU: li.sku});
    }
    return lines;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container justifyContent="center" spacing={2} sx={{paddingBottom: '5em'}}>
      <Grid item xs={12}>
      <List sx={{maxWidth: '700px', margin: '0 auto'}} dense={false}>{listItems}</List>
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
          <Button onClick={() => setHideSent(!hideSent)}>{`${hideSent ? 'Afficher' : 'Masquer'} les commandes envoyées`}</Button>
          <CSVLink data={exportData} onClick={() => exportData.length ? true : false} filename={"commande-taygra-usa.csv"} className={'no-decoration'}><Button color="secondary" disabled={!exportData.length}>Exporter CSV</Button></CSVLink>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default App;
