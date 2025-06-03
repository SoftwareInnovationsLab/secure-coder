import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from '../auth/AuthContext';
import { useBreadcrumb } from "../context/BreadcrumbsContext";

type Exercise = {
    id: string;
    title: string;
    type: string;
    tags: string[];
};

export default function ExerciseList() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, isSuperUser } = useAuth();
    const { setBreadcrumb } = useBreadcrumb();

    useEffect(() => {
        axios
            .get("http://localhost:4000/api/exercises")
            .then((res) => {
                setExercises(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch exercises", err);
            })
            .finally(() => {
                setLoading(false);
            });
        setBreadcrumb([
            { label: 'Home' },
            { label: 'Exercises' }
        ])
    }, [setBreadcrumb]);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this exercise? This action cannot be undone."
        );
        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:4000/api/exercises/${id}`);
            setExercises((prev) => prev.filter((ex) => ex.id !== id));
            alert("Exercise deleted.");
        } catch (error) {
            alert("Failed to delete exercise.");
            console.error(error);
        }
    };

    function ExerciseEntry(ex: Exercise) {
        return (
            <li key={ex.id} className="border-b py-3 flex flex-col">
                <div className="flex justify-between items-center">
                    <div className="text-left font-semibold">
                        <span
                            className={`mr-2 text-sm font-semibold ${ex.type.toLowerCase() === "offensive"
                                ? "text-red-600"
                                : ex.type.toLowerCase() === "defensive"
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`}
                        >
                            [{ex.type}]
                        </span>
                        <span>{ex.title}</span>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/exercises/${ex.id}/do`}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            role="button"
                        >
                            Do
                        </Link>
                        {isAuthenticated && (<>
                            <Link
                                to={`/exercises/${ex.id}/edit`}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                role="button"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(ex.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                aria-label={`Delete exercise ${ex.title}`}
                            >
                                Delete
                            </button>
                        </>)}
                    </div>
                </div>
                {ex.tags && ex.tags.length > 0 && (
                    <div className="text-left mt-1 text-xs text-gray-500 space-x-1">
                        {ex.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-block bg-gray-200 rounded px-2 py-0.5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </li>
        );
    }

    if (loading) return <div>Loading exercises...</div>;

    return (
        <>
            <div className="max-w-4xl mx-auto p-6">
                <p className="text-left">
                    Welcome to <code>SecureCoder</code>: Secure Programming Exercises.
                    This site is designed to provide you with small programming exercises that focus on safety/security-related bugs and vulnerabilities.
                    The exercises are categorized according to the common weakness enumeration (CWE) that they train.
                    Additionally, each exercise is tagged as either <span className="font-semibold text-red-600">[offensive]</span> or <span className="font-semibold text-blue-600">[defensive]</span>.
                    The attack exercises focus on crafting inputs that exploit or take advantage of the vulnerabilities whereas the defend ones aim to patch or eliminate the bugs.
                    For your convenience, each category contains links to additional materials or resources.
                </p>
                <br></br>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Exercises</h1>
                    {isAuthenticated && (
                        <Link
                            to="/exercises/new"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            + New
                        </Link>
                    )}
                </div>

                {exercises.length === 0 ? (
                    <p>No exercises found.</p>
                ) : (
                    <ul>
                        {exercises.map((ex) => (
                            <>
                                {ex.tags.includes('generated') ? (
                                    isSuperUser ? <ExerciseEntry {...ex} /> : <></>
                                ) : <ExerciseEntry {...ex} />}
                            </>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
