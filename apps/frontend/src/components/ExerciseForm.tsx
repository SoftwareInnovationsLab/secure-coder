import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import axios from "axios";

import Title from "./Title";
import { useBreadcrumb } from "../context/BreadcrumbsContext";

type ExerciseFormData = {
    type: string;
    title: string;
    description: string;
    driverCode: string;
    vulnerableCode: string;
    input: string;
    solution: string;
    hints: string;
    explanation: string;
    tags: string;
};

type ExerciseFormProps = {
    exerciseId?: string;
};

function Alert({ type = 'info', children }) {
    // Define styles per alert type
    const baseClasses = "flex items-center p-4 rounded border text-left";
    const typeStyles = {
        info: "bg-blue-100 border-blue-400 text-blue-700",
        success: "bg-green-100 border-green-400 text-green-700",
        warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
        danger: "bg-red-100 border-red-400 text-red-700",
    };

    return (
        <div className={`${baseClasses} ${typeStyles[type]}`}>
            <div>{children}</div>
        </div>
    );
}

const codeDescriptions: Record<number, string> = {
    1: "In Queue",
    2: "Processing",
    3: "Success (zero exit code)",
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)",
    9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)",
    11: "Failure (non-zero exit code)",
    12: "Runtime Error (Other)",
    13: "Internal Error",
    14: "Exec Format Error"
};

const getDescription = (code: number): string => {
    return codeDescriptions[code] || "Unknown result code";
};

