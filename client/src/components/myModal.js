import { useState } from "react";
import { Alert, Button, Col, Modal, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import { PlusCircleDotted, TrashFill } from "react-bootstrap-icons";
import "./tables.css"

function MyModal(props) {

    const [actualExams, setActualExams] = useState(props.exams);
    const [availableExams, setAvailableExams] = useState(props.availableExams);
    const [loading, setLoading] = useState(false)
    const [errorFooter, setErrorFooter] = useState('')

    let minCredits, maxCredits;
    if (props.typeOfPlan === "PartTime") {
        minCredits = 20;
        maxCredits = 40;
    }
    else if (props.typeOfPlan === "FullTime") {
        minCredits = 60;
        maxCredits = 80;
    }



    const creditSum = actualExams.map(exam => exam.credits).reduce(
        (previousValue, currentValue) => previousValue + currentValue, 0);

    const addExam = (exam) => {
        setActualExams([...actualExams, exam]);
        setAvailableExams(availableExams.filter(ae => ae.code !== exam.code));
        setErrorFooter('');
    }

    const removeExam = (exam) => {
        setAvailableExams([...availableExams, exam]);
        setActualExams(actualExams.filter(ae => ae.code !== exam.code));
        setErrorFooter('');
    }


    const getActualExamsRow = () => {
        return actualExams.map(exam =>
            <ActualRow key={"AvailableRow - " + exam.code} exam={exam} availableExams={availableExams} actualExams={actualExams} removeExam={removeExam} />
        )
    }




    const getAvailableExamsRow = () => {
        return availableExams.map(exam =>
            <AvailableRow key={"Actual Row - " + exam.code} exam={exam} actualExams={actualExams} availableExams={availableExams} addExam={addExam} />)
    }



    const handleSave = async () => {
        if (loading === false) {
            //check if credits contraints are respected, eventually save
            if (creditSum > maxCredits)
                setErrorFooter(`You can have a maximum of ${maxCredits} credits, you have ${creditSum}`)
            else if (creditSum < minCredits)
                setErrorFooter(`You need at least ${minCredits} credits, you have ${creditSum}`)
            else {
                setLoading(true);
                let flag = await props.savePlan(actualExams, props.typeOfPlan)
                setLoading(false);
                if (flag == null)
                    props.handleClose();
                else {
                    if (Array.isArray(flag))
                        flag = flag.join(" - ")
                    setErrorFooter(flag)
                }
            }
        }
    }

    return (<>
        <Modal key={props.customKey} size='xl' show={props.show} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Study Plan - {props.typeOfPlan}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h2 className="center">Actual Exams</h2>
                <h5 className="center">Sum of credits = {creditSum} - (min:{minCredits}, max:{maxCredits})</h5>
                <Table bordered style={{ border: "4px solid black" }}>
                    <thead>
                        <tr key="thTop">
                            <th className="center">Code</th>
                            <th className="center">Name</th>
                            <th className="center">Credits</th>
                            <th className="center">Enrolled</th>
                            <th className="center">Max students</th>
                            <th className="center" style={{width: '10%'}}>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getActualExamsRow()}
                    </tbody>
                </Table>

                <h2 className="center">Available Exams</h2>
                <Table bordered style={{ border: "4px solid black" }}>
                    <thead>
                        <tr key={"thBottom"}>
                            <th className="center">Code</th>
                            <th className="center">Name</th>
                            <th className="center">Credits</th>
                            <th className="center">Enrolled</th>
                            <th className="center">Max students</th>
                            <th className="center" style={{width: '10%'}}>Add</th>
                        </tr>
                    </thead>
                    <tbody>{getAvailableExamsRow()}</tbody>
                </Table>
                <Row>
                    {errorFooter && <Alert variant={"warning"} dismissible onClose={() => { setErrorFooter('') }}><b>{errorFooter}</b></Alert>}
                </Row>
                <Row>
                    <Col>
                        <div className="d-grid gap-2">
                            <Button variant="danger" onClick={props.handleClose}>Cancel</Button>
                        </div>
                    </Col>
                    <Col>
                        <div className="d-grid gap-2">
                            <Button variant="primary" onClick={handleSave}>Save changes</Button>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    </>)



}



