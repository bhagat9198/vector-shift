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

const deltaKeys = ['source', 'last_updated', 'company'];

const Row = ({ row }) => {
  const [open, setOpen] = React.useState(false);

  // Parse delta JSON if it exists
  const deltaData = React.useMemo(() => {
    if (!row.delta) return {};
    try {
      return JSON.parse(row.delta);
    } catch {
      return { error: 'Invalid JSON' };
    }
  }, [row.delta]);

  // Delta keys: Only 'source', 'last_updated', and 'company' are relevant here
  // const deltaKeys = ['source', 'last_updated', 'company'];

  // Get all other fields for the main table (excluding 'delta', 'children', etc.)
  const metaFields = Object.keys(row)
    .filter(key => 
      key !== 'delta' && 
      key !== 'children' && 
      key !== 'source' && 
      row[key] !== null
    );

  // Format date strings
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Format cell value
  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* Expand button */}
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
        
        {/* Main Table Cells */}
        <TableCell component="th" scope="row">
          {row.name || '-'}
        </TableCell>
        <TableCell>{row.type || '-'}</TableCell>
        <TableCell>{formatDate(row.creation_time)}</TableCell>
        <TableCell>{formatDate(row.last_modified_time)}</TableCell>
        <TableCell>{formatDate(row.last_updated)}</TableCell> {/* Last Updated Field */}
        <TableCell>{row.company || '-'}</TableCell> {/* Company Field */}

        {/* Main Table - Excluding delta */}
        {metaFields.map(key => (
          <TableCell key={key}>
            {formatValue(row[key])}
          </TableCell>
        ))}
      </TableRow>

      {/* Subtable (for delta) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7 + metaFields.length}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Delta Metadata
              </Typography>
              <Table size="small" aria-label="metadata">
                <TableBody>
                  {/* Render Delta Metadata */}
                  {deltaKeys.map((key) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>
                        {formatValue(deltaData[key])}
                      </TableCell>
                    </TableRow>
                  ))}
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
  // Get all unique delta keys from all rows for column headers
  const allDeltaKeys = React.useMemo(() => {
    const keys = new Set();
    data.forEach(row => {
      if (row.delta) {
        try {
          const delta = JSON.parse(row.delta);
          deltaKeys.forEach(key => {
            if (delta[key]) keys.add(key);
          });
        } catch (e) {
          console.error('Error parsing delta:', e);
        }
      }
    });
    return Array.from(keys);
  }, [data]);

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
            <TableCell>Last Updated</TableCell> {/* Add last updated column */}
            <TableCell>Company</TableCell> {/* Add company column */}
            {/* Delta Keys as Columns in the Header */}
            {allDeltaKeys.map(key => (
              <TableCell key={key}>
                {key.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <Row 
              key={`${row.id || 'row'}-${index}`} 
              row={row} 
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CollapsibleTable;