export default function ExerciseForm({ exerciseId }: ExerciseFormProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { setBreadcrumb } = useBreadcrumb();
    const { register, handleSubmit, reset, getValues } = useForm<ExerciseFormData>();

    const [driverCode, setDriverCode] = useState("// starter/driver code");
    const [vulnerableCode, setVulnerableCode] = useState("// vulnerable code");
    const [solution, setSolution] = useState("// solution code");
    const [validateResults, setValidateResults] = useState<any>(null);

    // Store current exercise data for cloning
    const [currentExerciseData, setCurrentExerciseData] = useState<ExerciseFormData & {
        driverCode: string;
        vulnerableCode: string;
        solution: string;
    } | null>(null);

    useEffect(() => {
        if (exerciseId) {
            axios
                .get(`http://localhost:4000/api/exercises/${exerciseId}`)
                .then((res) => {
                    const ex = res.data;
                    reset({
                        type: ex.type,
                        title: ex.title,
                        description: ex.description,
                        input: ex.input,
                        hints: ex.hints.join(", "),
                        explanation: ex.explanation,
                        tags: ex.tags.join(", "),
                    });
                    setDriverCode(ex.driverCode);
                    setVulnerableCode(ex.vulnerableCode);
                    setSolution(ex.solution);

                    // Save current exercise data for clone button
                    setCurrentExerciseData({
                        type: ex.type,
                        title: ex.title,
                        description: ex.description,
                        input: ex.input,
                        hints: ex.hints.join(", "),
                        explanation: ex.explanation,
                        tags: ex.tags.join(", "),
                        driverCode: ex.driverCode,
                        vulnerableCode: ex.vulnerableCode,
                        solution: ex.solution,
                    });
                    setBreadcrumb([
                        { label: 'Home', path: '/' },
                        { label: 'Edit' },
                        { label: ex.title }
                    ])
                })
                .catch((err) => {
                    console.error("Failed to load exercise:", err);
                    alert("Failed to load exercise for editing.");
                });
        } else {
            // create mode: check for clone data from location.state
            const clonedExercise = location.state?.clonedExercise;
            if (clonedExercise) {
                reset({
                    type: clonedExercise.type,
                    title: clonedExercise.title,
                    description: clonedExercise.description || "",
                    input: clonedExercise.input || "",
                    hints: Array.isArray(clonedExercise.hints)
                        ? clonedExercise.hints.join(", ")
                        : clonedExercise.hints || "",
                    explanation: clonedExercise.explanation || "",
                    tags: Array.isArray(clonedExercise.tags)
                        ? clonedExercise.tags.join(", ")
                        : clonedExercise.tags || "",
                });
                setDriverCode(clonedExercise.driverCode || "// starter/driver code");
                setVulnerableCode(clonedExercise.vulnerableCode || "// vulnerable code");
                setSolution(clonedExercise.solution || "// triggering input or patched function");
            }
            setBreadcrumb([
                { label: 'Home', path: '/' },
                { label: 'New exercise' }
            ])
        }
    }, [exerciseId, location.state, reset, setBreadcrumb]);

    const onSubmit = async (data: ExerciseFormData) => {
        const payload = {
            ...data,
            driverCode,
            vulnerableCode,
            solution,
            hints: data.hints
                .split(",")
                .map((hint) => hint.trim())
                .filter(Boolean),
            tags: data.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        try {
            if (exerciseId) {
                await axios.put(
                    `http://localhost:4000/api/exercises/${exerciseId}`,
                    payload
                );
                alert("Exercise updated!");
            } else {
                await axios.post("http://localhost:4000/api/exercises", payload);
                alert("Exercise created!");
                reset();
                setDriverCode("// starter/driver code");
                setVulnerableCode("// vulnerable code");
                setSolution("// solution code");
            }
        } catch (error) {
            alert("Error saving exercise.");
            console.error(error);
        }
    };

    const handleValidateClick = async () => {
        const formValues = getValues(); // Get values from the form
        const payload = {
            type: formValues.type,
            driver: driverCode,
            vulnerableCode: vulnerableCode,
            solution: solution
        };

        if (!vulnerableCode) {
            alert("Must provide vulnerable function");
            return;
        }
        if (!driverCode) {
            alert("Must provide driver function");
            return;
        }
        if (!solution) {
            alert("Must provide solution");
            return;
        }

        try {
            if (exerciseId) {
                const res = await axios.post(
                    `http://localhost:4000/api/exercises/validate`,
                    payload
                );
                setValidateResults(res.data);
                console.log(res.data);
                alert("Exercise submitted for validation...");
            }
        } catch (error) {
            alert("Error saving exercise.");
            console.error(error);
        }

        console.log("Validation Payload:", payload);

    };

    // Handler for Clone button on edit page
    const handleCloneClick = () => {
        if (!currentExerciseData) return;
        // Remove any identifying id info (if present)
        const cloneData = { ...currentExerciseData };
        navigate("/exercises/new", { state: { clonedExercise: cloneData } });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                {exerciseId ? "Edit Exercise" : "Create Exercise"}
            </h1>

            <section className="space-y-4">
                <div className="flex space-x-4 items-center">
                    <label className="font-semibold mb-1">Title</label>
                    <input
                        type="text"
                        placeholder="Title"
                        {...register("title", { required: true })}
                        className="flex-grow p-2 border rounded" />
                    <label className="font-semibold mb-1">Type</label>
                    <select
                        {...register("type", { required: true })}
                        className="w-40 p-2 border rounded"
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select type
                        </option>
                        <option value="offensive">Offensive</option>
                        <option value="defensive">Defensive</option>
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Description / Prompt</label>
                    <div className="text-left">Provide a prompt that describes the task to complete (Markdown supported):</div>
                    <textarea
                        placeholder="Description"
                        {...register("description")}
                        className="w-full p-3 border border-gray-300 rounded-md min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize vertical" />
                </div>
            </section>

            {/* Code Editors */}
            <section className="space-y-6">
                <div>
                    <label className="block font-semibold mb-2">Vulnerable Code</label>
                    <div className="text-left">Provide a vulnerable C function for students to exploit or patch:</div>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                        <Editor
                            height="400px"
                            defaultLanguage="c"
                            value={vulnerableCode}
                            onChange={(val) => setVulnerableCode(val || "")}
                            options={{ minimap: { enabled: false } }} />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2">Driver Code</label>
                    <div className="text-left">
                        Provide a driver function that calls the vulnerable function.
                        For <span className="font-semibold text-red-600">[offensive]</span> exercises, the driver function should produce an exit code of 0 if the <i>vulnerability is successfully triggered</i>, non-zero otherwise.
                        For <span className="font-semibold text-blue-600">[defensive]</span> exercises, the driver function should produce an exit code of 0 if the <i>vulnerability is NOT triggered</i>, non-zero otherwise:</div>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                        <Editor
                            height="400px"
                            defaultLanguage="c"
                            value={driverCode}
                            onChange={(val) => setDriverCode(val || "")}
                            options={{ minimap: { enabled: false } }} />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2">Solution</label>
                    <div className="text-left">Include either a triggering input or an acceptable patch for the vulnerable function:</div>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                        <Editor
                            height="400px"
                            defaultLanguage="c"
                            value={solution}
                            onChange={(val) => setSolution(val || "")}
                            options={{ minimap: { enabled: false } }} />
                    </div>
                </div>
            </section>
            <section>
                {validateResults && (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm space-y-4 text-left">
                        <h2 className="text-lg font-semibold text-gray-800">Validation Results</h2>

                        <div>
                            <span className="font-medium text-gray-700">Status:</span>{" "}
                            <span className="text-blue-700">{getDescription(validateResults.status?.id)}</span>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">Feedback (<code>stderr</code>):</span>
                            <pre className="mt-1 bg-gray-100 text-red-600 p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                                {validateResults.stderr || "No error output."}
                            </pre>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">Compilation Output:</span>
                            <pre className="mt-1 bg-gray-100 text-gray-800 p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                                {atob(validateResults.compile_output || "") || "No compilation output."}
                            </pre>
                        </div>
                    </div>
                )}
            </section>

            <button
                type="button"
                onClick={handleValidateClick}
                className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
            >
                Validate Exercise
            </button>

            {/* Additional Fields */}
            <section className="space-y-4">
                {/*<div>
                    <label className="block font-semibold mb-1">Input Specification</label>
                    <input
                        type="text"
                        placeholder="Input format or spec"
                        {...register("input")}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>*/}

                {/*<div>
                    <label className="block font-semibold mb-1">Hints (comma separated)</label>
                    <textarea
                        placeholder="Hint1, Hint2, Hint3"
                        {...register("hints")}
                        className="w-full p-3 border border-gray-300 rounded-md min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize vertical" />
                </div>*/}

                <div>
                    <label className="block font-semibold mb-1">Explanation</label>
                    <div className="text-left">Provide an explanation for the solution. Explanations may include the underlying cause of the vulnerability, what the implications of the vulnerability are, and how the vulnerability could be addressed (markdown supported):</div>
                    <textarea
                        placeholder="Explanation"
                        {...register("explanation")}
                        className="w-full p-3 border border-gray-300 rounded-md min-h-[250px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize vertical" />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Tags (comma separated)</label>
                    <input
                        type="text"
                        placeholder="tag1, tag2, tag3"
                        {...register("tags")}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </section>


            <div className="flex space-x-4">
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {exerciseId ? "Update Exercise" : "Save Exercise"}
                </button>

                {exerciseId && (
                    <>
                        <button
                            type="button"
                            onClick={handleCloneClick}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Clone
                        </button>
                        <button
                            type="button"
                            onClick={handleCloneClick}
                            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
                        >
                            Generate Similar
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}
