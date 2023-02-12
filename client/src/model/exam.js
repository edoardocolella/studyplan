export class Exam {
    constructor(code, name, credits, maxStudents, preparatoryCourse, enrolled) {
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.maxStudents = maxStudents;
        this.preparatoryCourse = preparatoryCourse;
        this.incompatible = [];
        this.enrolled = enrolled === undefined ? 0 : enrolled;
    }


    setIncompatible(newIncompatible) {
        this.incompatible = newIncompatible;
    }


}

//module.exports = Exam;