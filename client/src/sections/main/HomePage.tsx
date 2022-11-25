import { Alert, AlertTitle, Box, Card, CardActionArea, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react";
import MainStore from "../../store/mainStore";

export const HomePage = ({store}: {
  store: MainStore
}) => (<>
  {
    store.loadingMyActivities ?
    (
      <Box>
        <Skeleton variant="text"></Skeleton>
      </Box>
    ) : store.myActivitiesError ?
    (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {store.myActivitiesError}
      </Alert>
    ) : store.myActivities.length ?
    (
      <Box sx={{pb: 2}}>
        <Typography>Current Response</Typography>
        <Stack>
          {store.myActivities.map(a => (
            <Card key={a.id}>
              <CardActionArea onClick={() => alert('click')}>
                <Alert severity={a.status == 3 ? 'success' : 'warning'}>
                  <Typography variant="h6" component="div">{a.idNumber} {a.title}</Typography>
                  <Typography>Currently {a.status == 3 ? 'responding' : 'on standby'}</Typography>
                </Alert>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>
    ) : null
  }
  {
  store.loadingActivities ?
    (<Box>
      <Skeleton variant="text"></Skeleton>
      <Skeleton variant="rectangular" height={100}></Skeleton>
    </Box>) :
  (<Box>
    <Typography>Missions</Typography>
    <Stack>
    {store.missions.map(a => (
      <Card key={a.id}>
        <CardActionArea onClick={() => alert('show details for ' + a.title)}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {a.idNumber} {a.title}
          </Typography>
          <Typography>
            Active Responders: {a.activeResponders}
          </Typography>
        </CardContent>
        </CardActionArea>
      </Card>
    ))}
    {store.missions.length == 0 && <Typography>No recent missions</Typography>}
    </Stack>
    {store.otherActivities.length > 0 && <>
      <Typography sx={{mt:2}}>Other Events</Typography>
      <Stack>
      {store.otherActivities.map(a => (
        <Card key={a.id}>
          <CardActionArea>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {a.title}
            </Typography>
            <Typography>
              Active Responders: {a.activeResponders}
            </Typography>
          </CardContent>
          </CardActionArea>
        </Card>
      ))}
      </Stack>
    </>}
  </Box>)
  }
  </>
);

export default observer(HomePage);