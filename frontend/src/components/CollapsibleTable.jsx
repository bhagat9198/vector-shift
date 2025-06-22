import * as React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Collapse,
  Typography,
  Box,
  Link
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const Row = ({ row }) => {
  const [open, setOpen] = React.useState(false);

  // Extract main fields for the main row
  const mainFields = ['name', 'type', 'creation_time', 'last_modified_time', 'url'];
  const mainRowData = Object.fromEntries(
    Object.entries(row).filter(([key]) => mainFields.includes(key))
  );

  // Get all other fields for the expanded section
  const metaFields = Object.keys(row).filter(key => !mainFields.includes(key) && row[key] !== null);
  
  // Format date strings
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Parse delta JSON if it exists
  const parseDelta = (deltaString) => {
    if (!deltaString) return null;
    try {
      return JSON.parse(deltaString);
    } catch {
      return { error: 'Invalid JSON' };
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          {metaFields.length > 0 && (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name || '-'}
        </TableCell>
        <TableCell>{row.type || '-'}</TableCell>
        <TableCell>{formatDate(row.creation_time)}</TableCell>
        <TableCell>{formatDate(row.last_modified_time)}</TableCell>
        <TableCell>
          {row.url ? (
            <Link href={row.url} target="_blank" rel="noopener noreferrer">
              View
            </Link>
          ) : '-'}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Metadata
              </Typography>
              <Table size="small" aria-label="metadata">
                <TableBody>
                  {metaFields.map((key) => {
                    let value = row[key];
                    
                    // Special handling for delta field
                    if (key === 'delta') {
                      const delta = parseDelta(value);
                      value = delta ? (
                        <Box component="pre" sx={{ 
                          backgroundColor: '#f5f5f5', 
                          padding: 1, 
                          borderRadius: 1,
                          overflowX: 'auto',
                          maxHeight: '200px'
                        }}>
                          {JSON.stringify(delta, null, 2)}
                        </Box>
                      ) : '-';
                    }
                    // Handle boolean values
                    else if (typeof value === 'boolean') {
                      value = value ? 'Yes' : 'No';
                    }
                    // Handle null/undefined
                    else if (value === null || value === undefined) {
                      value = '-';
                    }

                    return (
                      <TableRow key={key}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          {key.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{value}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const CollapsibleTable = ({ data = [] }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Modified</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <Row key={`${row.id || 'row'}-${index}`} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CollapsibleTable;