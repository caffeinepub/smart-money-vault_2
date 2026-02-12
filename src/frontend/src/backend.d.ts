import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Signal {
    direction: Variant_buy_sell;
    signalId: string;
    timestamp: Time;
    quantity: bigint;
    price: number;
}
export type Result_2 = {
    __kind__: "ok";
    ok: JwtToken;
} | {
    __kind__: "err";
    err: Error_;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface StrategyBundle {
    entryStrategy: bigint;
    paths: Array<StrategyPath>;
    items: Array<Strategy>;
    inputSymbol: Symbol;
    outputSymbol: Symbol;
}
export interface AuditEntry {
    principal: Principal;
    action: string;
    timestamp: Time;
    details: string;
}
export type Result_5 = {
    __kind__: "ok";
    ok: SubscriptionTier;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result_1 = {
    __kind__: "ok";
    ok: StrategicVault;
} | {
    __kind__: "err";
    err: Error_;
};
export interface HeartbeatData {
    cycles: bigint;
    botStatus: Status;
    lastHeartbeatAt: Time;
    verifiedLicense: boolean;
}
export interface StrategicVault {
    jwt: string;
    strategies: Array<StrategyBundle>;
}
export type Result_4 = {
    __kind__: "ok";
    ok: Array<SubscriptionTier>;
} | {
    __kind__: "err";
    err: Error_;
};
export type AccountId = string;
export interface License {
    active: boolean;
    createdAt: Time;
    updatedAt?: Time;
    revokedAt?: Time;
}
export type SignalFetchResult = {
    __kind__: "ok";
    ok: Array<Signal>;
} | {
    __kind__: "err";
    err: BotError;
};
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StrategyPath {
    deployedAt: Time;
    items: Array<Strategy>;
    pathSymbols: Array<Symbol>;
}
export interface Strategy {
    entryTime: Time;
    deployedAt: Time;
    name: string;
    side: TradeSide;
    priceFeed: Symbol;
}
export interface Symbol {
    token: string;
    feed: string;
    currency: string;
    exchange: string;
}
export interface BotProfile {
    publicKey?: Uint8Array;
    uplinkStatus: boolean;
    botUrl?: string;
    lastHeartbeat: Time;
    cyclesWarning: boolean;
}
export interface Trade {
    entryTimestamp: Time;
    accountId: AccountId;
    instrument: string;
    side: TradeSide;
    size: number;
    tradeId: string;
    exitTimestamp?: Time;
    entryPrice: number;
    exitPrice?: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SubscriptionTier {
    id: string;
    features: Array<string>;
    active: boolean;
    maxApiCalls?: bigint;
    name: string;
    maxBots?: bigint;
    priceInCents: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result_3 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: Error_;
};
export interface JwtToken {
    jwt: string;
    accountId: AccountId;
}
export type BotError = {
    __kind__: "InvalidUrl";
    InvalidUrl: string;
} | {
    __kind__: "FetchFailed";
    FetchFailed: string;
};
export interface UserProfile {
    timezone?: string;
    botPublicKey?: Uint8Array;
    notificationsEnabled: boolean;
    accountId?: string;
    name: string;
    bot_id?: string;
    planTier?: Variant_Pro_Free_Whale;
}
export enum Error_ {
    InvalidInput = "InvalidInput",
    LicenseInactive = "LicenseInactive",
    TimestampOutOfWindow = "TimestampOutOfWindow",
    InvalidSignature = "InvalidSignature",
    Unauthorized = "Unauthorized",
    UnknownBotId = "UnknownBotId",
    MissingBotKey = "MissingBotKey",
    ReplayDetected = "ReplayDetected"
}
export enum Status {
    SUSPENDED = "SUSPENDED",
    ACTIVE = "ACTIVE"
}
export enum UplinkStatus {
    EXECUTE = "EXECUTE",
    STANDBY = "STANDBY"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Pro_Free_Whale {
    Pro = "Pro",
    Free = "Free",
    Whale = "Whale"
}
export enum Variant_buy_sell {
    buy = "buy",
    sell = "sell"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    check_uplink(bot_id: string, signature: Uint8Array): Promise<UplinkStatus>;
    createOrUpdateLicense(accountId: AccountId, active: boolean): Promise<void>;
    create_tier(tier: SubscriptionTier): Promise<Result>;
    fetchSignals(): Promise<SignalFetchResult>;
    getAllLicenses(): Promise<Array<[AccountId, License]>>;
    getAuditLog(limit: bigint): Promise<Array<AuditEntry>>;
    getBotProfile(): Promise<BotProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHeartbeatData(_accountId: AccountId): Promise<HeartbeatData>;
    getLicenseStatus(accountId: AccountId, signature: Uint8Array, nonce: string, timestamp: Time): Promise<boolean>;
    getMyLicenseStatus(): Promise<License | null>;
    getTradesPaginated(accountId: AccountId | null, startTime: Time | null, endTime: Time | null, start: bigint, limit: bigint): Promise<Array<Trade>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    get_tier(id: string): Promise<Result_5>;
    isCallerAdmin(): Promise<boolean>;
    list_tiers(): Promise<Result_4>;
    registerBotPublicKey(publicKey: Uint8Array): Promise<void>;
    revokeLicense(accountId: AccountId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBotUrl(url: string): Promise<Result_3>;
    storeJwt(jwt: string, accountId: AccountId): Promise<Result_2>;
    storeStrategicVault(vaultData: StrategicVault, _accountId: AccountId): Promise<Result_1>;
    submitTrade(trade: Trade, signature: Uint8Array, nonce: string, timestamp: Time): Promise<void>;
    toggle_tier_active(id: string, active: boolean): Promise<Result>;
    toggle_uplink(state: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    update_profile(profile: UserProfile): Promise<void>;
    update_tier(id: string, patch: {
        features?: Array<string>;
        active?: boolean;
        maxApiCalls?: bigint | null;
        name?: string;
        maxBots?: bigint | null;
        priceInCents?: bigint;
    }): Promise<Result>;
}
