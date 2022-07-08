import { useState } from 'react';
import { Form, Button, Row, Col, } from 'react-bootstrap';


function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    props.login({ username, password });
  }

  return (
    <>
      <Row>
        <Col sm={3}></Col>
        <Col sm={6}>
          <br />
          <h1 className='center'>Login</h1>
          <Form onSubmit={handleSubmit}>
            <br />
            <Form.Group controlId='username'>
              <h2 className='center'>Email</h2>
              <Form.Control type='email' value={username} autoComplete='username' onChange={ev => setUsername(ev.target.value)} required={true} />
            </Form.Group>

            <br />
            <Form.Group controlId='password'>
              <h2 className='center'>Password</h2>
              <Form.Control type='password' value={password} autoComplete='current-password' onChange={ev => setPassword(ev.target.value)} required={true} minLength={6} />
            </Form.Group>
            <br />
            <div className="d-grid gap-2">
              <Button variant="primary" size="lg" type='submit'>Login</Button>
            </div>
          </Form>
        </Col>
        <Col sm={3} ></Col>
      </Row>
    </>
  )
};

function LogoutButton(props) {
  return (
    <Row>
      <Col>
        <Button variant="danger" size='lg' onClick={props.logout}>Logout</Button>
      </Col>
    </Row>
  )
}

function LoginButton(props) {
  return (
    <Row>
      <Col>
        <Button variant="success" size='lg' onClick={props.login}>Login</Button>
      </Col>
    </Row>
  )
}

export { LoginForm, LogoutButton, LoginButton }