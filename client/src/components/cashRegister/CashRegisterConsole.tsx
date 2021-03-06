import React, { useContext } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import DoneIcon from '@material-ui/icons/Done';
import ResetIcon from '@material-ui/icons/Replay';
import { CashRegisterContext } from '../../context/CashRegisterContext';
import { ActionType } from '../../reducers/CashRegisterReducer';
import { functions } from '../../fbConfig';
import { ServiceContext } from '../../context/ServiceContext';
import { disableUIOnCondition } from '../../helpers/disableUIOnCondition';

const createOrder = functions.httpsCallable('createOrder');

const consoleHeight = 400;
const useStyle = makeStyles(theme =>
  createStyles({
    console: {
      flexBasis: 90,
      height: consoleHeight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
      position: 'sticky',
      top: `calc(50vh + 32px - ${consoleHeight / 2}px)`,
      [theme.breakpoints.down('xs')]: {
        top: 80,
        maxWidth: consoleHeight,
        width: '100%',
        padding: theme.spacing(1)
      }
    },
    consoleSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'row',
        top: 80,
        maxWidth: consoleHeight,
        width: '100%',
        padding: theme.spacing(1)
      }
    },
    peopleSelector: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'row-reverse'
      }
    },
    peopleInput: {
      width: '100%',
      maxWidth: 60
    },
    doneBtn: {
      borderRadius: '50%'
    },
    orderNum: {
      borderWidth: 3,
      borderStyle: 'solid',
      borderColor: theme.palette.primary.main,
      borderRadius: 10,
      cursor: 'default',
      padding: theme.spacing(1)
    }
  })
);

const CashRegisterConsole: React.FunctionComponent = () => {
  const classes = useStyle();
  const theme = useTheme();

  const { serviceId } = useContext(ServiceContext);

  const { state, dispatch } = useContext(CashRegisterContext);

  const {
    courses,
    tableNum,
    revenue,
    orderNote,
    orderNum,
    waitingOrderRes,
    waitingToEndOrder
  } = state;

  const resetOrder = () => {
    dispatch({ type: ActionType.ResetState });
  };

  const sendOrder = () => {
    dispatch({
      type: ActionType.SendOrder
    });
    createOrder({ revenue, courses, tableNum, serviceId, orderNote })
      .then(res => {
        const { outcome, newOrderNum } = res.data;
        if (outcome) {
          dispatch({
            type: ActionType.OrderReceived,
            payload: { orderNum: newOrderNum }
          });
        } else {
          dispatch({ type: ActionType.TriggerError });
          console.error('ERROR WHEN CREATING ORDER: ');
        }
      })
      .catch(err => {
        dispatch({ type: ActionType.TriggerError });
        console.error('ERROR WHEN CREATING ORDER: ', err.message, err.stack);
      });
  };

  return (
    <Paper
      elevation={6}
      className={classes.console}
      style={disableUIOnCondition(waitingOrderRes, true)}
    >
      <div
        className={classes.consoleSection}
        style={disableUIOnCondition(waitingToEndOrder, true)}
      >
        <div className={classes.peopleSelector}>
          <TextField
            type="number"
            value={tableNum || ''}
            variant="outlined"
            margin="dense"
            inputProps={{ min: 0, style: { textAlign: 'center' } }}
            className={classes.peopleInput}
            onChange={e => {
              const newPeople = Number(e.target.value) || undefined;
              dispatch({
                type: ActionType.SetPeople,
                payload: { people: newPeople }
              });
            }}
          />
        </div>
        <Typography variant="h6" color="secondary">
          € {revenue}
        </Typography>
        <IconButton
          className={classes.doneBtn}
          color="primary"
          disabled={
            courses.length === 0 || tableNum === 0 || tableNum === undefined
          }
          onClick={sendOrder}
        >
          <DoneIcon fontSize="large" />
        </IconButton>
      </div>

      <div className={classes.consoleSection}>
        <Typography
          variant="h5"
          className={classes.orderNum}
          style={{
            color: orderNum
              ? theme.palette.text.primary
              : theme.palette.background.paper
          }}
        >
          {orderNum || 123}
        </Typography>
        <IconButton
          className={classes.doneBtn}
          color="secondary"
          onClick={resetOrder}
        >
          <ResetIcon fontSize="large" />
        </IconButton>
      </div>
    </Paper>
  );
};

export default CashRegisterConsole;
