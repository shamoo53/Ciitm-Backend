import { request, response } from 'express';
import SendResponse from '../../../utils/SendResponse.mjs';
import AuthenticationSchema from './Auth.model.mjs';
import AuthConstant from './Auth.constant.mjs';
import AuthService from './Auth.service.mjs';
import StatusCodeConstant from '../../../constant/StatusCode.constant.mjs';

class AuthController {
  async SignUP_Admin(req, res) {
    try {
      const { name, email, password, role } = req.body;

      const { CreatedUser, HashEmail } = await AuthService.CreateUser({
        name,
        email,
        password,
        role,
      });

      res.cookie('token', HashEmail, {
        httpOnly: true,       // Prevent client-side JS access
        secure:true, // HTTPS only in prod
        sameSite: 'Strict',   // Prevent CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      SendResponse.success(
        res,
        200,
        AuthConstant.USER_CREATED,
        CreatedUser,
        HashEmail
      );
    } catch (error) {
      SendResponse.error(res, 500, error.message || 'Error creating admin');
    }
  }

  async Login(req = request, res = response) {
    try {
      const { email, password } = req.body;
      console.log('req.body', req.body);

      let Authentication_Instance = new AuthenticationSchema();

      let HashEmail = await Authentication_Instance.hashEmail(email);

      let Find_User = await AuthenticationSchema.findOne({ email: email });

      console.log('Find_User', Find_User);

      if (!Find_User) {
        return res.status(400).json({ message: 'User not found' });
      }

      let ComparePassword = await Authentication_Instance.comparePassword(
        password,
        Find_User.password
      );

      if (!ComparePassword) {
        return res.status(400).json({ message: 'Invalid Password' });
      }

      res.cookie('token', HashEmail, {
        httpOnly: true,     
        secure:true, 
        sameSite: 'Strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


      SendResponse.success(
        res,
        StatusCodeConstant.SUCCESS,
        AuthConstant.USER_LOGIN_SUCCESS,
        Find_User,
        HashEmail
      );
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message || 'Error logging in admin', error });
    }
  }
}

export default new AuthController();
