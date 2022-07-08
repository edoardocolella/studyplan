import { Navbar, Container, Form, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { LoginButton, LogoutButton } from "./customAuthComponents";

function MyNavbar(props) {
    const location = useLocation()
    const logoutLoginButton = () => {

        if (props.user != null)
            return (<LogoutButton logout={props.handleLogout} />)
        else if (location.pathname !== "/login")
            return (<LoginButton login={props.handleLogin} />)
        else
            return (<Form onSubmit={props.goHome}>
                <div className="d-grid gap-2">
                    <Button variant="success" type='submit'>Home</Button>
                </div>
            </Form>)
    }

    return (
        <Navbar bg="primary" variant="dark">
            <Container fluid>

                <Navbar.Brand>
                    Study Plan
                </Navbar.Brand>
                {props.user !== undefined && <Navbar.Brand>
                    {props.user.name + " " + props.user.surname}
                </Navbar.Brand>}
                {logoutLoginButton()}
            </Container>
        </Navbar>
    );
}

export default MyNavbar;