import * as React from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { observer } from 'mobx-react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { AppChromeContext } from '../../models/appChromeContext';

const drawerWidth = 240;

const menu :[string, string, string, React.ReactNode][] = [
  [ 'home', '/', 'Site Home', <InboxIcon /> ],
  [ 'orgs', '/admin/organizations', 'Organizations', <MailIcon /> ],
]

export function AdminChrome(props: {
  children?: React.ReactNode
}) {
  const appChrome = React.useContext(AppChromeContext)!;

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement|null>(null);
  const handleMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Response Check-In Site Admin
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
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menu.map(m => (
              <ListItem key={m[0]} disablePadding>
                <ListItemButton component={RouterLink} to={m[1]}>
                  <ListItemIcon>{m[3]}</ListItemIcon>
                  <ListItemText primary={m[2]} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default observer(AdminChrome);