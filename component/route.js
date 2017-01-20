var login = require("./controller/login")
const Joi = require('joi');
var route = [
	{
		method: 'GET',
		path:'/fblogin', 
		//handler: login.fbLogin,
		config: {
			handler: function() {},
		}
	},
	{
		method: 'GET',
		path:'/facebook-callback', 
		//handler:login.fbLoginCallback,
		config: {
			handler: function() {}
		}
	},
	{
		method: 'POST',
		path:'/register',
		config: {		
			handler:login.registerUser,
			description: 'register new User',
			notes: 'register',
			tags: ['api'],
			validate: {
				payload: {
					name: Joi.string().required(),
					userId: Joi.number().required(),
					loginPortal: Joi.string().required(),
					email: Joi.string().required(),
					thumbnail: Joi.string().optional(),
					dob: Joi.string().optional(),
					nationality: Joi.string().optional(),
					sex: Joi.string().optional(),
					phoneNumber: Joi.string().optional(),
					deviceId: Joi.string().required(),
					appId: Joi.string().required(),
					os: Joi.string().optional()
				}
			}
		}
	},
	{
		method: 'POST',
		path:'/login',
		config: {		
			handler:login.loginUser,
			description: 'login User',
			notes: 'login',
			tags: ['api'],
			validate: {
				payload: {
					deviceId: Joi.string().required()
				}
			}
		}
	}
];

module.exports = route;