import type { Request, RequestHandler, Response } from "express";

import { adService } from "@/api/ad/ad.service";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { AdStatus, CreateAdDto, UpdateAdDto } from "./ad.model";

class AdController {
  public getAd: RequestHandler = async (req: Request, res: Response) => {
    const id =  req.params.id
    const serviceResponse = await adService.getAd(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createAd: RequestHandler = async (req: Request, res: Response) => {
    const data  : CreateAdDto= await  req.body
    const user = req.user;

    if(!user) {
          return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = user?.userId
    const serviceResponse = await adService.createAd(data , userId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateAd: RequestHandler = async (req: Request, res: Response) => {
    const data  : UpdateAdDto = await  req.body
    const serviceResponse = await adService.updateAd(data);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteAd : RequestHandler = async ( req : Request, res: Response) => {
    const id =  req.params.id
    const serviceResponse = await adService.deleteAd(id);
    return handleServiceResponse(serviceResponse, res);
  }


  public getAds : RequestHandler = async ( req : Request, res: Response) => {
    const status  = req.query.status 
    const serviceResponse = await adService.getAds(status as AdStatus );
    return handleServiceResponse(serviceResponse, res);
  }

  

  


  
}

export const adController = new AdController();
