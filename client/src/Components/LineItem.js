import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { Button } from '@mui/material';

function lineItem({lineItem, handleAdjust}) {
    const reqQty = `Qté: ${lineItem.qty}`;
    const reservedQty = lineItem.qty === 1 ? 'Mise de côté' : lineItem.reservedQty > 1 ? `${lineItem.reservedQty} mise${lineItem.reservedQty > 1 ? 's' : ''} de côté`: '';
    const sentQty = lineItem.sentQty === 1 ? 'Envoyée' : lineItem.sentQty > 1 ? `${lineItem.sentQty} envoyées`: '';

    const getSentStatus = () => {
        if (lineItem.sentQty > 0) {
            if (lineItem.sentQty === lineItem.qty) {
                let msg;
                if (lineItem.sentQty > 1) {
                    msg = `${lineItem.sentQty} envoyées`;
                } else {
                    msg = 'Envoyée';
                }
                return <Alert severity="info" onClose={() => handleAdjust(lineItem.uid, {reservedQty: 1, sentQty: -1})}>{msg}</Alert>
            }
            return <Alert severity="warning"  onClose={() => handleAdjust(lineItem.uid, {reservedQty: 1, sentQty: -1})}>{lineItem.sentQty} sur {lineItem.qty} envoyée{lineItem.sentQty > 1 ? 's' : ''}</Alert>
        }
    }

    const getReservedStatus = () => {
        if (lineItem.reservedQty > 0) {
            if (lineItem.reservedQty === lineItem.qty - lineItem.sentQty) {
                let msg;
                if (lineItem.reservedQty > 1) {
                    msg = `${lineItem.reservedQty} réservées`;
                } else {
                    msg = `Réservée`;
                }
                return <Alert severity="success" onClose={() => handleAdjust(lineItem.uid, {reservedQty: -1})}>{msg}</Alert>
            }
            return <Alert severity="warning"  onClose={() => handleAdjust(lineItem.uid, {reservedQty: -1})}>{lineItem.reservedQty} sur {lineItem.qty} réservée{lineItem.reservedQty > 1 ? 's' : ''}</Alert>
        }
    }

    const getReserveBtn = () => {
        if (lineItem.reservedQty + lineItem.sentQty < lineItem.qty) {
            return <Button onClick={() => handleAdjust(lineItem.uid, {reservedQty: 1})}>Réserver</Button>
        }
    }

    const getSendBtn = () => {
        if (lineItem.reservedQty > 0) {
            return <Button onClick={() => handleAdjust(lineItem.uid, {sentQty: 1, reservedQty: -1})}>Envoyer</Button>
        }
    }

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar src={lineItem.imgSrc.replace('.jpg', '_100x.jpg')} variant='square'></Avatar>
            </ListItemAvatar>
            <ListItemText primary={lineItem.number + ' - ' +lineItem.sku} secondary={`${reqQty} ${lineItem.reservedQty > 0 ? `- ${reservedQty}` : ''}${lineItem.sentQty > 0 ? `, ${sentQty}` : ''}`} />
            {getReserveBtn()}
            {getSendBtn()}
            {getReservedStatus()}
            {getSentStatus()}
        </ListItem>
    )
}

export default lineItem;