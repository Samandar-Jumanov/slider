import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { CreateUserDto, LoginDto } from "./userModel";

class UserController {
  public getAccount: RequestHandler = async (req: Request, res: Response) => {
    const user = req.user
    const serviceResponse = await userService.getUserAccount(String(user?.userId));
    return handleServiceResponse(serviceResponse, res);
  };

  public createAccount: RequestHandler = async (req: Request, res: Response) => {
    const data  : CreateUserDto= await  req.body
    const serviceResponse = await userService.createAccount(data);
    return handleServiceResponse(serviceResponse, res);
  };

  public loginAccount: RequestHandler = async (req: Request, res: Response) => {
    const data  : LoginDto= await  req.body
    const serviceResponse = await userService.loginAccount(data);
    return handleServiceResponse(serviceResponse, res);
  };

  public refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const data  : { token : string }= await  req.body
    const userId = req.user?.userId
    const serviceResponse = await userService.refreshToken(data.token , String(userId));
    return handleServiceResponse(serviceResponse, res);
  };

 
};



export const userController = new UserController();
