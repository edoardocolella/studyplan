'use strict'

const { db } = require('./database/dbManager');
const Exam = require('./model/exam');
const { setTypeOfPlan } = require('./student-dao');


// get all the exams
exports.getAllExams = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT E.code, name, credits, maxStudents, preparatoryCourse, COUNT(DISTINCT StudentHasExam.studentCode) AS enrolled
        FROM Exams E
        LEFT JOIN StudentHasExam ON StudentHasExam.examCode = E.code
        GROUP BY E.code`;
        db.all(sql, [], async (err, rows) => {
            if (err)
                reject({ code: 500, message: "error" });
            else {
                let exams = [];
                for (let i = 0; i < rows.length; i++) {
                    exams[i] = new Exam(rows[i].code, rows[i].name, rows[i].credits, rows[i].maxStudents, rows[i].preparatoryCourse, rows[i].enrolled);
                    const incompatible = await getIncompatibleForExams(rows[i].code)
                        .catch(err => { throw err });
                    exams[i].setIncompatible(incompatible);

                }

                resolve(exams)

            }
        });
    });
}

//get incompatible exams for a given exam code
const getIncompatibleForExamsV1 = (code) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM IncompatibleExams where Code1 = ?'
        db.all(sql, [code], (err, rows) => {
            if (err)
                reject({ code: 500, message: "error" });
            else resolve(rows)
        })
    })
}

const getIncompatibleForExamsV2 = (code) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM IncompatibleExams where Code2 = ?'
        db.all(sql, [code], (err, rows) => {
            if (err)
                reject({ code: 500, message: "error" });
            else resolve(rows)
        })
    })
}

const getIncompatibleForExams = (code) => {
    return new Promise(async (resolve, reject) => {
        let incompatible1, incompatible2;
        await getIncompatibleForExamsV1(code)
            .then(incompatible => incompatible1 = incompatible.map(e => e.Code2))
            .catch(err => { reject(err) })
        await getIncompatibleForExamsV2(code)
            .then(incompatible => incompatible2 = incompatible.map(e => e.Code1))
            .catch(err => { reject(err) })
        resolve([...incompatible1, ...incompatible2]);
    })
}

//get all exams of a student Plan
exports.getPlan = (studentCode) => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT E.code, name, credits, maxStudents, preparatoryCourse, enrolled
        FROM Exams E, (
            SELECT examCode, COUNT(DISTINCT studentCode) as enrolled
            FROM StudentHasExam
            GROUP BY examCode
        )  C
        LEFT JOIN StudentHasExam ON StudentHasExam.examCode = E.code
        WHERE StudentHasExam.studentCode = ? AND C.examCode = E.code`
        db.all(sql, [studentCode], (err, rows) => {
            if (err)
                reject({ code: 500, message: "error" });
            else {
                let exams = [];
                for (let i = 0; i < rows.length; i++)
                    exams[i] = new Exam(rows[i].code, rows[i].name, rows[i].credits, rows[i].maxStudents, rows[i].preparatoryCourse, rows[i].enrolled);
                resolve(exams);
            }
        });
    });
}


//delete all exams froma a plan
const deleteExamsFromPlan = (studentCode) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM StudentHasExam WHERE studentCode = ?';
        db.run(sql, [studentCode], (err) => {
            if (err)
                reject({ code: 500, message: "error" });
            else resolve(true);
        });
    });
}

//delete exams from a plan and set the typeOfPlan on null
exports.deleteAllPlan = async (studentCode) => {

    await deleteExamsFromPlan(studentCode)
        .catch(err => { throw err })

    await setTypeOfPlan(studentCode, null)
        .catch(err => { throw err })

}

//add an exam in a plan
const addExamInPlan = (studentCode, examCode) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO StudentHasExam(studentCode, examCode) VALUES(?,?)';
        db.run(sql, [studentCode, examCode], (err, rows) => {
            if (err)
                reject({ code: 500, message: "error" });
            else resolve(rows);
        });
    });
}

//add exams in a plan and set the new type of plan
exports.savePlan = async (examsCode, usercode) => {

    return new Promise(async (resolve, reject) => {

        //remove old Plan
        await this.deleteAllPlan(usercode)
            .catch(err => { reject(err) });

        //add new plan
        for (let i = 0; i < examsCode.length; i++)
            await addExamInPlan(usercode, examsCode[i])
                .catch(err => { reject(err) });

        await this.getPlan(usercode)
            .then(exams => { resolve(exams) })
            .catch((err) => { reject(err) });
    })

}

exports.getEnrolled = async (examCode) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT examCode, COUNT(*) AS Enrolled FROM StudentHasExam WHERE examCode = ?'
        db.all(sql, [examCode], (err, rows) => {
            console.log(rows)
        })
    })
}