function AvailableRow(props) {

    const exam = props.exam;
    const actualExams = props.actualExams;
    const availableExams = props.availableExams;

    //function to get all incompatibility exams present in the table
    const checkCompatibility = (exam) => {
        const incCourses = actualExams.filter(val => exam.incompatible.includes(val.code));
        return incCourses.map(inc => { return { name: inc.name, code: inc.code } });
    }

    //function to get all requested exams present in the table
    const checkRequested = (exam) => {
        if (exam.preparatoryCourse && !actualExams.map(e => e.code).includes(exam.preparatoryCourse)) {
            const prep = availableExams.filter(av => av.code === exam.preparatoryCourse)
            return { name: prep[0].name, code: prep[0].code }
        }
        else return false;
    }

    const incCourses = checkCompatibility(exam);
    const requested = checkRequested(exam);
    let message = [];

    incCourses.forEach(inc => message.push("Incompatible with " + inc.code + " " + inc.name))

    if (requested) message.push("Is requested " + requested.code + " " + requested.name);

    if (!message.length) {
        //row without errors
        return (<tr >
            <td className="center">{exam.code}</td>
            <td className="center">{exam.name}</td>
            <td className="center">{exam.credits}</td>
            <td className="center">{exam.enrolled}</td>
            <td className="center">{exam.maxStudents == null ? "-" : exam.maxStudents}</td>
            <td className="center"><PlusCircleDotted className="inline" onClick={() => props.addExam(exam)} /></td>
        </tr>)
    }
    else {
        //special row with all the errors
        return (<>
            <tr className="grey"  >
                <td className="red center">{exam.code}</td>
                <td className="red center">{exam.name}</td>
                <td className="red center">{exam.credits}</td>
                <td className="red center">{exam.enrolled}</td>
                <td className="red center">{exam.maxStudents == null ? "-" : exam.maxStudents}</td>
                <td className="center">
                    <OverlayTrigger placement="right" overlay={
                        <Tooltip id={"tooltip of " + exam.code}>{message.map(m => <p key={m}>{m}</p>)}</Tooltip>}>
                        <PlusCircleDotted key={exam.code + "button"} color="#ff0000" />
                    </OverlayTrigger></td>
            </tr>
        </>)
    }
}


function ActualRow(props) {
    const exam = props.exam;
    const actualExams = props.actualExams;


    const checkPreparatory = (exam) => {
        const filtered = actualExams.filter(e => e.code !== exam.code && e.preparatoryCourse !== null)

        let messages = [];

        for (let i = 0; i < filtered.length; i++) {
            if (filtered[i].preparatoryCourse === exam.code)
                messages.push({ name: filtered[i].name, code: filtered[i].code });
        }

        return messages;
    }


    //load preparatory course for the exam
    let prepCourse = checkPreparatory(exam);
    if (prepCourse.length !== 0) {
        return (<>
            {/*if there is a prep course for this exam, the row is marked and shows the name*/}
            <tr className="grey"  >
                <td className="red center">{exam.code}</td>
                <td className="red center">{exam.name}</td>
                <td className="red center">{exam.credits}</td>
                <td className="red center">{exam.enrolled}</td>
                <td className="red center">{exam.maxStudents == null ? "-" : exam.maxStudents}</td>
                <td className="center">
                    <OverlayTrigger placement="right" overlay={
                        <Tooltip id={"tooltip of " + exam.code}>
                            {prepCourse.map(prep => <p key={prep.code + " " + exam.code}>{"It is needed from " + prep.code + " " + prep.name}</p>)}
                        </Tooltip>}>
                        <TrashFill key={exam.code + "button"} color="#ff0000" />
                    </OverlayTrigger></td>
            </tr>
        </>)

    }
    else return (
        <tr>
            <td className="center">{exam.code}</td>
            <td className="center">{exam.name}</td>
            <td className="center">{exam.credits}</td>
            <td className="center">{exam.enrolled}</td>
            <td className="center">{exam.maxStudents == null ? "-" : exam.maxStudents}</td>
            <td className="center"><TrashFill onClick={() => props.removeExam(exam)} /></td>
        </tr>)
}


export default MyModal;
