import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { Badge, Button, Chip, Divider } from '@mui/material';
import { Box } from '@mui/system';

function lineItem({lineItem, handleAdjust}) {
    const reqQty = `Qté: ${lineItem.qty}`;
    const reservedQty = lineItem.qty === 1 ? 'Mise de côté' : lineItem.reservedQty > 1 ? `${lineItem.reservedQty} mise${lineItem.reservedQty > 1 ? 's' : ''} de côté`: '';
    const sentQty = lineItem.sentQty === 1 ? 'Envoyée' : lineItem.sentQty > 1 ? `${lineItem.sentQty} envoyées`: '';

    const getSentStatus = () => {
        if (lineItem.sentQty > 0) {
            let msg =`${lineItem.sentQty} sur ${lineItem.qty} envoyée${lineItem.sentQty > 1 ? 's' : ''}`;
            let color = 'warning';
            if (lineItem.sentQty === lineItem.qty) {
                color = 'primary';
                if (lineItem.sentQty > 1) {
                    msg = `${lineItem.sentQty} envoyées`;
                } else {
                    msg = 'Envoyée';
                }
            }
            return <Chip  color={color} size='small' label={msg} onDelete={() => handleAdjust(lineItem.uid, {reservedQty: 1, sentQty: -1})} />
        }
    }

    const getReservedStatus = () => {
        if (lineItem.reservedQty > 0) {
            let msg = `${lineItem.reservedQty} sur ${lineItem.qty} réservée${lineItem.reservedQty > 1 ? 's' : ''}`;
            let color = 'warning';
            if (lineItem.reservedQty === lineItem.qty - lineItem.sentQty) {
                color = 'success';
                if (lineItem.reservedQty > 1) {
                    msg = `${lineItem.reservedQty} réservées`;
                } else {
                    msg = `Réservée`;
                }
            }
            return <Chip color={color} size='small' label={msg} onDelete={() => handleAdjust(lineItem.uid, {reservedQty: -1})} />
        }
    }

    const getReserveBtn = () => {
        if (lineItem.reservedQty + lineItem.sentQty < lineItem.qty) {
            return <Button size='small' onClick={() => handleAdjust(lineItem.uid, {reservedQty: 1})}>Réserver</Button>
        }
    }

    const getSendBtn = () => {
        if (lineItem.reservedQty > 0) {
            return <Button size='small' color='secondary' onClick={() => handleAdjust(lineItem.uid, {sentQty: 1, reservedQty: -1})}>Envoyer</Button>
        }
    }

    const text = `${reqQty} ${lineItem.reservedQty > 0 ? `- ${reservedQty}` : ''}${lineItem.sentQty > 0 ? `, ${sentQty}` : ''}`

    return (
        <>
        <ListItem>
            <ListItemAvatar>
            <Badge badgeContent={lineItem.qty} invisible={lineItem.qty <= 1} color="primary">
                <Avatar src={lineItem.imgSrc.replace('.jpg', '_100x.jpg')} variant='square'></Avatar>
            </Badge>
            </ListItemAvatar>
            <Box sx={{flex: '1 1 auto'}}>
            <ListItemText sx={{wordBreak: 'break-all'}} primary={`${lineItem.number}`} secondary={lineItem.sku} />
                {getReservedStatus()}    
                {getSentStatus()}
            </Box>            
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                {getReserveBtn()}
                {getSendBtn()}
            </Box>
        </ListItem>
        <Divider variant="inset" component="li" /></>
    )
}

export default lineItem;