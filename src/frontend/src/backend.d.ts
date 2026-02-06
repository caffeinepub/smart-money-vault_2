import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Symbol {
    token: string;
    feed: string;
    currency: string;
    exchange: string;
}
export type Time = bigint;
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
export interface StrategyBundle {
    entryStrategy: bigint;
    paths: Array<StrategyPath>;
    items: Array<Strategy>;
    inputSymbol: Symbol;
    outputSymbol: Symbol;
}
export type Result_1 = {
    __kind__: "ok";
    ok: JwtToken;
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
export type AccountId = string;
export type Result = {
    __kind__: "ok";
    ok: StrategicVault;
} | {
    __kind__: "err";
    err: Error_;
};
export interface License {
    active: boolean;
    createdAt: Time;
    updatedAt?: Time;
    revokedAt?: Time;
}
export interface JwtToken {
    jwt: string;
    accountId: AccountId;
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
export interface UserProfile {
    botPublicKey?: Uint8Array;
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
export enum TradeSide {
    buy = "buy",
    sell = "sell"
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
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateLicense(accountId: AccountId, active: boolean): Promise<void>;
    getAllLicenses(): Promise<Array<[AccountId, License]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHeartbeatData(_accountId: AccountId): Promise<HeartbeatData>;
    getLicenseStatus(accountId: AccountId, signature: Uint8Array, nonce: string, timestamp: Time): Promise<boolean>;
    getMyLicenseStatus(): Promise<License | null>;
    getTradesPaginated(accountId: AccountId | null, startTime: Time | null, endTime: Time | null, start: bigint, limit: bigint): Promise<Array<Trade>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    revokeLicense(accountId: AccountId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    storeJwt(jwt: string, accountId: AccountId): Promise<Result_1>;
    storeStrategicVault(vaultData: StrategicVault, _accountId: AccountId): Promise<Result>;
    submitTrade(trade: Trade, signature: Uint8Array, nonce: string, timestamp: Time): Promise<void>;
}
