import React from 'react';
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
  styled
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Styled components for sticky header and first column
const StickyTableContainer = styled(TableContainer)({
  maxHeight: '70vh',
  overflow: 'auto',
  '& .sticky-header': {
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 1,
    boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)'
  },
  '& .sticky-first-col': {
    position: 'sticky',
    left: 0,
    backgroundColor: 'white',
    zIndex: 1,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
  }
});

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
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return value;
  };

  // Get all other fields for the main table
  const metaFields = Object.keys(row)
    .filter(key => 
      key !== 'delta' && 
      key !== 'children' && 
      key !== 'source' && 
      row[key] !== null
    );

  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell className="sticky-first-col">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            disabled={metaFields.length === 0}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" className="sticky-first-col">
          {row.name || '-'}
        </TableCell>
        <TableCell>{row.type || '-'}</TableCell>
        <TableCell>{formatDate(row.creation_time)}</TableCell>
        <TableCell>{formatDate(row.last_modified_time)}</TableCell>
        <TableCell>{formatDate(deltaData.last_updated)}</TableCell>
        <TableCell>{deltaData.company || '-'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={7} className="sticky-first-col">
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Details
              </Typography>
              <Table size="small" sx={{ backgroundColor: 'white' }}>
                <TableBody>
                  {/* Add delta data first */}
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: '#f5f5f5'
                    }}>
                      Delta
                    </TableCell>
                    <TableCell sx={{ 
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      backgroundColor: '#f5f5f5'
                    }}>
                      {formatValue(deltaData)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Add other metadata fields */}
                  {metaFields.map((key) => (
                    <TableRow key={key}>
                      <TableCell sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: '#ffffff'
                      }}>
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </TableCell>
                      <TableCell sx={{ 
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {formatValue(row[key])}
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
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <StickyTableContainer component={Paper}>
      <Table stickyHeader aria-label="collapsible table" size="small">
        <TableHead>
          <TableRow>
            <TableCell className="sticky-header sticky-first-col" />
            <TableCell className="sticky-header sticky-first-col">Name</TableCell>
            <TableCell className="sticky-header">Type</TableCell>
            <TableCell className="sticky-header">Created</TableCell>
            <TableCell className="sticky-header">Last Modified</TableCell>
            <TableCell className="sticky-header">Last Updated</TableCell>
            <TableCell className="sticky-header">Company</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <Row key={`${row.id || 'row'}-${index}`} row={row} />
          ))}
        </TableBody>
      </Table>
    </StickyTableContainer>
  );
};

export default CollapsibleTable;
