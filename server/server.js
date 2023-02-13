const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const studentDao = require('./student-dao');
const examsDao = require('./exams-dao')
const Student = require('./model/student');

// init express
const PORT = 3001;
const app = express();

// set up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // for parsing json request body

// set up and enable cors
const corsOptions = {
  origin: 'https://study-plan-front.onrender.com',
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  preflightContinue: true,
  credentials: true,
};
app.use(cors(corsOptions));

// Passport: set-up the local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {

  if (!validateEmail(username)) {
    return cb("Invalid Email")
  }

  if (String(password).length <= 6) {
    return cb("Invalid password")
  }

  const user = await studentDao.getUser(username, password)
    .catch(() => { return res.status(422).send("Unprocessable entity") });

  if (!user)
    return cb(null, false);
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
})

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
})

app.use(session({
  secret: 'secret string',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}

//GET /api/exams
app.get('/api/exams', async (req, res) => {
  await examsDao.getAllExams()
    .then(exams => { return res.status(200).json(exams); })
    .catch((error) => { return res.status(error.code).send(error.message); });
});

//GET /api/exams/user
app.get('/api/exams/user', isLoggedIn, async (req, res) => {
  await examsDao.getPlan(req.user.code)
    .then(exams => { return res.status(200).json(exams); })
    .catch((error) => { return res.status(error.code).send(error.message); });
});

//POST /api/plan/:typeOfPlan
app.post('/api/plan/:typeOfPlan', isLoggedIn, async (req, res) => {

  const examsCodes = req.body.examsCodes;
  const typeOfPlan = String(req.params.typeOfPlan);

  //parameters validity check
  if (examsCodes == null || examsCodes.length === 0 ||
    typeOfPlan == null || typeOfPlan.length === 0
    || !["PartTime", "FullTime"].includes(typeOfPlan))
    return res.status(422).send("Unprocessable entity")

  const allExams = await examsDao.getAllExams()
    .catch(() => { return res.status(500).send("Internal Server Error") });
  const allExamsCodes = allExams.map(e => e.code)


  //check if codes are valid and if exams received really exist in database
  let planExams = [];
  for (let i = 0; i < examsCodes.length; i++) {
    if (String(examsCodes[i]).length !== 7)
      return res.status(422).send("Unprocessable entity")

    if (!allExamsCodes.includes(examsCodes[i]))
      return res.status(422).send("Unprocessable entity")

    planExams.push((allExams.filter(e => e.code === examsCodes[i]))[0]);
  }


  let minCredits, maxCredits;
  if (typeOfPlan === "PartTime") { minCredits = 20; maxCredits = 40 }
  else if (typeOfPlan === "FullTime") { minCredits = 60; maxCredits = 80 }

  const creditSum = planExams.map(exam => exam.credits).reduce(
    (previousValue, currentValue) => previousValue + currentValue, 0);

  if (creditSum < minCredits || creditSum > maxCredits)
    return res.status(422).send({ error: "Error with credits contraint" })

  const oldPlan = await examsDao.getPlan(req.user.code)
    .catch(() => { return res.status(500).send("Internal Server Error") });


  let errorSet = new Set();
  //check if there are no incompatibilities and there are all prepCourse needed
  planExams.forEach(e1 => {
    let otherExams = planExams.filter(otherExam => otherExam.code !== e1.code)

    otherExams.forEach(e2 => {
      if (e1.incompatible.includes(e2.code)) {
        errorSet.add("Error with incompatible " + e1.name);
      }
    })

    if (e1.preparatoryCourse != null && !(otherExams.map(e2 => e2.code).includes(e1.preparatoryCourse))) {
      errorSet.add("Error with preparatory " + e1.name)
    }

  
    if (!(oldPlan.map(e => String(e.code)).includes(String(e1.code))) && e1.maxStudents != null && Number(e1.maxStudents) === Number(e1.enrolled)) {
      errorSet.add("Error with max students: " + e1.name)
    }
  })

  let errorArray = Array.from(errorSet)
  if (errorArray.length !== 0)
    return res.status(422).send({ error: errorArray });

  //plan saved
  const exams = await examsDao.savePlan(req.body.examsCodes, req.user.code)
    .catch((error) => { return res.status(error.code).send(error.message); });

  //type of plan saved
  await studentDao.setTypeOfPlan(req.user.code, typeOfPlan)
    .then(() => { return res.status(201).json(exams); })
    .catch((error) => { return res.status(error.code).send(error.message); });

});

//DELETE /api/plan/
app.delete('/api/plan/', isLoggedIn, async (req, res) => {
  await examsDao.deleteAllPlan(req.user.code)
    .then(() => { return res.status(204).end(); })
    .catch((error) => { return res.status(error.code).send(error.message); });
});


/*** User APIs */
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  res.status(201).json(req.user);
})

// GET /api/sessions/current
app.get('/api/sessions/current', async (req, res) => {
  if (req.isAuthenticated()) {

    const typeOfPlan = await studentDao.getTypeOfPlan(req.user.code)
      .catch(() => { return res.status(500).send("Internal Server Error") });

    const user = new Student(req.user.code, req.user.email, req.user.name, req.user.surname, typeOfPlan)
    res.json(user);
  }
  else res.status(401).send('Not authenticated');
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// activate the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));