import { ServiceResponse } from "@/common/models/serviceResponse";
import logger from "@/utils/logger";
import prisma from "@/lib/prisma";
import { CreateAdDto, UpdateAdDto , AdBaseDto, AdStatus  } from "./ad.model";

export class AdService {
    public async  createAd  ( 
        data : CreateAdDto , userId : string
    ) : Promise<ServiceResponse<AdBaseDto | null >> {
                  try {
                    const newAd = await prisma.ad.create({
                         data  : {
                                ...data,
                                userId
                         }
                    })

                    return ServiceResponse.success<AdBaseDto>("Ad creatd successfully " ,  newAd , 201)
                    
                  } catch (error) {
                    logger.error(`Error creating ad : ${error}`)
                    return ServiceResponse.failure("Internal server error " , null , 500)
                  }
    }


    public async updateAd ( 
        data : UpdateAdDto 
      ) : Promise<ServiceResponse<AdBaseDto | null >> {

             try {
              const ad = await prisma.ad.findUnique({
                  where : { id : data.id  },
                  include : {
                       user : true
                  }
              })

              if(!ad) {
                return ServiceResponse.failure("Ad  not found " , null , 404)
              }

              const updatedAd = await prisma.ad.update({
                    where : { id : ad.id },
                    data : {
                           status : data.status
                    },
                    include : {
                           user : true
                    }
              })


              return ServiceResponse.success<AdBaseDto>("Ad updated succesfully" ,  updatedAd , 201)
              
             } catch (error) {
              logger.error(`Error updating ad : ${error}`)
              return ServiceResponse.failure("Internal server error " , null , 500)
             }
      }



      public async getAd ( 
         id : string 
      ) : Promise<ServiceResponse<AdBaseDto | null >> {

             try {
              const ad = await prisma.ad.findUnique({
                  where : { id : id  },
                  include : {
                       user : true
                  }
              })

              if(!ad) {
                return ServiceResponse.failure("Ad  not found " , null , 404)
              }

              return ServiceResponse.success<AdBaseDto>("OK" ,  ad , 201)
              
             } catch (error) {
              logger.error(`Error getting ad : ${error}`)
              return ServiceResponse.failure("Internal server error " , null , 500)
             }
      }



      public async deleteAd 
      ( id : string ) : Promise<ServiceResponse<AdBaseDto | null>> {
         try {


              const ad = await prisma.ad.findUnique({
                  where : { id : id  },
                  include : {
                       user : true
                  }
              })


              if(!ad) {
                        return   ServiceResponse.failure('Could not find ad' , null , 404)
              }


              await prisma.ad.delete({
                        where : { id}
              })
              

              return ServiceResponse.success<AdBaseDto>("Ad deleted successfully" ,  ad , 200)
         } catch (error) {
              logger.error(`Error deleting ad : ${error}`)
               return ServiceResponse.failure("Internal server error" , null , 500)
         }
      }


      public async getAds
       (
         status :  AdStatus
       ) : Promise<ServiceResponse<AdBaseDto[] | null>> {
       try {

              const ads = await prisma.ad.findMany({
                     where: {
                       status: {
                         in: [status] 
                       }
                     }
                   });
              return ServiceResponse.success<AdBaseDto[]>("OK" ,  ads , 200)

       } catch (error) {
              logger.error(`Error getting ads : ${error}`)
              return ServiceResponse.failure("Internal server error" , null , 500)
       }
      }
  
}

export const adService = new AdService();
