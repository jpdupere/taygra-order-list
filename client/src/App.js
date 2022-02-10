import './App.css';
import {useState, useEffect} from 'react';
import List from '@mui/material/List';
import LineItem from './Components/LineItem';
import { ThemeProvider, createTheme, CssBaseline, Container, Card, Grid, Paper, AppBar, Toolbar, Typography, Button } from '@mui/material';
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
    setTimeout(() => fetchLineItems(), 3600*1000); //Line items will refresh every hour
  }

  useEffect(() => {
    fetchLineItems();
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
    for (let i = 0; i < 10000; i++){}
    if (response.status !== 200) {
      return setLineItems(lineItems.map(li => li.uid === uid ? adjustQty(li, adjustments, true) : li));
    };
  }

  const listItems = lineItems.filter(li => !(li.sentQty === li.qty && li.reservedQty === 0) || !hideSent).sort((a, b) => b.uid.localeCompare(a.uid)).map(lineItem => 
    <LineItem key={lineItem.uid.replace('.jpg', '_150x.jpg')} lineItem={lineItem} handleAdjust={handleAdjust}></LineItem>
  );

  const exportData = lineItems.filter(li => li.reservedQty > 0).flatMap(li => {
    const lines = []
    for (let i = 0; i < li.reservedQty; i++) {
      lines.push({OrderNumber: li.number, SKU: li.sku});
    }
    return lines;
  });
  console.log(exportData)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container justifyContent="center" spacing={2} sx={{paddingBottom: '5em'}}>
      <Grid item>
      <List dense={true}>{listItems}</List>
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
          <CSVLink data={exportData} filename={"commande-taygra-usa.csv"} className={'no-decoration'}><Button color="secondary">Exporter CSV</Button></CSVLink>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default App;
