import { useEffect, useState } from 'react';
import { TablePagination } from '@mui/material';
import fallbackTopSongs from '../fallback/top_songs.json';
import fallbackTopAlbums from '../fallback/top_albums.json';

export default function LazyTable({ route, columns, defaultPageSize, rowsPerPageOptions }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  useEffect(() => {
    const url = `${route}?page=${page}&page_size=${pageSize}`;
    const cacheKey = `sw_cache_${btoa(url)}`;
    fetch(url)
      .then(res => res.json())
      .then(resJson => {
        setData(resJson);
        localStorage.setItem(cacheKey, JSON.stringify(resJson));
      })
      .catch(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setData(JSON.parse(cached));
        else {
          if (route.includes('top_songs')) setData(fallbackTopSongs);
          else if (route.includes('top_albums')) setData(fallbackTopAlbums);
        }
      });
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    if (newPage < page || data.length === pageSize) {
      setPage(newPage + 1);
    }
  };

  const handleChangePageSize = (e) => {
    const newPageSize = Number(e.target.value);
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="sw-table-container">
      <table className="sw-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.headerName}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col.headerName}>
                  {col.renderCell ? col.renderCell(row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
        component="div"
        count={-1}
        rowsPerPage={pageSize}
        page={page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangePageSize}
        sx={{
          color: 'rgba(255,241,247,0.6)',
          fontFamily: 'Inter, sans-serif',
          '& .MuiSvgIcon-root': { color: '#f472b6' },
          '& .MuiSelect-select': { color: 'rgba(255,241,247,0.6)' },
        }}
      />
    </div>
  );
}
