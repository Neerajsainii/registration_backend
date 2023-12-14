import { User } from "../models/user.model.js";
import { UserController } from "../controller/user.controller.js";


export const UserRoute = (app) => {

  //user registration

  app.post("/api/user-registration", async (req, res) => {
    try {
      const user = req.user;
      await UserController.registrationuser(req.body, user); // Check req.body
      res.status(200).send({ code: 200, message: 'user registered successfully!' });
    } catch (err) {
      res.status(500).send({ code: err.code, message: err.message });
    }
  });

  app.post("/api/user-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      const accesstoken = await UserController.GenerateUserAccessToken(email, password);
      const loginTime = new Date();

      // const user = { accesstoken, loginTime, ipAddress, location };
      if (user && accesstoken) {
        res.status(200).send({ code: 200, message: "Login Successfully", token: accesstoken });
      } else {
        res.status(404).json({ code: 404, message: 'Invalid Access Token or Admin' });
      }
    } catch (err) {
      console.error('Error:', err.message);
      res.status(err.response?.status || 500).send({ code: err.code, message: err.message });
    }
  });
  app.post("/api/user/initiate-reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      await UserController.sendResetPasswordEmail(email);
      res.status(200).send({ code: 200, message: "Password Reset Code Sent" });
    } catch (e) {
      console.error(e);
      res.status(e.code).send({ message: e.message });
    }
  });

  app.get(
    "/api/user-registration/:page", async (req, res) => {
      const page = req.params.page;
      const searchQuery = req.query.search;
      try {
        let allIntroDataLength;
        if (searchQuery) {
          console.log('first')
          let SecondArray = [];
          const users = await User.find({ userName: { $regex: new RegExp(searchQuery, "i"), }, }).exec();;
          const transferData = users.map(user => ({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            country: user.country,
            state: user.state,
            city: user.city,
            zip: user.zip,
            areaInterest: user.areaInterest,
          }));
          SecondArray = SecondArray.concat(transferData);
          allIntroDataLength = SecondArray.length;
          const pageNumber = Math.ceil(allIntroDataLength / 5);
          res.status(200).json({ SecondArray, pageNumber, allIntroDataLength });
        } else {
          console.log('second')
          let introducerUser = await User.find({}).exec();
          const transferData = introducerUser.map(user => ({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            country: user.country,
            state: user.state,
            city: user.city,
            zip: user.zip,
            areaInterest: user.areaInterest,
          }));
          let introData = JSON.parse(JSON.stringify(transferData));
          console.log('introData', introData.length)

          const SecondArray = [];
          const Limit = page * 5;
          console.log("Limit", Limit);

          for (let j = Limit - 5; j < Limit; j++) {
            SecondArray.push(introData[j]);
            console.log('lenth', SecondArray.length)
          }
          allIntroDataLength = introData.length;

          if (SecondArray.length === 0) {
            return res.status(404).json({ message: "No data found for the selected criteria." });
          }

          const pageNumber = Math.ceil(allIntroDataLength / 5);
          res.status(200).json({ SecondArray, pageNumber, allIntroDataLength });

        }
      } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Internal Server Error" });
      }
    }
  );


}