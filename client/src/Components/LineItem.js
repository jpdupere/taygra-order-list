import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { Alert, Badge, Button, Chip, Divider, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';

function LineItem({lineItem, handleAdjust, handleSetNote}) {
    const [noteMode, setNoteMode] = useState(false);
    const [note, setNote] = useState(lineItem.note || '');

    useEffect(() => {
      setNote(lineItem.note || '');
    }, [lineItem.note]);
    

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
            let msg = `${lineItem.reservedQty} sur ${lineItem.qty} séparée${lineItem.reservedQty > 1 ? 's' : ''}`;
            let color = 'warning';
            if (lineItem.reservedQty === lineItem.qty - lineItem.sentQty) {
                color = 'success';
                if (lineItem.reservedQty > 1) {
                    msg = `${lineItem.reservedQty} séparées`;
                } else {
                    msg = `Séparée`;
                }
            }
            return <Chip color={color} size='small' label={msg} onDelete={() => handleAdjust(lineItem.uid, {reservedQty: -1})} />
        }
    }

    const getReserveBtn = () => {
        if (lineItem.reservedQty + lineItem.sentQty < lineItem.qty) {
            return <Button size='small' onClick={() => handleAdjust(lineItem.uid, {reservedQty: 1})}>Séparer</Button>
        }
    }

    const getSendBtn = () => {
        return null;
        if (lineItem.reservedQty > 0) {
            return <Button size='small' color='secondary' onClick={() => handleAdjust(lineItem.uid, {sentQty: 1, reservedQty: -1})}>Envoyer</Button>
        }
    }

    const handleSetNoteMode = (newNoteMode) => {
        setNoteMode(newNoteMode);
    }

    const handleNoteChange = (evt) => {
        setNote(evt.target.value);
    }

    const handleNoteKeyDown = (evt) => {
        if (evt.code === 'Enter') {
            handleSave(note);
        }
    }

    const handleSave = async (newNote) => {
        const savedNote = await handleSetNote(lineItem.uid, newNote);
        setNoteMode(false);
        setNote(savedNote);
    }

    return (
        <>
        <ListItem>
            <ListItemAvatar>
            <Badge badgeContent={lineItem.qty} invisible={lineItem.qty <= 1} color="primary">
                <Avatar src={lineItem.imgSrc.replace('.jpg', '_100x.jpg')} variant='square'></Avatar>
            </Badge>
            </ListItemAvatar>
            <Box sx={{flex: '1 1 auto'}}>
            <ListItemText onClick={() => handleSetNoteMode(true)} sx={{wordBreak: 'break-all'}} primary={`${lineItem.number}`} secondary={lineItem.sku} />
                {getReservedStatus()}    
                {getSentStatus()}
            {noteMode 
            ? <TextField autoFocus size='small' onKeyDown={handleNoteKeyDown} onChange={handleNoteChange} onBlur={() => handleSave(note)} id="outlined-basic" label="Note" variant="outlined" value={note} />
            : note ? <Alert severity='info' sx={{width:'fit-content'}} onClick={() => handleSetNoteMode(true)} onClose={() => handleSave('')}>
                {note}
            </Alert> : null}
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                {getReserveBtn()}
                {getSendBtn()}
            </Box>
        </ListItem>
        <Divider variant="inset" component="li" /></>
    )
}

export default LineItem;