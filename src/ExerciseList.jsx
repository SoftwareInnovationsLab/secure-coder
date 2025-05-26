import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Col, Container, ListGroup, Row } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

function ExerciseList() {
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/exercises`);
                const data = await response.json();
                setExercises(data);
                console.error(response);
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        fetchExercises();
    }, []);

    return (
        <Container>
            <h1>{process.env.REACT_APP_TITLE}</h1>
            <Row>
                <Col>
                    <p>
                        Welcome to {process.env.REACT_APP_TITLE}.
                        This site is designed to provide you with small programming exercises that focus on safety/security-related bugs and vulnerabilities.
                        The exercises are categorized according to the common weakness enumeration (CWE) that they train.
                        Additionally, each exercise is tagged as either <Badge bg="danger" pill>attack</Badge> or <Badge bg="primary" pill>defend</Badge>.
                        The attack exercises focus on crafting inputs that exploit or take advantage of the vulnerabilities whereas the defend ones aim to patch or eliminate the bugs.
                        For your convenience, each category contains links to additional training materials or resources.
                    </p>
                    <p>
                        Please select from the list of available exercises below.
                        We request that you attempt both an attack and defend exercise from at least one of the categories.
                        However, if you feel so inclined, please feel free to attempt any or all of the others.
                    </p>
                </Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs={8}>
                    <h3>Available Exercises</h3>
                    {Object.entries(exercises).map(([category, exercises]) => (
                        <>
                            <Row>
                                <Col><h4>{category}</h4></Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ListGroup>
                                        {exercises.filter(exercise => exercise.type === 'resource').map((exercise) => (
                                            <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                                <div className="ms-2 me-auto">
                                                    <Link to={exercise.url} target="_blank">{exercise.title}</Link>
                                                </div>
                                                <Badge bg="success" pill>resource</Badge>
                                            </ListGroup.Item>
                                        ))}
                                        {exercises.filter(exercise => exercise.type === 'offensive').map((exercise) => (
                                            <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                                <div className="ms-2 me-auto">
                                                    <Link to={`/exercise/${exercise.id}`}>{exercise.title}</Link>
                                                </div>
                                                <Badge bg="danger" pill>attack</Badge>
                                            </ListGroup.Item>
                                        ))}
                                        {exercises.filter(exercise => exercise.type === 'defensive').map((exercise) => (
                                            <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                                <div className="ms-2 me-auto">
                                                    <Link to={`/exercise/${exercise.id}`}>{exercise.title}</Link>
                                                </div>
                                                <Badge bg="primary" pill>defend</Badge>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Col>
                            </Row>
                            <br></br>
                        </>
                    ))}
                </Col>
                <Col></Col>
            </Row>
        </Container >
    );
}

export default ExerciseList;
