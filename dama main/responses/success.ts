interface Msg {
    getMsg():{status: number, msg: string};
}

export class Success implements Msg {
    getMsg(): { status: number; msg: string; } {
        return {
            status: 200,
            msg: "Successful operation"
        }
    }
}