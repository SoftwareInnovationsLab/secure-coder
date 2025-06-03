import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';

import { useBreadcrumb } from "../context/BreadcrumbsContext";
import { HintsAccordion } from "./Hints";

type ExerciseFormData = {
    exerciseId: number;
    code: string;
    input: string;
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

interface ReadOnlyCodeEditorProps {
    code: string;
}

function ReadOnlyCodeEditor({ code }: ReadOnlyCodeEditorProps) {
    return (
        <Editor
            height="400px"
            defaultLanguage="c"
            value={code}
            options={{
                minimap: { enabled: false },
                readOnly: true,
                scrollBeyondLastLine: false,
                theme: "vs-dark",
            }}
        />
    );
}

interface EditableCodeEditorProps {
    code: string;
    setCode: (val: string) => void;
}

function EditableCodeEditor({ code, setCode }: EditableCodeEditorProps) {
    return (
        <Editor
            height="400px"
            defaultLanguage="c"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
                minimap: { enabled: false },
                readOnly: false,
                scrollBeyondLastLine: false,
                theme: "vs-dark",
            }}
        />
    );
}

export default function Exercise({ exerciseId }: ExerciseFormProps) {
    const location = useLocation();
    const { setBreadcrumb } = useBreadcrumb();
    const { register, handleSubmit, reset } = useForm<ExerciseFormData>();

    const [vulnerableCode, setVulnerableCode] = useState("// vulnerable code");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [input, setInput] = useState("");
    const [explanation, setExplanation] = useState("");
    const [results, setResults] = useState<any>(null);
    const [tag, setTag] = useState("");
    const [type, setType] = useState("");
    const [hints, setHints] = useState([]);

    useEffect(() => {
        if (exerciseId) {
            axios
                .get(`http://localhost:4000/api/exercises/${exerciseId}`)
                .then((res) => {
                    const ex = res.data;
                    setVulnerableCode(ex.vulnerableCode);
                    setDescription(ex.description);
                    setTitle(ex.title);
                    setExplanation(ex.explanation);
                    setInput(ex.input);
                    setTag(ex.tags[0]);
                    setType(ex.type);
                    setHints(ex.hints);
                })
                .catch((err) => {
                    console.error("Failed to load exercise:", err);
                    alert("Failed to load exercise for editing.");
                });
        }
        setBreadcrumb([
            { label: 'Home', path: '/' },
            { label: tag },
            { label: title },
        ]);
    }, [exerciseId, location.state, reset, setBreadcrumb, tag, title]);

    const onSubmit = async (data: ExerciseFormData) => {
        let finalInput = data.input;

        if (type === "defensive") {
            finalInput = vulnerableCode; // use code as input
        }

        if (!finalInput) {
            alert("Must provide input");
            return;
        }

        const payload = {
            ...data,
            input: finalInput,
        };

        try {
            if (exerciseId) {
                const res = await axios.post(
                    `http://localhost:4000/api/exercises/${exerciseId}/submissions`,
                    payload
                );
                setResults(res.data);
                alert("Exercise submitted!");
            }
        } catch (error) {
            alert("Error saving exercise.");
            console.error(error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-6">
                <section className="space-y-6">
                    <h1 className="text-3xl font-bold text-left">{title}</h1>
                    <div className="markdown-body">
                        <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                </section>

                {/* Code Editors */}
                {type === 'defensive' ? (
                    <EditableCodeEditor
                        code={vulnerableCode}
                        setCode={setVulnerableCode}
                    />
                ) : (
                    <ReadOnlyCodeEditor code={vulnerableCode} />
                )}

                {type === 'offensive' && (
                    <div className="flex space-x-4 items-center">
                        <label className="block font-semibold mb-1">Input:</label>
                        <input
                            type="text"
                            placeholder={input}
                            {...register("input")}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <section>
                    {results && (
                        <>
                            <div>
                                {results.status?.description === 'Accepted'
                                    ? <Alert type="success">Success! {results.stderr}</Alert>
                                    : <Alert type="danger">Try again. {results.stderr}</Alert>}
                            </div>
                            {results.status?.description === 'Accepted' && (
                                <>
                                    <br></br>
                                    <h2 className="text-2xl font-bold text-left">Explanation</h2>
                                    <div className="markdown-body">
                                        <ReactMarkdown>{explanation}</ReactMarkdown>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </section>

                <section className="space-y-4">
                    <HintsAccordion hints={hints} />
                </section>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </div>
            </form >
        </>
    );
}
