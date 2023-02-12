//const Exam = require("./model/exam")
//const Student = require("./model/student")

import {Exam} from "./model/exam"
import {Student} from "./model/student"

const SERVER_URL = 'https://study-plan-back.onrender.com'


const getAllExams = async () => {
    const response = await fetch(SERVER_URL + '/api/exams', { credentials: 'include' })
        .catch(err => { throw err })
    if (response.ok) {
        let exams = []
        const examsInput = await response.json();
        for (let i = 0; i < examsInput.length; i++) {
            exams[i] = new Exam(examsInput[i].code, examsInput[i].name, examsInput[i].credits, examsInput[i].maxStudents, examsInput[i].preparatoryCourse, examsInput[i].enrolled);
            exams[i].setIncompatible(examsInput[i].incompatible)
        }

        return exams;

    }
    else
        throw await response.text();

}

const getExamsByUser = async () => {
    const response = await fetch(SERVER_URL + '/api/exams/user', { credentials: 'include' });
    if (response.ok) {

        let exams = []
        const examsInput = await response.json();
        for (let i = 0; i < examsInput.length; i++) {
            exams[i] = new Exam(examsInput[i].code, examsInput[i].name, examsInput[i].credits, examsInput[i].maxStudents, examsInput[i].preparatoryCourse, examsInput[i].enrolled);
        }

        return exams;
    }
    else
        throw await response.text();
}

const savePlan = async (examsCodes, typeOfPlan) => {
    const response = await fetch(SERVER_URL + '/api/plan/' + typeOfPlan, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ examsCodes: examsCodes })
    })
    if (response.ok) {
        let exams = []
        const examsInput = await response.json();
        for (let i = 0; i < examsInput.length; i++) {
            exams[i] = new Exam(examsInput[i].code, examsInput[i].name, examsInput[i].credits, examsInput[i].maxStudents, examsInput[i].preparatoryCourse, examsInput[i].enrolled);
        }

        return exams;
    }
    else
        throw await response.json();
}

const deletePlan = async () => {
    const response = await fetch(SERVER_URL + '/api/plan/', {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })

    if (response.ok)
        return true;
    else
        throw await response.text();
}



const logIn = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)

    });

    if (response.ok) {
        const res = await response.json()
        return new Student(res.code, res.email, res.name, res.surname, res.typeOfPlan);
    }
    else
        throw await response.text();
}

const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
        credentials: 'include',
    });
    if (response.ok) {
        const res = await response.json();
        return new Student(res.code, res.email, res.name, res.surname, res.typeOfPlan);
    }
    else {
        throw await response.text();
    }
};

const logOut = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok)
        return null;
}

export const API = {
    getAllExams, logIn, getUserInfo,
    logOut, getExamsByUser, savePlan, deletePlan
}
//module.exports =  {API};
