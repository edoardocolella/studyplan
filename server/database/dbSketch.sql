DROP TABLE Exams;
DROP TABLE IncompatibleExams;
DROP TABLE Students;
DROP TABLE StudentHasExam;


CREATE TABLE Exams(
    code TEXT PRIMARY KEY,
    name TEXT,
    credits INTEGER,
    maxStudents INTEGER,
    preparatoryCourse TEXT
);

CREATE TABLE IncompatibleExams(
    Code1 TEXT,
    Code2 TEXT,
    PRIMARY KEY(Code1, Code2)
);

CREATE TABLE Students(
    studentCode TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    surname TEXT,
    typeOfPlan TEXT,
    password TEXT,
    salt TEXT
);

CREATE TABLE StudentHasExam(
    studentCode TEXT,
    examCode TEXT,
    PRIMARY KEY(StudentCode, ExamCode)
);



INSERT INTO Exams
(code,name,credits,maxStudents,preparatoryCourse)
VALUES 
("02GOLOV","Architetture dei sistemi di elaborazione",12,NULL,NULL),
("02LSEOV","Computer architectures",12,NULL,NULL),
("01SQJOV","Data Science and Database Technology",8,NULL,NULL),
("01SQMOV","Data Science e Tecnologie per le Basi di Dati",8,NULL,NULL),
("01SQLOV","Database systems",8,NULL,NULL),
("01OTWOV","Computer network technologies and services",6,3,NULL),
("02KPNOV","Tecnologie e servizi di rete",6,3,NULL),
("01TYMOV","Information systems security services",12,NULL,NULL),
("01UDUOV","Sicurezza dei sistemi informativi",12,NULL,NULL),
("05BIDOV","Ingegneria del software",6,NULL,"02GOLOV"),
("04GSPOV","Software engineering",6,NULL,"02LSEOV"),
("01UDFOV","Applicazioni Web I",6,NULL,NULL),
("01TXYOV","Web Applications I",6,3,NULL),
("01TXSOV","Web Applications II",6,NULL,"01TXYOV"),
("02GRSOV","Programmazione di sistema",6,NULL,NULL),
("01NYHOV","System and device programming",6,3,NULL),
("01SQOOV","Reti Locali e Data Center",6,NULL,NULL),
("01TYDOV","Software networking",7,NULL,NULL),
("03UEWOV","Challenge",5,NULL,NULL),
("01URROV","Computational intelligence",6,NULL,NULL),
("01OUZPD","Model based software design",4,NULL,NULL),
("01URSPD","Internet Video Streaming",6,2,NULL);


INSERT INTO IncompatibleExams
(Code1, Code2)
VALUES
("02GOLOV","02LSEOV"),
("01SQJOV","01SQMOV"),
("01SQJOV","01SQLOV"),
("01SQMOV","01SQLOV"),
("01OTWOV","02KPNOV"),
("01TYMOV","01UDUOV"),
("05BIDOV","04GSPOV"),
("01UDFOV","01TXYOV"),
("02GRSOV","01NYHOV");


INSERT INTO Students
(studentCode, email, name, surname, typeOfPlan, salt, password)
VALUES
("s000001","s000001@student.com","Andrea","Bianchi", "FullTime","ea554dc1c34aec25","8b49133e8299226faafcac5674533ba7f8fe877ed670e054d55a8d9735de12e7"),
("s000002","s000002@student.com","Mario","Rossi", "FullTime","fddede7ea50b14f8","3554950665902e048b2047db00cf3187d1b209232a40b97882daf65e565cf784"),
("s000003","s000003@student.com","Marco","Verdi", "PartTime","eb77c9fb942b34eb","eca2acc0041c7f90cb9cce24628985b2ffab2fa8002b3689d3363f16843f22f5"),
("s000004","s000004@student.com","Rocco","Gialli", NULL,"f0aea00010a45eff","14f3710d078c386b7a1916c89c1ac42e586996806d54109bc2ce39df4fcecb52"),
("s000005","s000005@student.com","Matteo","Violi", "PartTime","cd2e25c89bfe157d","3ba462ffea25399d338ae006ab3560c37ed706a623ece6d7ae56a697ca7cf863");

INSERT INTO StudentHasExam
(studentCode, examCode)
VALUES
("s000001", "02GOLOV"),
("s000001", "01SQMOV"),
("s000001", "02KPNOV"),
("s000001", "01UDUOV"),
("s000001", "01URSPD"),
("s000001", "02GRSOV"),
("s000001", "01SQOOV"),
("s000001", "01TYDOV"),
("s000001", "0000001"),
("s000002", "02GOLOV"),
("s000002", "01SQMOV"),
("s000002", "02KPNOV"),
("s000002", "01UDUOV"),
("s000002", "01URSPD"),
("s000002", "02GRSOV"),
("s000002", "01SQOOV"),
("s000002", "01TYDOV"),
("s000003", "02LSEOV"),
("s000003", "01SQJOV"),
("s000003", "01OTWOV"),
("s000003", "01TYMOV"),
("s000005", "01NYHOV"),
("s000005", "01URROV"),
("s000005", "02KPNOV"),
("s000005", "02LSEOV"),
("s000005", "04GSPOV");
