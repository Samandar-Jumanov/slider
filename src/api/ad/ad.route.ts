import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AdBaseSchema,  GetAdSchema, CreateAdSchema, UpdateAdStatusSchema } from "@/api/ad/ad.model";
import { validateRequest } from "@/common/utils/httpHandlers";
import { adController } from "./ad.controller";
import { authMiddleware, checkRole } from "@/common/middleware/auth";

export const adRegistery = new OpenAPIRegistry();
export const adRouter : Router = express.Router();

adRegistery.register("Ads", AdBaseSchema);


adRegistery.registerPath({
  method: "get",
  path: "/ads",
  tags: ["Ads"],
  request : {
        query :  z.object({
            status : z.enum(["ACTIVE" , "PENDING" , "REJECTED"])
        })
  },
  responses: createApiResponse(AdBaseSchema, "Success"),
});

adRouter.get("/",   adController.getAds);

adRegistery.registerPath({
  method: "get",
  path: "/ads/{id}",
  tags: ["Ads"],
  request: { params:  GetAdSchema.shape.params },
  responses: createApiResponse(AdBaseSchema, "Success"),
});

adRouter.get("/:id",  authMiddleware , validateRequest(GetAdSchema), adController.getAd);


adRegistery.registerPath({
  method: "post",
  path: "/ads",
  tags: ["Ads"],
  request : {
    body: {
      content: {
        'application/json': {
          schema: CreateAdSchema
        }
      }
    }
  },
  responses: createApiResponse(AdBaseSchema, "Success"),
});

adRouter.post("/", authMiddleware , checkRole,  validateRequest(z.object({ body : CreateAdSchema})), adController.createAd);


adRegistery.registerPath({
  method: "put",
  path: "/ads/update/{id}",
  tags: ["Ads"],
  request : {
    params : GetAdSchema.shape.params,
    body: {
      content: {
        'application/json': {
          schema: UpdateAdStatusSchema
        }
      }
    }
  },
  responses: createApiResponse(AdBaseSchema, "Success"),
  
});

adRouter.post("/update/:id", authMiddleware, validateRequest(z.object({
      body : UpdateAdStatusSchema
})), adController.updateAd);



adRegistery.registerPath({
  method: "delete",
  path: "/ads/delete/{id}",
  tags: ["Ads"],
  request : {
        params : GetAdSchema.shape.params
  },
  responses: createApiResponse(AdBaseSchema, "Success"),
});

adRouter.delete("/delete/:id",  authMiddleware, adController.deleteAd);











//  REMAINDER : do not use formdata here , beacase of client nextjs


