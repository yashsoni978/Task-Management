import { JwtPayload } from "jsonwebtoken";
export interface TokenPayload extends JwtPayload {
    userId: string;
}
export declare function generateAccessToken(userId: string): string;
export declare function generateRefreshToken(userId: string): string;
export declare function verifyAccessToken(token: string): TokenPayload;
export declare function verifyRefreshToken(token: string): TokenPayload;
//# sourceMappingURL=jwt.d.ts.map