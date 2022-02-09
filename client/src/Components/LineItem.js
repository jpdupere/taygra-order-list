import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button } from '@mui/material';

function lineItem({lineItem, handleReserve, handleSend}) {
    const reqQty = `Qté: ${lineItem.qty}`;
    const reservedQty = lineItem.qty === 1 ? 'mise de côté' : lineItem.reservedQty > 1 ? `${lineItem.reservedQty} mise${lineItem.reservedQty > 1 ? 's' : ''} de côté`: '';
    const sentQty = lineItem.sentQty === 1 ? 'envoyée' : lineItem.sentQty > 1 ? `${lineItem.sentQty} envoyée`: '';

    const getSentStatus = () => {
        if (lineItem.sentQty > 0) {
            if (lineItem.sentQty === lineItem.qty) {
                let msg;
                if (lineItem.sentQty > 1) {
                    msg = `${lineItem.sentQty} envoyées`;
                } else {
                    msg = 'Envoyée';
                }
                return <Alert severity="success">{msg}</Alert>
            }
            return <Alert severity="warning">{lineItem.sentQty} sur {lineItem.qty} envoyée{lineItem.sentQty > 1 ? 's' : ''}</Alert>
        }
    }

    const getReservedStatus = () => {
        if (lineItem.reservedQty > 0) {
            if (lineItem.reservedQty === lineItem.qty) {
                let msg;
                if (lineItem.reservedQty > 1) {
                    msg = `${lineItem.reservedQty} réservées`;
                } else {
                    msg = `Réservée`;
                }
                return <Alert severity="success">{msg}</Alert>
            }
            return <Alert severity="warning">{lineItem.reservedQty} sur {lineItem.qty} réservée{lineItem.reservedQty > 1 ? 's' : ''}</Alert>
        }
    }

    const getSendBtn = () => {
        if (lineItem.reservedQty + lineItem.sentQty < lineItem.qty) {
            return <Button onClick={() => handleReserve(lineItem.uid, 1)}>Réserver</Button>
        }
    }

    const getReserveBtn = () => {
        if (lineItem.reservedQty > 0) {
            return <Button onClick={() => handleSend(lineItem.uid, 1)}>Envoyer</Button>
        }
    }

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar src={lineItem.imgSrc.replace('.jpg', '_100x.jpg')} variant='square'></Avatar>
            </ListItemAvatar>
            <ListItemText primary={lineItem.number + ' - ' +lineItem.sku} secondary={`${reqQty} ${lineItem.reservedQty > 0 ? `- ${reservedQty}` : ''}${lineItem.sentQty > 0 ? `, ${sentQty}` : ''}`} />
            {getReservedStatus()}
            {getReserveBtn()}
            {getSentStatus()}
            {getSendBtn()}
        </ListItem>
    )
}

export default lineItem;