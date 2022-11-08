import { Typography } from "@mui/material";
import { observer } from "mobx-react";
import AdminStore from "../../store/adminStore";

export const AdminHomePage = (props: {
  store: AdminStore
}) => (
  <div>
<script>alert('did render')</script>
    <Typography>The ADMIN HOME</Typography>
    </div>
);

export default observer(AdminHomePage);