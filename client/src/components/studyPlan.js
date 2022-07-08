import { useState } from "react";
import { Button, ButtonGroup, Col, Form, Row, Table, ToggleButton } from "react-bootstrap";
import MyModal from "./myModal";
import ExamTable from "./examTable";

function StudyPlan(props) {

    const [show, setShow] = useState(false);
    const [typeOfPlan, setTypeOfPlan] = useState(props.user.typeOfPlan)

    const handleClose = () => setShow(false);

    let minCredits;
    let maxCredits;
    if (typeOfPlan === "PartTime") {
        minCredits = 20;
        maxCredits = 40;
    }
    else if (typeOfPlan === "FullTime") {
        minCredits = 60;
        maxCredits = 80;
    }

    const exams = props.plan

    let availableExams = props.availableExams;
    exams.forEach(exam => {
        availableExams = availableExams.filter(avEx => avEx.code !== exam.code)
    });

    const savePlan = async (exams) => {
        const examCodes = exams.map(e => e.code)

        let flag = await props.savePlan(examCodes, typeOfPlan)
        if (flag == null) {
            setTypeOfPlan(typeOfPlan)
        }
        return flag;
    }

    const handleAdd = (event) => {
        event.preventDefault();
        setShow(true)
    }

    const handleDelete = (event) => {
        event.preventDefault();
        props.deletePlan(props.user.code)
    }

    const handleCreatePlan = (event, typeOfPlan) => {
        event.preventDefault();
        setTypeOfPlan(() => typeOfPlan)
        setShow(true)
    }

    const creditSum = props.plan.map(exam => exam.credits).reduce(
        (previousValue, currentValue) => previousValue + currentValue, 0);

    // if the plan is empty, the app shows the button to create one
    return (<>
        <ExamTable exams={props.availableExams} />
        {props.plan.length === 0 ?
            <>
                <h1 style={{ textAlign: "center" }}>StudyPlan of {props.user.name} {props.user.surname}</h1>
                <UnexistantPlan customKey={"unexistant"} handleCreatePlan={handleCreatePlan} show={show} handleClose={handleClose} exams={exams} availableExams={availableExams} typeOfPlan={typeOfPlan} savePlan={savePlan} />
            </> : <>
                <h1 style={{ textAlign: "center" }}>StudyPlan of {props.user.name} {props.user.surname} - {props.user.typeOfPlan} </h1>
                <CreatedPlan customKey={"created"} handleAdd={handleAdd} show={show} handleClose={handleClose} exams={exams}
                    availableExams={availableExams} typeOfPlan={typeOfPlan} savePlan={savePlan} handleDelete={handleDelete}
                    minCredits={minCredits} maxCredits={maxCredits} sumWithInitial={creditSum} />
            </>}
    </>)


}

//existant plan with options to edit 
function CreatedPlan(props) {


    const getRows = () => {
        return props.exams.map(exam =>
            <tr key={"createdPlan " + exam.code}>
                <td>{exam.code}</td>
                <td>{exam.name}</td>
                <td className="center">{exam.credits}</td>
                <td className="center">{exam.enrolled}</td>
                <td className="center">{exam.maxStudents == null ? "-" : exam.maxStudents}</td>
            </tr >)

    }

    return (<>
        <Row>
            <Col sm={1}></Col>
            <Col sm={10}>
                <Table striped bordered hover>
                    <thead><tr><th>Exam Code</th>
                        <th>Name</th>
                        <th className="center">Credits</th>
                        <th className="center">Enrolled</th>
                        <th className="center">Max Students</th></tr></thead>
                    <tbody>{getRows()}</tbody>
                </Table></Col>
            <Col sm={1}></Col>
        </Row>
        <Row>
            <Col sm={1}></Col>
            <Col>
                <Form onSubmit={props.handleAdd}>
                    <div className="d-grid gap-2">
                        <Button type='submit'>Edit Plan</Button>
                    </div>
                </Form>
            </Col>
            <Col><p className="center">Min credits: {props.minCredits}</p></Col>
            <Col><p className="center">Credit Sum: {props.sumWithInitial}</p></Col>
            <Col><p className="center">Max credits: {props.maxCredits}</p></Col>
            <Col>
                <Form onSubmit={props.handleDelete}>
                    <div className="d-grid gap-2">
                        <Button variant="danger" type='submit'>Delete StudyPlan</Button>
                    </div>
                </Form>
            </Col>
            <Col sm={1}></Col>
        </Row>
        {props.show && <MyModal key={"Created modal"} handleClose={props.handleClose} show={props.show} exams={props.exams}
            availableExams={props.availableExams} typeOfPlan={props.typeOfPlan} savePlan={props.savePlan} />}
        <p></p>
    </>
    )
}

//buttons to create the plan
function UnexistantPlan(props) {
    const [radioValue, setRadioValue] = useState("PartTime");

    return (<>
        <Row>
            <div style={{ textAlign: "center" }} >
                <ButtonGroup className="inline"><Row>
                    <Col>
                        <Row><ToggleButton style={{ width: "200px", height: "50px" }} type="radio" variant="outline-success" checked={radioValue === "PartTime"}
                            onClick={() => setRadioValue("PartTime")}>
                            PartTime
                        </ToggleButton></Row>
                        <Row><ToggleButton style={{ width: "200px", height: "50px" }} type="radio" variant="outline-danger" checked={radioValue === "FullTime"}
                            onClick={() => setRadioValue(() => "FullTime")}>
                            FullTime
                        </ToggleButton></Row></Col>
                    <Col>
                        <Form onSubmit={(event) => props.handleCreatePlan(event, radioValue)}>
                            <Button type='submit' style={{ width: "200px", height: "100px" }}>Create Plan</Button>
                        </Form></Col></Row>
                </ButtonGroup>
            </div>
        </Row>
        {
            props.show && <MyModal key={"unexistant modal"} handleClose={props.handleClose} show={props.show} exams={props.exams}
                availableExams={props.availableExams} typeOfPlan={props.typeOfPlan} savePlan={props.savePlan} />
        }
        <p></p>
    </>
    )
}

export default StudyPlan;