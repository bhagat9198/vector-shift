import * as React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Box,
  Typography,
  Link,
  Tooltip
} from '@mui/material';

const StickyHeadTable = ({ data = [] }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [orderBy, setOrderBy] = React.useState('name');
  const [order, setOrder] = React.useState('asc');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      if (orderBy === 'delta' && a.delta) {
        try {
          aValue = JSON.parse(a.delta)?.source || '';
          bValue = JSON.parse(b.delta)?.source || '';
        } catch (e) {
          console.error('Error parsing delta:', e);
        }
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, orderBy, order]);

  // Define table columns
  const columns = [
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'source', label: 'Source', minWidth: 120 },
    { id: 'last_modified_time', label: 'Last Modified', minWidth: 160 },
    { id: 'url', label: 'URL', minWidth: 100, align: 'right' },
  ];

  const renderCellContent = (row, columnId) => {
    const value = row[columnId];
    
    // Handle null/undefined
    if (value === null || value === undefined || value === '') {
      return <Typography variant="body2" color="text.secondary">-</Typography>;
    }
    
    // Special handling for specific column types
    switch (columnId) {
      case 'delta':
        try {
          const parsed = JSON.parse(value);
          return (
            <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem' }}>
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </Box>
          );
        } catch (e) {
          return <Typography variant="body2" color="error">Invalid JSON</Typography>;
        }
        
      case 'last_modified_time':
      case 'creation_time':
      case 'created_time':
      case 'updated_time':
        try {
          return new Date(value).toLocaleString();
        } catch {
          return value;
        }
        
      case 'url':
        return (
          <Tooltip title={value}>
            <Link href={value} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
              {value.length > 40 ? `${value.substring(0, 37)}...` : value}
            </Link>
          </Tooltip>
        );
        
      case 'children':
        return value === null ? 'null' : JSON.stringify(value);
        
      default:
        // Handle boolean values
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        // Handle long text
        if (typeof value === 'string' && value.length > 50) {
          return (
            <Tooltip title={value}>
              <Box sx={{ maxWidth: 300 }}>
                <Typography noWrap variant="body2">
                  {value}
                </Typography>
              </Box>
            </Tooltip>
          );
        }
        return value;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      <Typography variant="subtitle2">
                        {column.label}
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow 
                      hover 
                      role="checkbox" 
                      tabIndex={-1} 
                      key={`${row.id || 'row'}-${index}`}
                    >
                      {columns.map((column) => (
                        <TableCell 
                          key={column.id}
                          align={column.align || 'left'}
                          sx={{ 
                            verticalAlign: 'top',
                            borderRight: column.id !== columns[columns.length - 1].id ? '1px solid rgba(224, 224, 224, 0.5)' : 'none'
                          }}
                        >
                          {renderCellContent(row, column.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      No data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default StickyHeadTable;
