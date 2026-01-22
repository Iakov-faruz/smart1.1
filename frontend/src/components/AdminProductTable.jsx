import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Chip, TextField, InputAdornment,
  Box, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const AdminProductTable = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(products.map(p => p.CategoryName))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.ProductName || p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.CategoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ 
      width: '100%', 
      height: 'calc(100vh - 120px)', // מחשב את גובה המסך פחות ה-Header
      display: 'flex', 
      flexDirection: 'column',
      mt: 1 
    }}>
      
      {/* שורת חיפוש וסינון - נשארת קבועה למעלה */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 1, 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          borderRadius: 2, 
          boxShadow: 2,
          backgroundColor: '#fff'
        }}
      >
        <TextField
          size="small"
          placeholder="חיפוש מהיר..."
          variant="outlined"
          sx={{ flexGrow: 1 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>בחר קטגוריה</InputLabel>
          <Select
            value={categoryFilter}
            label="בחר קטגוריה"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat === 'all' ? 'הכל' : cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* מיכל הטבלה - גדל למקסימום הגובה ומפעיל גלילה */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          flexGrow: 1, 
          boxShadow: 4, 
          borderRadius: 3, 
          overflow: 'auto', // מאפשר גלילה פנימית
          backgroundColor: '#fff',
          '&::-webkit-scrollbar': { width: '8px' }, // עיצוב פס גלילה דק
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' }
        }}
      >
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(45deg, #0d47a1 30%, #1976d2 90%)', 
          color: 'white', 
          position: 'sticky', 
          top: 0, 
          zIndex: 1100 
        }}>
          <Typography variant="h5" fontWeight="900">ניהול מלאי חכם</Typography>
          <Typography variant="subtitle1">נמצאו {filteredProducts.length} מוצרים</Typography>
        </Box>
        
        <Table dir="rtl" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.3rem', backgroundColor: '#eeeeee', py: 2 }}>שם המוצר</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.3rem', backgroundColor: '#eeeeee' }}>קטגוריה</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.3rem', backgroundColor: '#eeeeee' }}>מחיר</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.3rem', backgroundColor: '#eeeeee' }}>מלאי</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.3rem', backgroundColor: '#eeeeee' }}>סטטוס</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((p) => {
              const isLowStock = p.stock_qty <= 5;
              const hasDiscount = p.discountPercent > 0;

              return (
                <TableRow key={p.ProductID || p.id} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                  <TableCell align="right" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.ProductName || p.name}</TableCell>
                  <TableCell align="right">
                    <Chip label={p.CategoryName} size="medium" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography sx={{ fontWeight: '900', fontSize: '1.2rem', color: hasDiscount ? '#d32f2f' : '#2e7d32' }}>
                        ₪{p.finalPrice}
                      </Typography>
                      {hasDiscount && (
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem' }}>
                          ₪{p.original_price}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={p.stock_qty} 
                      color={isLowStock ? "error" : "success"} 
                      sx={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '60px' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {hasDiscount ? (
                      <Chip label={`הנחה ${p.discountPercent}%`} color="error" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Typography variant="body2" color="textSecondary">רגיל</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminProductTable;