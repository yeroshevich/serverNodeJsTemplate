import {NextFunction, Response} from 'express';
import {verify} from 'jsonwebtoken';
import {SECRET_KEY} from '@config';
import {HttpException} from '@exceptions/HttpException';
import {DataStoredInToken, RequestWithUser, UserRoles} from '@interfaces/auth.interface';
import {Customer} from "@database/models/Customer";
import {Vendor} from "@database/models/Vendor";
import {CustomerDB, VendorDB} from "@interfaces/users.interface";


const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const userId:number = verificationResponse.id;
      const findedUser:{user:VendorDB|CustomerDB} = {user:null}

      if(verificationResponse.role == UserRoles.ADMIN)
        findedUser.user = await Customer.findByPk(userId)
      else if(verificationResponse.role == UserRoles.VENDOR)
        findedUser.user = await Vendor.findByPk(userId)

      if (findedUser.user) {
        req.user = findedUser.user;
        req.role=verificationResponse.role
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
