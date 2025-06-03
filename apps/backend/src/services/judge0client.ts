import axios from "axios";

enum Judge0Status {
    InQueue = 1,
    Processing,
    Accepted,
    WrongAnswer,
    TimeLimitExceeded,
    CompilationError,
    RuntimeErrorSIGSEGV,
    RuntimeErrorSIGXFSZ,
    RuntimeErrorSIGFPE,
    RuntimeErrorSIGABRT,
    RuntimeErrorNZEC,
    RuntimeErrorOther,
    InternalError,
    ExecFormatError
}

export interface Judge0ApiRequest {
    source_code: string,
    language_id: number,
    stdin: string,
    command_line_arguments: string,
    compiler_options: string
}

export interface Judge0ApiResponse {
    status: number,
    feedback?: string,
    compile_output?: string,
}

const api = axios.create({
    baseURL: process.env.JUDGE0_URL || 'http://localhost:2358',
});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function buildSubmission(source: string, driver: string, input: string | null): Promise<Judge0ApiRequest> {
    return {
        source_code: btoa(source + '\n' + driver),
        language_id: 50,
        stdin: input ? btoa(input) : '',
        command_line_arguments: input ?? '',
        compiler_options: '-fstack-protector-all',
    };
}

export async function submitToJudge0(payload: Judge0ApiRequest): Promise<Judge0ApiResponse> {
    const submissionResponse = await api.post('/submissions?base64_encoded=true', payload);
    const submissionToken = submissionResponse.data.token;

    let result;
    let status: number | undefined;

    while (true) {
        result = await api.get(`/submissions/${submissionToken}?base64_encoded=true`);
        status = result.data.status?.id;
        if (status === Judge0Status.InQueue || status === Judge0Status.Processing) {
            await sleep(1000);
        } else {
            break;
        }
    }

    const response: Judge0ApiResponse = {
        status: status ?? Judge0Status.InternalError,
        compile_output: result.data.compile_output ? atob(result.data.compile_output) : '',
    };

    if (status === Judge0Status.CompilationError) {
        response.feedback = 'Compilation error: ' + response.compile_output;
    } else if (result.data.stderr) {
        response.feedback = atob(result.data.stderr);
    }

    return response;
}
