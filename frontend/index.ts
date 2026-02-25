export type SignalFetchResult = {
    __kind__: "ok";
    ok: {
        statusCode: bigint;
        body: string;
        timestamp: bigint;
    };
} | {
    __kind__: "err";
    err: BotError;
};
