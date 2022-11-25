import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react';
import { Container, IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { AppChromeContext } from '../../models/appChromeContext';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import MainStore from '../../store/mainStore';
import { orange } from '@mui/material/colors';

export function MainChrome({store}: {
  store: MainStore,
}) {
  const appChrome = React.useContext(AppChromeContext)!;

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement|null>(null);
  const handleMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);
  
  const theme = createTheme({
    palette: {
      primary: {
        main: store.brand?.primary ?? orange[500],
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {store.organization?.title ?? 'Unit'} Check-In
            </Typography>
            <div style={{display:'inline-block'}}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={menuAnchor}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(menuAnchor)}
            onClose={handleClose}
          >
            {appChrome.user ? <MenuItem disabled>{appChrome.user.name}</MenuItem> : undefined}
            <MenuItem onClick={() => { handleClose(); appChrome.doLogout(); }}>Sign Out</MenuItem>
          </Menu>
        </div>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, pt: 2 }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default observer(MainChrome);