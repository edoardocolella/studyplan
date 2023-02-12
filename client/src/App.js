import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Container, Row, Alert } from 'react-bootstrap';

import {API} from './API';
import MyNavbar from './components/customNavbar';
import ExamTable from './components/examTable';
import { LoginForm } from './components/customAuthComponents';
import StudyPlan from './components/studyPlan';

function App() {

  const [exams, setExams] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(undefined);
  const [plan, setPlan] = useState([]);

  //custom alert message that disappear automatically
  const setCustomMessage = (msg, type) => {
    setMessage({ msg: msg, type: type })
    setTimeout(() => {
      setMessage("")
    }, 1500)
  }

  //login function
  const handleLogin = async (credentials) => {
    await API.logIn(credentials)
      .then(user => {
        setUser(() => user)
      })
      .catch(err => {
        console.error("error in handleLogin:", err);
        setCustomMessage(err, "danger")
      });
  }

  //logout function
  const handleLogout = async () => {
    await API.logOut()
      .then(() => {
        setUser(() => undefined)
        setMessage('')
      })
      .catch(err => { console.error("error on logOut: ", err) })
  };

  //delete plan function
  const deletePlan = async (studentCode) => {
    await API.deletePlan(studentCode)
      .then(async () => {
        setPlan(() => [])
        await API.getAllExams()
          .then(exams => {
            setExams(() => exams);
          })
          .catch((err) => {
            console.error("error in getAllExams:", err);
            setCustomMessage('Loading failed!', 'danger');
          });
      })
      .catch(err => { console.error("error in deletePlan: ", err) })
  }

  //save plan function (typeOfPlan is updated too)
  const savePlan = async (exams, typeOfPlan) => {
    let flag = null;
    await API.savePlan(exams, typeOfPlan)
      .then(async (newPlan) => {
        setPlan(() => newPlan); let newUser = user;
        newUser.typeOfPlan = typeOfPlan;
        setUser(() => newUser);

        await API.getAllExams()
          .then(exams => {
            setExams(() => exams);
          })
          .catch((err) => {
            console.error("error in getAllExams:", err);
            setCustomMessage('Loading failed!', 'danger');
          });

      })
      .catch(err => {
        console.error("error in savePlan: ", err.error);
        flag = err.error
        })
    return flag;

  }

  //the app loads the exams and try to get user info only once after the initial rendering
  useEffect(() => {
    const checkAut = async () => {
      await API.getUserInfo()
        .then((user) => setUser(() => user))
        .catch((err) => {
          if (err !== "Not authenticated") {
            console.error("error in getUserInfo: ", err)
            setCustomMessage('Loading failed', 'danger')
          }
        });
    }
    const getExams = async () => {
      await API.getAllExams()
        .then(exams => {
          setExams(() => exams);
          setCustomMessage('Loading complete', 'success')
        })
        .catch((err) => {
          console.error("error in getAllExams:", err);
          setCustomMessage('Loading failed!', 'danger');
        });
    }
    checkAut();
    getExams();
  }, [])


  //the app load the plan of the user only when the user changes
  useEffect(() => {
    const getExamsByUser = async () => {
      await API.getExamsByUser()
        .then((exams) => { setPlan(exams) })
        .catch((err) => console.error("error on getExamsByUser: ", err))
    }
    if (user !== undefined)
      getExamsByUser()

  }, [user])



  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Homepage user={user} handleLogout={handleLogout} message={message} setCustomMessage={setCustomMessage} />}>

          {/*if already logged, the app goes to default page*/}
          <Route path='/login' element={
            user != null ? <Navigate to="/" replace /> : <LoginForm login={handleLogin} />} />

          {/*if not logged, it shows only the exam table, if logged it shows studyplan too */}
          <Route path='/' element={
            user != null ?
              <StudyPlan availableExams={exams} plan={plan} user={user} deletePlan={deletePlan} savePlan={savePlan} />
              : <ExamTable exams={exams} />} />

          <Route path='*' element={<Navigate to="/" replace />} />

        </Route>

      </Routes>
    </BrowserRouter>)
}


const Homepage = (props) => {

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/")
  }

  return (
    <>
      <Container fluid >
        {props.message && <Row>
          <Alert variant={props.message.type} onClose={() => { props.setCustomMessage('') }} dismissible>{props.message.msg}</Alert>
        </Row>}
        <Row><MyNavbar user={props.user} handleLogout={props.handleLogout}
          handleLogin={() => navigate("/login")} goHome={handleSubmit} /></Row>

        <Outlet />

      </Container>
    </>
  )

}
export default App;