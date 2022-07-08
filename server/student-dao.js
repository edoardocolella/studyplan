'use strict'

const crypto = require('crypto')
const { db } = require('./database/dbManager');
const Student = require('./model/student');

// get all the students
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Students WHERE email = ? ';
        db.all(sql, [email], (err, row) => {
            row = row[0]
            if (err)
                reject({ code: 500, message: "error" });
            else if (row === undefined)
                resolve(false);
            else {
                const student = new Student(row.studentCode, row.email, row.name, row.surname, row.typeOfPlan);
                crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
                    if (err) reject(err);
                    if (crypto.timingSafeEqual(Buffer.from(row.password, 'hex'),
                        hashedPassword)) resolve(student);
                    else resolve(false)
                })
            }

        });
    });
};

exports.getTypeOfPlan = (studentCode) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT typeOfPlan FROM STUDENTS WHERE studentCode = ?;";
        db.all(sql, [studentCode], (err, row) => {
            if (err)
                reject({ code: 500, message: "error" });
            else if (row === undefined)
                resolve(false);
            else resolve(row[0].typeOfPlan)
        })
    })
}

exports.setTypeOfPlan = (studentCode, typeOfPlan) => {


    return new Promise((resolve, reject) => {
        const sql = 'UPDATE STUDENTS SET typeOfPlan = ? WHERE studentCode = ? ';
        db.run(sql, [typeOfPlan, studentCode], (err) => {
            if (err)
                reject({ code: 500, message: "error" });
            else
                resolve(true)
        });
    });
};