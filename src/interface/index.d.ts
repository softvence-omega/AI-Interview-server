import { JwtPayload } from "jsonwebtoken";

declare global{
    namespace Express{
        interface Request{
            user:JwtPayload,
            files: {
                resumeFile: Express.Multer.File[];
                certificateFile: Express.Multer.File[];
              };
        }
    }
}