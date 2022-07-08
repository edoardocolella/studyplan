import { Col, Row, Table } from "react-bootstrap";
import { useState } from "react";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";
import "./tables.css"

function ExamTable(props) {

    const exams = props.exams;

    const getRow = () => {
        exams.sort((a, b) => a.name.localeCompare(b.name))
        return exams.map(exam => { return <ExamRow key={exam.code} exam={exam} exams={exams} /> })
    }

    return (<>
        <br />
        <h1 className="center">Exam Table</h1>
        <br />
        <Row>
            <Col sm={1}></Col>
            <Col sm={10}>
                <Table bordered>
                    <thead>
                        <tr >
                            <th>Code</th>
                            <th>Name</th>
                            <th className="center">Credits</th>
                            <th className="center">Enrolled</th>
                            <th className="center">Max Students</th>
                            <th className="center">Expand</th>
                        </tr>
                    </thead>
                    <tbody>{getRow()}</tbody>
                </Table>
            </Col>
            <Col sm={1}></Col>
        </Row>
    </>)
}

function ExamRow(props) {
    const exam = props.exam
    const [expanded, setExpanded] = useState(false)

    const expand = () => {
        setExpanded(!expanded);
    }

    //if expanded, a new row with an internal Table is shown with all the messages
    const showIncompatibleAndPreparatory = () => {
        if (exam.preparatoryCourse || exam.incompatible.length) {
            return <tr key={exam.code}>
                <td colSpan={5}>
                    <Table bordered>
                        <tbody>
                            {showPreparatory()}
                            {showIncompatibles()}
                        </tbody>
                    </Table>
                </td>
            </tr>
        }
    }

    const showPreparatory = () => {
        if (exam.preparatoryCourse) {
            const prepC = props.exams.filter(e => e.code === exam.preparatoryCourse)

            return <tr>
                <td className="center twentyfive">Required</td>
                <td className="center twentyfive"><b>{exam.preparatoryCourse}</b></td>
                <td className="center fifty"><b>{prepC[0].name}</b></td>
            </tr>
        }
    }

    const showIncompatibles = () => {

        let incompatibleNames = [];
        if (exam.incompatible.length !== 0) {
            exam.incompatible.forEach(i => {
                let examName = props.exams.filter(e => e.code === i)
                incompatibleNames.push({ code: examName[0].code, name: examName[0].name });
            });
        }

        return incompatibleNames.map(exam => {
            return <tr key={exam.code}>
                <td className="center twentyfive">Incompatible with</td>
                <td className="center twentyfive"><b>{exam.code}</b></td>
                <td className="center fifty"><b>{exam.name}</b></td>

            </tr>
        })
    }

    return (<><tr>
        <td>{exam.code}</td>
        <td>{exam.name}</td>
        <td className="center">{exam.credits}</td>
        <td className="center">{exam.enrolled}</td>
        <td className="center">{exam.maxStudents == null ? "-" : exam.maxStudents}</td>
        {!expanded ? <td className="center">{(exam.incompatible.length !== 0 || exam.preparatoryCourse) ?
            <CaretDownFill className="inline" onClick={expand} /> : ""}</td>
            : <td className="center"><CaretUpFill className="inline" onClick={expand} /></td>}
    </tr>
        {!expanded ? <></> : showIncompatibleAndPreparatory()}
    </>
    )
}

export default ExamTable;